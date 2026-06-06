.PHONY: test test-v test-cover

# Barcha testlar (emoji bilan)
test:
	@go test ./internal/handlers/ -v 2>&1 \
	| sed \
		-e 's/--- PASS/✅ PASS/g' \
		-e 's/--- FAIL/❌ FAIL/g' \
		-e 's/^=== RUN/🔹 RUN/g' \
		-e 's/^ok /🎉 OK  /g' \
		-e 's/^FAIL/💥 FAIL/g'

# Bitta test (make test-one T=TestLogin)
test-one:
	@go test ./internal/handlers/ -run $(T) -v 2>&1 \
	| sed \
		-e 's/--- PASS/✅ PASS/g' \
		-e 's/--- FAIL/❌ FAIL/g' \
		-e 's/^=== RUN/🔹 RUN/g' \
		-e 's/^ok /🎉 OK  /g' \
		-e 's/^FAIL/💥 FAIL/g'

# Coverage bilan
test-cover:
	@go test ./internal/handlers/ -cover 2>&1 \
	| sed \
		-e 's/^ok /🎉 OK  /g' \
		-e 's/^FAIL/💥 FAIL/g'
