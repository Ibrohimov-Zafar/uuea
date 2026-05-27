package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"miaoda/backend/internal/middleware"
	"miaoda/backend/internal/models"
)

type API struct {
	DB             *sql.DB
	JWTSecret      string
	StripeKey      string
	FrontendOrigin string
	UploadDir      string
}

func (a *API) Signup(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
		FullName string `json:"fullName"`
		Email    string `json:"email"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	body.Username = strings.TrimSpace(body.Username)
	if len(body.Username) < 3 {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	if len(body.Password) < 8 {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	email := strings.TrimSpace(body.Email)
	if email == "" {
		email = body.Username + "@miaoda.com"
	}
	fullName := strings.TrimSpace(body.FullName)
	if fullName == "" {
		fullName = body.Username
	}

	var exists int
	_ = a.DB.QueryRow(`SELECT COUNT(1) FROM users WHERE lower(username)=lower(?) OR lower(email)=lower(?)`, body.Username, email).Scan(&exists)
	if exists > 0 {
		errJSON(w, http.StatusConflict, "already_exists")
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	id := uuid.NewString()
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := a.DB.Exec(`INSERT INTO users (id, username, email, password_hash, full_name, role, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)`,
		id, body.Username, email, string(hash), fullName, "user", now, now)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}

	prof, user := a.loadUser(id)
	token, _ := a.signToken(id, "user")
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "user": user, "profile": prof})
}

func (a *API) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Identifier string `json:"identifier"`
		Password   string `json:"password"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	ident := strings.TrimSpace(body.Identifier)
	emailTry := ident
	if !strings.Contains(ident, "@") {
		emailTry = ident + "@miaoda.com"
	}
	var hash string
	var userID, role string
	err := a.DB.QueryRow(`
		SELECT id, password_hash, role FROM users
		WHERE lower(username)=lower(?) OR lower(email)=lower(?) OR lower(email)=lower(?)
	`, ident, ident, strings.ToLower(emailTry)).Scan(&userID, &hash, &role)
	if err == sql.ErrNoRows {
		errJSON(w, http.StatusUnauthorized, "invalid_credentials")
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(body.Password)) != nil {
		errJSON(w, http.StatusUnauthorized, "invalid_credentials")
		return
	}
	prof, user := a.loadUser(userID)
	token, _ := a.signToken(userID, role)
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "user": user, "profile": prof})
}

func (a *API) Me(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	prof, user := a.loadUser(uid)
	if prof == nil {
		errJSON(w, http.StatusNotFound, "not_found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"user": user, "profile": prof})
}

func (a *API) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	var body struct {
		FullName *string `json:"full_name"`
		Phone    *string `json:"phone"`
		AvatarURL *string `json:"avatar_url"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := a.DB.Exec(`UPDATE users SET full_name=COALESCE(?, full_name), phone=COALESCE(?, phone), avatar_url=COALESCE(?, avatar_url), updated_at=? WHERE id=?`,
		body.FullName, body.Phone, body.AvatarURL, now, uid)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	prof, user := a.loadUser(uid)
	writeJSON(w, http.StatusOK, map[string]any{"user": user, "profile": prof})
}

func (a *API) ChangePassword(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	var body struct {
		Password string `json:"password"`
	}
	if err := readJSON(r, &body); err != nil || len(body.Password) < 8 {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	now := time.Now().UTC().Format(time.RFC3339)
	_, _ = a.DB.Exec(`UPDATE users SET password_hash=?, updated_at=? WHERE id=?`, string(hash), now, uid)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) signToken(userID, role string) (string, error) {
	claims := middleware.Claims{
		Sub:  userID,
		Role: role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(a.JWTSecret))
}

func (a *API) loadUser(id string) (*models.Profile, *models.ApiUser) {
	var username, email, phone, fullName, avatarURL, role, createdAt, updatedAt sql.NullString
	err := a.DB.QueryRow(`SELECT username, email, phone, full_name, avatar_url, role, created_at, updated_at FROM users WHERE id=?`, id).
		Scan(&username, &email, &phone, &fullName, &avatarURL, &role, &createdAt, &updatedAt)
	if err != nil {
		return nil, nil
	}
	prof := &models.Profile{
		ID: id, Role: role.String,
		CreatedAt: createdAt.String, UpdatedAt: updatedAt.String,
	}
	if username.Valid {
		prof.Username = &username.String
	}
	if email.Valid {
		prof.Email = &email.String
	}
	if phone.Valid {
		prof.Phone = &phone.String
	}
	if fullName.Valid {
		prof.FullName = &fullName.String
	}
	if avatarURL.Valid {
		prof.AvatarURL = &avatarURL.String
	}
	user := &models.ApiUser{ID: id, Username: username.String, Role: role.String}
	if email.Valid {
		user.Email = &email.String
	}
	return prof, user
}
