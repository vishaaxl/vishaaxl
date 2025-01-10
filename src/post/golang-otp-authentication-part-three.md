---
title: "Build an OTP-Based Authentication Server with Go: Part 3"
subtitle: Learn to create a secure OTP authentication system with Go, including OTP generation, validation, and security best practices.
author: Vishal Shukla
date: January 10, 2025
---

# Build an OTP-Based Authentication Server with Go: Part 3

In this part, we’ll implement the functionality to send OTPs to users using Twilio and introduce an optimized approach for sending OTPs asynchronously. Additionally, we’ll cover the creation of a token system to authenticate users.

## Sending OTP with Twilio

The first task is to send the OTP to the user via Twilio's messaging API. Below is the function to handle the OTP sending process.

```go
// sendOTPViaTwilio sends an OTP to the specified phone number using Twilio's messaging API.
//
// Parameters:
// - otp: The one-time password to be sent in the message body.
// - phoneNumber: The recipient's phone number without the country code.
//
// The function uses Twilio's Go SDK to create and send a message with the provided OTP.
// The `from` phone number is pre-configured to be a Twilio-registered number.
//
// Returns:
// - An error if the OTP could not be sent successfully.
// - nil if the message was sent without issues.
func (app *application) sendOTPViaTwilio(otp, phoneNumber string) error {
	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: os.Getenv("TWILIO_SID"),
		Password: os.Getenv("TWILIO_API_KEY"),
	})

	// Set up the parameters for the message.
	params := &api.CreateMessageParams{}
	params.SetBody(fmt.Sprintf(
		"Thank you for choosing Cheershare! Your one-time password is %v.",
		otp,
	))
	params.SetFrom(os.Getenv("TWILIO_PHONE_NUMBER")) // Twilio-registered phone number.
	params.SetTo(fmt.Sprintf("+91%v", phoneNumber))  // Format recipient's number with country code.

	const maxRetries = 3 // Number of retries
	var lastErr error    // Stores the last error encountered

	// Attempt to send the message with retries.
	for attempt := 1; attempt <= maxRetries; attempt++ {
		resp, err := client.Api.CreateMessage(params)
		if err == nil {
			fmt.Printf("OTP sent successfully. Twilio response SID: %v\n", resp.Sid)
			return nil
		}

		// Log the error for debugging.
		lastErr = fmt.Errorf("attempt %d: failed to send OTP via Twilio: %w", attempt, err)
		fmt.Println(lastErr)

		time.Sleep(2 * time.Second)
	}

	return fmt.Errorf("all retries failed to send OTP via Twilio: %w", lastErr)
}
```

The retry mechanism in this function ensures the OTP is sent reliably. However, a key optimization is needed. Sending OTPs sequentially will slow down the server, so we’ll leverage **goroutines** to offload the sending process to a separate routine.

## Improving Performance with Goroutines

We will use goroutines to run this task on a separate routine. Since goroutines are executed away from the main thread, we need to track the active goroutines using a `sync.WaitGroup`. This ensures that before shutting down, we can wait for all the active goroutines to finish. Let's update the `application` struct to include a `sync.WaitGroup`.

```go
type application struct {
	wg     sync.WaitGroup //updated
	config config
	models data.Models

	logger *log.Logger
	cache  *redis.Client
}
```

Next, let’s create a helper function that takes a function as a parameter and runs it using the `go` keyword.

```go
func (app *application) background(fn func()) {
	app.wg.Add(1)

	go func() {
		defer app.wg.Done()

		defer func() {
			if err := recover(); err != nil {
				app.logger.Printf("Error in background function: %v\n", err)
			}
		}()

		fn()
	}()
}
```

We can now use these two together to send OTPs to users asynchronously. But when authenticating users, we also need to send tokens. Let's create a new table in our database to store the tokens for each user.

### Creating the Token Table in Database

```sh
 migrate create -ext=.sql -seq -dir=./migrations create-token
```

Add the follwing code to the `000002_create-token.up` and `000002_create-token.down` file:

```sql
-- 000002_create-token.up.sql

CREATE TABLE IF NOT EXISTS tokens (
    hash bytea PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users ON DELETE CASCADE,
    expiry timestamp(0) with time zone NOT NULL,
    scope text NOT NULL
);
```

```sql
-- 000002_create-token.down.sql
DROP  TABLE  IF  EXISTS tokens;
```

Explanation: The `tokens` table will store token data for each user, including the hashed token, associated user ID, expiry time, and scope.

### Migrating the Database

```sh
migrate -path=./migrations -database="postgres://user:mysecretpassword@localhost:5432/cheershare?sslmode=disable" up
```

### Token Model and Functions

Now, we’ll create the necessary functions to handle token generation, insertion, and retrieval. In the `internals/data/models.go` file, add the following code:

```go
package data

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base32"
	"time"
)

const (
	ScopeAuthentication = "authentication"
)

type Token struct {
	Plaintext string    `json:"plaintext"`
	Hash      []byte    `json:"-"`
	UserId    int64     `json:"-"`
	Expiry    time.Time `json:"expiry"`
	Scope     string    `json:"-"`
}

type TokenModel struct {
	DB *sql.DB
}

/*
Function Parameters:
  - userId (int64): The unique identifier for the user for whom the token is being generated.
  - ttl (time.Duration): The time-to-live for the token, defining its expiry duration.
  - scope (string): The scope or purpose of the token (e.g., authentication, API access).

Return Values:
  - (*Token): A pointer to the generated Token structure, which contains:
  - UserId: The ID of the user associated with the token.
  - Expiry: The exact timestamp when the token will expire.
  - Scope: The defined purpose or scope of the token.
  - Plaintext: The plain, readable token string (used before hashing).
  - Hash: The SHA-256 hash of the plain token for secure storage/verification.
  - (error): An error object if token generation fails at any point.
*/
func generateToken(userId int64, ttl time.Duration, scope string) (*Token, error) {
	token := &Token{
		UserId: userId,
		Expiry: time.Now().Add(ttl),
		Scope:  scope,
	}

	randomBytes := make([]byte, 16)

	_, err := rand.Read(randomBytes)
	if err != nil {
		return nil, err
	}

	token.Plaintext = base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(randomBytes)
	hash := sha256.Sum256([]byte(token.Plaintext))
	token.Hash = hash[:]

	return token, nil

}

func (m TokenModel) Insert(token *Token) error {
	query := `INSERT INTO tokens (hash, user_id, expiry, scope)
	VALUES ($1, $2, $3, $4)`

	args := []interface{}{token.Hash, token.UserId, token.Expiry, token.Scope}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, args...)
	return err
}

func (m TokenModel) DeleteAllForUser(scope string, userID int64) error {
	query := `DELETE FROM tokens  WHERE user_id = $1 AND scope = $2`

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, userID, scope)
	return err
}

func (m TokenModel) New(userId int64, ttl time.Duration, scope string) (*Token, error) {
	token, err := generateToken(userId, ttl, scope)
	if err != nil {
		return nil, err
	}

	err = m.Insert(token)
	return token, err
}

```

Explanation: This code defines the `TokenModel` struct and methods for generating and storing authentication tokens. The `New` function generates a new token, hashes it, and inserts it into the `tokens` table.

Don't forget to add this model to the `models` repository we defined earlier.

### Updating the `signup` Handler

Only thing we need to do now if when we have verified otp, issue a new token and send it to user, **New** function will take care of inserting it into the db.

Let's also update the `signup` handler, right now we are using to different routes to send and verify otp, but when a user is already registred we don't really need to send an error, instead we can check if a user is already presend and based on thwt we can either follow the login flow or signup flow. open the `cmd/api/user.go` and add the following code.

```go
/*
generateOTP generates a 4-digit OTP using a secure random number generator.
The function creates a random byte array and uses modulus operation to generate
a number between 0 and 9999. The result is formatted into a zero-padded string
to ensure it is always 4 digits long.
*/
func generateOTP() string {
	otp := make([]byte, 2)

	_, err := rand.Read(otp)
	if err != nil {
		log.Fatal("Error generating OTP:", err)
	}
	return fmt.Sprintf("%04d", int(otp[0])%10000)
}

/*
storeOTPInRedis stores user data, including the OTP, into Redis.
It uses the phone number as the key and stores the data as a hash.
A timeout context is created to prevent blocking indefinitely, and
the key is set to expire after 5 minutes to ensure security.
*/
func (app *application) storeOTPInRedis(ctx context.Context, phoneNumber, name, otp string) error {
	userData := map[string]string{
		"name": name,
		"otp":  otp,
	}

	err := app.cache.HSet(ctx, phoneNumber, userData).Err()
	if err != nil {
		return fmt.Errorf("failed to store user data in Redis: %w", err)
	}

	err = app.cache.Expire(ctx, phoneNumber, 5*time.Minute).Err()
	if err != nil {
		return fmt.Errorf("failed to set expiration for Redis key: %w", err)
	}

	return nil
}

/*
verifyOTPInRedis retrieves user data from Redis and validates the provided OTP.
It ensures that the OTP matches the value stored in Redis for the given phone number.
If the OTP is invalid or the key does not exist, an error is returned.
*/
func (app *application) verifyOTPInRedis(ctx context.Context, phoneNumber, otp string) (string, error) {
	userData, err := app.cache.HGetAll(ctx, phoneNumber).Result()
	if err != nil || len(userData) == 0 {
		return "", fmt.Errorf("invalid or expired OTP")
	}

	storedOTP := userData["otp"]
	if otp != storedOTP {
		return "", fmt.Errorf("invalid OTP")
	}

	return userData["name"], nil
}

/*
createUserIfNotExists checks if a user already exists in the database for the provided phone number.
If the user exists, their record is returned. Otherwise, a new user is created with the given name
and phone number. Any errors during database operations are propagated back to the caller.
*/
func (app *application) createUserIfNotExists(phoneNumber, name string) (*data.User, error) {
	user, err := app.models.User.GetByPhoneNumber(phoneNumber)
	if err == nil && user != nil {
		return user, nil
	}

	newUser := data.User{
		Name:        name,
		PhoneNumber: phoneNumber,
	}

	err = app.models.User.Insert(&newUser)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &newUser, nil
}

/*
generateTokenForUser creates a new authentication token for the given user ID.
The token is valid for 48 hours and is associated with the "authentication" scope.
If token generation fails, an error is returned to the caller.
*/
func (app *application) generateTokenForUser(userID int64) (string, error) {
	token, err := app.models.Token.New(userID, 48*time.Hour, data.ScopeAuthentication)
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	return token.Plaintext, nil
}

/*
handleUserSignupAndVerification manages both user signup and OTP verification.
It combines the following functionality:
1. If OTP is not provided, it generates a new OTP and sends it to the user.
2. If OTP is provided, it validates the OTP and registers or retrieves the user.
3. Once the user is verified, an authentication token is created and sent as a response.

The process includes:
 1. Parsing and validating input data.
 2. Interacting with Redis for OTP storage and retrieval.
 3. Ensuring user data is either created or retrieved from the database.
 4. Generating an authentication token for successful verification.
 5. Returning appropriate error responses for any issues encountered.
*/
func (app *application) handleUserSignupAndVerification(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name        string `json:"name"`
		PhoneNumber string `json:"phone_number"`
		OTP         string `json:"otp"`
	}

	/*
		Read JSON from the request body.
		If an error occurs while reading, respond with a bad request error and log the issue.
	*/
	err := app.readJSON(w, r, &input)
	if err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid request payload")
		app.logger.Println("Error reading JSON:", err)
		return
	}

	/*
		Validate required fields:
		- Phone number is always required.
		- Name is required only for OTP generation.
	*/
	if input.PhoneNumber == "" {
		app.errorResponse(w, http.StatusBadRequest, "Phone number is required")
		return
	}

	if input.OTP == "" {
		/*
			OTP is not provided; generate a new OTP.
			1. Validate that the name is provided (required for OTP generation).
			2. Generate a new OTP.
			3. Store the OTP and name in Redis using the phone number as the key.
			4. Set an expiration time of 5 minutes for the Redis entry.
			5. Return a success response indicating the OTP was sent.
		*/
		if input.Name == "" {
			app.errorResponse(w, http.StatusBadRequest, "Name is required for OTP generation")
			return
		}

		otp := generateOTP()

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		err = app.storeOTPInRedis(ctx, input.PhoneNumber, input.Name, otp)
		if err != nil {
			app.errorResponse(w, http.StatusInternalServerError, "Failed to store OTP")
			app.logger.Println("Error storing OTP in Redis:", err)
			return
		}

		app.background(func() {
			err := app.sendOTPViaTwilio(otp, input.PhoneNumber)
			if err != nil {
				app.logger.Println("Error sending OTP via Twilio:", err)
			}
		})

		app.writeJSON(w, http.StatusOK, envelope{"success": true, "message": "OTP sent successfully"}, nil)
		return
	}

	/*
		OTP is provided; verify the OTP and proceed with user registration.
		1. Retrieve the stored OTP and user data from Redis using the phone number as the key.
		2. Validate the provided OTP against the stored OTP.
		3. If valid:
			a. Create or fetch the user in the database.
			b. Generate an authentication token for the user.
			c. Return a success response with user details and the token.
		4. If invalid, respond with an error indicating the OTP is invalid or expired.
	*/
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userName, err := app.verifyOTPInRedis(ctx, input.PhoneNumber, input.OTP)
	if err != nil {
		app.errorResponse(w, http.StatusUnauthorized, "Invalid or expired OTP")
		app.logger.Println("OTP verification failed for", input.PhoneNumber, ":", err)
		return
	}

	user, err := app.createUserIfNotExists(input.PhoneNumber, userName)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to register user")
		app.logger.Println("Error registering user:", err)
		return
	}

	token, err := app.generateTokenForUser(user.ID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to generate authentication token")
		app.logger.Println("Error generating token for user ID", user.ID, ":", err)
		return
	}

	app.writeJSON(w, http.StatusOK, envelope{
		"success": true,
		"data":    user,
		"message": "User registered successfully",
		"token":   token,
	}, nil)
}
```

### 1. **Introducing the Middleware Layers**

To start, we’ll set up three key middlewares that ensure our app handles requests securely and consistently:

#### **`recoverPanic` Middleware**

The first middleware we’ll implement is the `recoverPanic` middleware. It’s a safety net for your application, catching any panics during request processing. If something goes wrong and causes a panic, it ensures the server doesn’t crash and provides a meaningful error response.

**Explanation**:

The `defer` block ensures that even if something breaks, we catch it, log it, and return a 500 Internal Server Error. We use this middleware to protect all the routes, so the application doesn’t crash in case of unforeseen errors.

#### **`authenticate` Middleware**

Next up is the `authenticate` middleware, which checks if the request has a valid Bearer token in the `Authorization` header. If the token is valid, we fetch the associated user from the database and attach them to the request’s context for further use.

**Explanation**:

The middleware checks if the `Authorization` header contains a Bearer token. It validates the token, retrieves the user associated with it, and attaches the user data to the request context. If the token is invalid, we return a `401 Unauthorized` response.

#### **`requireAuthenticatedUser` Middleware**

For routes that require authentication, we use the `requireAuthenticatedUser` middleware to ensure the user is authenticated before allowing access.

**Explanation**:

This middleware checks the user attached to the request. If the user is anonymous (i.e., not authenticated), the middleware returns a `401 Unauthorized` error. If the user is authenticated, it proceeds to the next handler.

```go
package main

import (
	"errors"
	"net/http"
	"strings"

	"github.com/vishaaxl/cheershare/internal/data"
)

func (app *application) recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				w.Header().Set("Connection", "close")
				app.errorResponse(w, http.StatusInternalServerError, "Failed to recover")
			}
		}()

		next.ServeHTTP(w, r)
	})
}

func (app *application) authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Add the "Vary: Authorization" header to the response. This indicates to any
		// caches that the response may vary based on the value of the Authorization
		// header in the request.
		w.Header().Add("Vary", "Authorization")

		// Retrieve the value of the Authorization header from the request. This will
		// return the empty string "" if there is no such header found.
		authorizationHeader := r.Header.Get("Authorization")
		// If there is no Authorization header found, use the contextSetUser() helper
		// that we just made to add the AnonymousUser to the request context. Then we
		// call the next handler in the chain and return without executing any of the
		// code below.
		if authorizationHeader == "" {
			r = app.contextSetUser(r, data.AnonymousUser)
			next.ServeHTTP(w, r)
			return
		}

		headerParts := strings.Split(authorizationHeader, " ")
		if len(headerParts) != 2 || headerParts[0] != "Bearer" {
			app.errorResponse(w, http.StatusUnauthorized, "Invalid authorization header")
			return
		}

		token := headerParts[1]
		if len(token) != 26 {
			app.errorResponse(w, http.StatusUnauthorized, "Invalid authorization header")
			return
		}
		// validate the token for length and required params

		user, err := app.models.User.GetForToken(data.ScopeAuthentication, token)

		if err != nil {
			switch {
			case errors.Is(err, data.ErrRecordNotFound):
				app.errorResponse(w, http.StatusUnauthorized, "Invalid authorization header")
			default:
				app.errorResponse(w, http.StatusInternalServerError, "Can't find user for specified token")
			}
			return
		}

		r = app.contextSetUser(r, user)
		next.ServeHTTP(w, r)
	})
}

func (app *application) requireAuthenticatedUser(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		user := app.contextGetUser(r)

		if user.IsAnonymous() {
			app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		next.ServeHTTP(w, r)
	})
}

```

### 2. **Context Management: Storing and Retrieving User Data**

Now, let's dive into how we handle user data throughout the application. We use Go’s `context` package to attach user information to each request.

Create a new file in `context.gpo` in `cmd/api` directory and add the following code.

```go
package main

import (
	"context"
	"net/http"

	"github.com/vishaaxl/cheershare/internal/data"
)

// contextKey is a custom type to avoid conflicts with other context keys in the application.
type contextKey string

// userContextKey is the key used to store and retrieve user information from the context.
const userContextKey = contextKey("cheershare.user")

// contextSetUser associates a given user object with the request's context.
//
// Parameters:
// - r: The incoming HTTP request.
// - user: A pointer to a data.User object that represents the authenticated user.
//
// Returns:
// - *http.Request: A new HTTP request with the user data stored in the context.
//
// Usage:
// This function is typically used after authenticating a user to attach the user information
// to the request, enabling downstream handlers to access the user data.
func (app *application) contextSetUser(r *http.Request, user *data.User) *http.Request {
	// Add the user to the context of the incoming request.
	ctx := context.WithValue(r.Context(), userContextKey, user)
	return r.WithContext(ctx)
}

// contextGetUser retrieves the user object from the request's context.
//
// Parameters:
// - r: The incoming HTTP request.
//
// Returns:
// - *data.User: A pointer to the user object stored in the context.
//
// Panics:
// If the user data is not present in the context or cannot be cast to *data.User,
// the function will panic with the message "missing user context."
//
// Usage:
// This function is used to access the user data attached to the request's context.
// It is generally called in handlers that need user-specific information.
func (app *application) contextGetUser(r *http.Request) *data.User {
	// Retrieve the user from the request context.
	user, ok := r.Context().Value(userContextKey).(*data.User)
	if !ok {
		panic("missing user context")
	}
	return user
}

```

### 3. **Server Configuration: Putting It All Together**

only thinng left for us to do is to use these middlewares, if you have any protected routes u can use `requireAuthetincayted` like:

```go
router.HandlerFunc(http.MethodGet, "/protected", app.requireAuthenticatedUser(func(w http.ResponseWriter, r *http.Request) {
	err := app.writeJSON(w, http.StatusOK, envelope{"data": "Protected"}, nil)
	if err != nil {
		app.logger.Println(err)
		w.WriteHeader(500)
	}
}))
```

The `recoverPanic` and `authenticate` middlewares are applied globally to all routes.

```go
/*
	  Server configuration:
	  - Address: Uses the configured port from `config`.
	  - Handler: Routes handled by `httprouter`.
	  - Timeouts: Configured for idle, read, and write operations.
	  - Error logging: Logs errors during server startup or operation.
*/
srv := &http.Server{
	Addr:         fmt.Sprintf(":%d", app.config.port),
	Handler:      app.recoverPanic(app.authenticate(router)),
	IdleTimeout:  time.Minute,
	ReadTimeout:  10 * time.Second,
	WriteTimeout: 30 * time.Second,
}
```

### 4. **Next Steps: Enhancements and Features**

In the next sections, we will enhance this authentication system by adding file uploading, graceful shutdown for the server, and integrating metrics for better monitoring.

Here’s what’s coming next:

- **File Uploading**: Learn how to implement file uploads and handle large files efficiently.
- **Metrics**: Collect and monitor vital metrics for your application, such as request counts, response times, and error rates.
- **Graceful Shutdown**: Ensure that your server shuts down gracefully, allowing for active connections to complete.

You can find the complete code for this tutorial on GitHub: [Cheershare GitHub](https://github.com/vishaaxl/cheershare).

Part 1: https://dev.to/vishaaxl/build-an-otp-based-authentication-server-with-go-part-1-760
Part 2: [https://dev.to/vishaaxl/build-an-otp-based-authentication-server-with-go-part-2-54gn](https://dev.to/vishaaxl/build-an-otp-based-authentication-server-with-go-part-2-54gn)

I’ve done my best to provide the most effective code and explanations, but if you think there’s anything I’ve overlooked or missed, please feel free to comment.
