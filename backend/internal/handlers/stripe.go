package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"

	"miaoda/backend/internal/middleware"
)

func (a *API) StripeCheckout(w http.ResponseWriter, r *http.Request) {
	if a.StripeKey == "" {
		errJSON(w, http.StatusServiceUnavailable, "stripe_not_configured")
		return
	}
	stripe.Key = a.StripeKey

	var body map[string]any
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	planSlug, _ := body["plan_slug"].(string)
	if planSlug == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}

	var name string
	var price float64
	err := a.DB.QueryRow(`SELECT name, price_usd FROM membership_plans WHERE slug=?`, planSlug).Scan(&name, &price)
	if err != nil || price <= 0 {
		errJSON(w, http.StatusNotFound, "plan_not_found")
		return
	}

	userID, _ := body["user_id"].(string)
	if userID == "" {
		userID = middleware.UserID(r)
	}
	customerEmail, _ := body["customer_email"].(string)
	customerName, _ := body["customer_name"].(string)

	items, _ := json.Marshal([]map[string]any{{"name": name, "price": price, "quantity": 1, "plan_slug": planSlug}})
	orderID := uuid.NewString()
	now := time.Now().UTC().Format(time.RFC3339)
	_, _ = a.DB.Exec(`INSERT INTO orders (id, user_id, items, total_amount, currency, status, customer_email, customer_name, created_at, updated_at) VALUES (?,?,?,?,?,'pending',?,?,?,?)`,
		orderID, nullIfEmpty(userID), string(items), price, "usd", customerEmail, customerName, now, now)

	origin := r.Header.Get("Origin")
	if origin == "" {
		origin = a.FrontendOrigin
	}
	successURL, _ := body["success_url"].(string)
	if successURL == "" {
		successURL = origin + "/payment-success?session_id={CHECKOUT_SESSION_ID}"
	}
	cancelURL, _ := body["cancel_url"].(string)
	if cancelURL == "" {
		cancelURL = origin + "/qoshilish"
	}

	params := &stripe.CheckoutSessionParams{
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),
		LineItems: []*stripe.CheckoutSessionLineItemParams{{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency: stripe.String("usd"),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
					Name: stripe.String(name + " A'zolik — Yillik"),
				},
				UnitAmount: stripe.Int64(int64(price * 100)),
			},
			Quantity: stripe.Int64(1),
		}},
	}
	if customerEmail != "" {
		params.CustomerEmail = stripe.String(customerEmail)
	}
	params.AddMetadata("order_id", orderID)
	params.AddMetadata("plan_slug", planSlug)
	if userID != "" {
		params.AddMetadata("user_id", userID)
	}

	sess, err := session.New(params)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "stripe_error")
		return
	}
	_, _ = a.DB.Exec(`UPDATE orders SET stripe_session_id=? WHERE id=?`, sess.ID, orderID)
	writeJSON(w, http.StatusOK, map[string]any{"url": sess.URL, "data": map[string]any{"url": sess.URL}})
}

func (a *API) StripeVerifyPayment(w http.ResponseWriter, r *http.Request) {
	if a.StripeKey == "" {
		errJSON(w, http.StatusServiceUnavailable, "stripe_not_configured")
		return
	}
	stripe.Key = a.StripeKey
	var body struct {
		SessionID string `json:"session_id"`
	}
	if err := readJSON(r, &body); err != nil || body.SessionID == "" {
		sessionID := r.URL.Query().Get("session_id")
		if sessionID == "" {
			errJSON(w, http.StatusBadRequest, "invalid_input")
			return
		}
		body.SessionID = sessionID
	}
	sess, err := session.Get(body.SessionID, nil)
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_session")
		return
	}
	orderID := sess.Metadata["order_id"]
	planSlug := sess.Metadata["plan_slug"]
	userID := sess.Metadata["user_id"]
	eventID := sess.Metadata["event_id"]
	now := time.Now().UTC().Format(time.RFC3339)
	if sess.PaymentStatus == stripe.CheckoutSessionPaymentStatusPaid {
		piID := ""
		if sess.PaymentIntent != nil {
			piID = sess.PaymentIntent.ID
		}
		_, _ = a.DB.Exec(`UPDATE orders SET status='completed', completed_at=?, stripe_payment_intent_id=? WHERE id=?`,
			now, piID, orderID)
		if userID != "" && planSlug != "" {
			mid := uuid.NewString()
			expires := time.Now().UTC().AddDate(1, 0, 0).Format(time.RFC3339)
			_, _ = a.DB.Exec(`INSERT INTO memberships (id, user_id, plan_slug, status, starts_at, expires_at, created_at, updated_at) VALUES (?,?,?,'active',?,?,?,?)`,
				mid, userID, planSlug, now, expires, now, now)
		}

		// Event payment: confirm registration and decrement spots once
		if eventID != "" && orderID != "" {
			var prev string
			_ = a.DB.QueryRow(`SELECT payment_status FROM event_registrations WHERE order_id=? LIMIT 1`, orderID).Scan(&prev)
			if prev != "paid" {
				amtPaid := float64(0)
				if sess.AmountTotal > 0 {
					amtPaid = float64(sess.AmountTotal) / 100.0
				}
				_, _ = a.DB.Exec(`UPDATE event_registrations SET status='confirmed', payment_status='paid', amount_paid=? WHERE order_id=?`,
					amtPaid, orderID)
				_, _ = a.DB.Exec(`UPDATE events SET spots_remaining=spots_remaining-1 WHERE id=? AND spots_remaining>0`, eventID)
			}
		}
	}
	verified := sess.PaymentStatus == stripe.CheckoutSessionPaymentStatusPaid
	amount := int64(0)
	if sess.AmountTotal > 0 {
		amount = sess.AmountTotal
	}
	email := ""
	if sess.CustomerDetails != nil && sess.CustomerDetails.Email != "" {
		email = sess.CustomerDetails.Email
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"verified":      verified,
		"status":        sess.PaymentStatus,
		"order_id":      orderID,
		"amount":        amount,
		"currency":      string(sess.Currency),
		"customerEmail": email,
	})
}

func (a *API) EventCheckout(w http.ResponseWriter, r *http.Request) {
	var body map[string]any
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	eventID, _ := body["event_id"].(string)
	if eventID == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	var price float64
	var spots int
	err := a.DB.QueryRow(`SELECT price_usd, spots_remaining FROM events WHERE id=?`, eventID).Scan(&price, &spots)
	if err != nil || spots <= 0 {
		errJSON(w, http.StatusBadRequest, "event_unavailable")
		return
	}
	if price <= 0 {
		regID := uuid.NewString()
		now := time.Now().UTC().Format(time.RFC3339)
		userID, _ := body["user_id"].(string)
		_, _ = a.DB.Exec(`INSERT INTO event_registrations (id, event_id, user_id, full_name, email, phone, company, status, payment_status, created_at)
			VALUES (?,?,?,?,?,?,?,?,'free',?)`,
			regID, eventID, nullIfEmpty(userID), str(body["customer_name"]), str(body["customer_email"]),
			str(body["customer_phone"]), str(body["company"]), "confirmed", now)
		_, _ = a.DB.Exec(`UPDATE events SET spots_remaining=spots_remaining-1 WHERE id=? AND spots_remaining>0`, eventID)
		writeJSON(w, http.StatusOK, map[string]any{"free": true})
		return
	}
	if a.StripeKey == "" {
		errJSON(w, http.StatusServiceUnavailable, "stripe_not_configured")
		return
	}

	// Paid event: create order + pending registration + Stripe Checkout Session
	stripe.Key = a.StripeKey
	now := time.Now().UTC().Format(time.RFC3339)
	userID, _ := body["user_id"].(string)
	customerEmail := str(body["customer_email"])
	customerName := str(body["customer_name"])
	customerPhone := str(body["customer_phone"])
	company := str(body["company"])

	var evTitle string
	_ = a.DB.QueryRow(`SELECT title FROM events WHERE id=?`, eventID).Scan(&evTitle)
	if strings.TrimSpace(evTitle) == "" {
		evTitle = "Event"
	}

	items, _ := json.Marshal([]map[string]any{{"name": evTitle, "price": price, "quantity": 1, "event_id": eventID}})
	orderID := uuid.NewString()
	_, _ = a.DB.Exec(`INSERT INTO orders (id, user_id, items, total_amount, currency, status, customer_email, customer_name, metadata, created_at, updated_at) VALUES (?,?,?,?,?,'pending',?,?,?, ?, ?)`,
		orderID, nullIfEmpty(userID), string(items), price, "usd", customerEmail, customerName, `{"kind":"event"}`, now, now)

	regID := uuid.NewString()
	_, _ = a.DB.Exec(`INSERT INTO event_registrations (id, event_id, user_id, full_name, email, phone, company, status, payment_status, order_id, amount_paid, created_at)
		VALUES (?,?,?,?,?,?,?,'pending','pending',?,0,?)`,
		regID, eventID, nullIfEmpty(userID), customerName, customerEmail, customerPhone, company, orderID, now)

	origin := r.Header.Get("Origin")
	if origin == "" {
		origin = a.FrontendOrigin
	}
	successURL, _ := body["success_url"].(string)
	if successURL == "" {
		successURL = origin + "/event-payment-success?session_id={CHECKOUT_SESSION_ID}"
	}
	cancelURL, _ := body["cancel_url"].(string)
	if cancelURL == "" {
		cancelURL = origin + "/tadbirlar"
	}

	params := &stripe.CheckoutSessionParams{
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),
		LineItems: []*stripe.CheckoutSessionLineItemParams{{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency: stripe.String("usd"),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
					Name: stripe.String(evTitle),
				},
				UnitAmount: stripe.Int64(int64(price * 100)),
			},
			Quantity: stripe.Int64(1),
		}},
	}
	if customerEmail != "" {
		params.CustomerEmail = stripe.String(customerEmail)
	}
	params.AddMetadata("order_id", orderID)
	params.AddMetadata("event_id", eventID)
	if userID != "" {
		params.AddMetadata("user_id", userID)
	}

	sess, err := session.New(params)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "stripe_error")
		return
	}
	_, _ = a.DB.Exec(`UPDATE orders SET stripe_session_id=? WHERE id=?`, sess.ID, orderID)
	writeJSON(w, http.StatusOK, map[string]any{"url": sess.URL})
}

func (a *API) SendEmail(w http.ResponseWriter, r *http.Request) {
	// Placeholder: integrate SMTP/SendGrid later
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func nullIfEmpty(s string) any {
	if s == "" {
		return nil
	}
	return s
}

// StripeKey on API struct