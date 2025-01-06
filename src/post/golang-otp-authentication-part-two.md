title: "Build an OTP-Based Authentication Server with Go: Part 2"
subtitle: Learn to create a secure OTP authentication system with Go, including OTP generation, validation, and security best practices.
author: Vishal Shukla
date: January 6, 2025

In this part, we will focus on the application's core functionality, such as sending and verifying OTPs. If you haven't already, I recommend reading [Part 1](https://dev.to/vishaaxl/build-an-otp-based-authentication-server-with-go-part-1-760) before continuing.

### Setting Up the Database

To store users, we will use a PostgreSQL database. We'll define the necessary migrations using the `migrate` tool. Follow these steps to set up the database:

1.  **Create the Migration File**  
    In the root folder of your project, run the following command to create a migration for the `users` table:

    ```sh
    migrate create -ext=.sql -seq -dir=./migrations create-user-table
    ```

    **Explanation**:

    - `-ext=.sql`: Specifies that the migration files should be created with the `.sql` extension.
    - `-seq`: Ensures the migration files are created with a sequential numbering system.
    - `-dir=./migrations`: Specifies the directory where migration files will be stored.

    This command generates two files in the `./migrations` directory:

    - `000001_create-user-table.up.sql` (for creating the table)
    - `000001_create-user-table.down.sql` (for rolling back the changes).

2.  **Define the User Schema**

    Open the `000001_create-user-table.up.sql` file and add the following SQL commands:

    ```sql
    -- 000001_create-user-table.up.sql

    CREATE TABLE IF NOT EXISTS users (
        id bigserial PRIMARY KEY,
        created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
        name text NOT NULL,
        phone_number text UNIQUE NOT NULL,
        version integer NOT NULL DEFAULT 1
    );
    ```

    **Explanation**:

    - `id`: A unique identifier for each user, auto-incremented using `bigserial`.
    - `created_at`: A timestamp recording when the user was created. The default value is the current timestamp.
    - `name`: The user's name, stored as text.
    - `phone_number`: The user's phone number, stored as unique text. This ensures no two users have the same phone number.
    - `version`: An integer column, initialized to `1`, to manage optimistic concurrency control if needed in future updates.

    In the `000001_create-user-table.down.sql` file, add the following SQL command to drop the table if needed:

    ```sql
    -- 000001_create-user-table.down.sql

    DROP TABLE IF EXISTS users;
    ```

3.  **Apply the Migration**

    To apply the migration to your PostgreSQL database, run the following command:

    ```sh
    migrate -path=./migrations -database="postgres://user:mysecretpassword@localhost:5432/cheershare?sslmode=disable" up
    ```

    **Explanation**:

    - `-path=./migrations`: Specifies the path where migration files are located.
    - `-database`: Specifies the connection string for the PostgreSQL database. Replace the values as needed:
      - `user`: Your database username (e.g., `postgres`).
      - `password`: Your database password (e.g., `mysecretpassword`).
      - `dbname`: The name of your database (e.g., `cheershare`).
      - `sslmode=disable`: Disables SSL for local development.

### Adding Helper Functions for User Operations

Next, we’ll define helper functions to insert a user into the database and fetch a user by their phone number. These functions will allow us to interact with the `users` table efficiently.

#### 1. Define `User` Struct and Helper Methods

Create a file named `internal/data/user.go` and add the following code:

```go
package data

import (
	"context"
	"database/sql"
	"time"
)

type User struct {
	ID          int64     `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	Name        string    `json:"name"`
	PhoneNumber string    `json:"phone_number"`
	Version     int       `json:"version"`
}

type UserModel struct {
	DB *sql.DB
}

func (m UserModel) Insert(user *User) error {
	query := `
		INSERT INTO users (name, phone_number)
		VALUES ($1, $2)
		RETURNING id, created_at, version
	`

	args := []interface{}{user.Name, user.PhoneNumber}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&user.ID, &user.CreatedAt, &user.Version)
	if err != nil {
		return err
	}

	return nil
}

func (m UserModel) GetByPhoneNumber(PhoneNumber string) (*User, error) {
	query := `
		SELECT id, created_at, name, phone_number, version
        FROM users
        WHERE phone_number = $1
	`

	var user User

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, PhoneNumber).Scan(&user.ID, &user.CreatedAt, &user.Name, &user.PhoneNumber, &user.Version)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

```

**Explanation**:

- **Struct `User`**: Represents a single user in the database. The JSON tags allow the struct to be serialized to JSON when needed.
- **`Insert` Method**:
  - Adds a new user to the database.
  - Uses `RETURNING` to fetch the `id`, `created_at`, and `version` of the inserted user.
  - A context with a 3-second timeout ensures the query does not hang indefinitely.
- **`GetByPhoneNumber` Method**:
  - Fetches a user by their phone number.
  - Uses a SQL query with a `WHERE` clause to ensure the correct user is retrieved.
  - Scans the result into a `User` struct.

#### 2. Define a Central Repository for Models

Create a file named `internal/data/models.go` to define a central repository for all database models:

```go
package data

import "database/sql"

type Models struct {
	User UserModel
}

func NewModels(db *sql.DB) Models {
	return Models{
		User: UserModel{
			DB: db,
		},
	}
}

```

**Explanation**:

- **`Models` Struct**: Groups all models into a single struct. This design pattern simplifies access to database operations and improves maintainability.
- **`NewModels` Function**: Instantiates the `Models` struct and assigns the database connection to each model. You can expand this to include other models as needed.

With these changes, you now have:

1.  A `UserModel` for interacting with the `users` table.
2.  Helper methods to insert and retrieve users by phone number.
3.  A central repository (`Models`) to manage all database models efficiently.

### 1. Update the `application` Struct

The `application` struct in `main.go` is updated to include:

- **`models`**: A central repository for database models, initialized with `data.NewModels(db)`.

Additionally, we define routes for the new functionalities:

- **`/signup`**: Handles user signup and OTP generation.
- **`/verify`**: Verifies the OTP and registers the user.

Updated snippet from `main.go`:

```go
// main.go

app := &application{
		config: *cfg,
		logger: logger,
		cache:  redisClient,
		models: data.NewModels(db),
}

router  :=  httprouter.New()
router.HandlerFunc(http.MethodPost, "/signup", app.signupUserHandler)
router.HandlerFunc(http.MethodPost, "/verify", app.verifyAndRegisterUserHandler)

```

### 2. OTP Generation and Signup Logic

#### Method: `signupUserHandler`

- **Purpose**: Handles user signup and sends an OTP.
- **Steps**:
  1.  Parse the JSON request body to extract the `name` and `phone_number`.
  2.  Validate the input and check if the phone number is already registered.
  3.  Generate a random 4-digit OTP using `crypto/rand`.
  4.  Store the OTP and name in Redis with the phone number as the key, setting a 5-minute expiration.
  5.  Log the OTP for debugging (in production, the OTP would be sent via SMS or email).
  6.  Respond with a success message.

```go

func (app *application) signupUserHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name        string `json:"name"`
		PhoneNumber string `json:"phone_number"`
	}

	/*
		Read JSON from request body.
		If an error occurs while reading, respond with a bad request error and log the issue.
	*/
	err := app.readJSON(w, r, &input)
	if err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid request payload")
		app.logger.Println("Error reading JSON:", err)
		return
	}

	/*
		Ensure name and phone number are provided in the request.
		If any of them is missing, respond with a bad request error.
	*/
	if input.Name == "" || input.PhoneNumber == "" {
		app.errorResponse(w, http.StatusBadRequest, "Name and phone number are required")
		return
	}

	/*
		Check if the user with provided phone number is already registered
	*/
	user, err := app.models.User.GetByPhoneNumber(input.PhoneNumber)
	if err == nil && user != nil {
		app.errorResponse(w, http.StatusConflict, "User already exists with the given phone number")
		return
	}

	otp := generateOTP()

	/*
		Create a map to store the user data (name and OTP) in Redis.
		We are using the phone number as the key.
	*/
	userData := map[string]string{
		"name": input.Name,
		"otp":  otp,
	}

	/*
		Set a timeout for Redis operations to prevent blocking indefinitely.
		If Redis operations fail, respond with an internal server error and log the issue.
	*/
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Store user data in Redis using a hash
	err = app.cache.HSet(ctx, input.PhoneNumber, userData).Err()
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to store user data")
		app.logger.Println("Error storing user data in Redis:", err)
		return
	}

	/*
		Set an expiration time of 5 minutes for the Redis entry.
		This ensures the OTP will expire after 5 minutes for security purposes.
	*/
	err = app.cache.Expire(ctx, input.PhoneNumber, time.Minute*5).Err()
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to set expiration for user data")
		app.logger.Println("Error setting expiration for Redis key:", err)
		return
	}

	// Log the OTP generation
	app.logger.Println("Generated OTP for", input.PhoneNumber, ":", otp)

	/*
		Respond with a success message indicating the OTP has been sent successfully.
		The response includes a JSON object with a success flag and a message.
	*/
	app.writeJSON(w, http.StatusOK, envelope{"success": true, "message": "OTP sent successfully"}, nil)
}

```

### 3. OTP Verification and User Registration

#### Method: `verifyAndRegisterUserHandler`

- **Purpose**: Verifies the OTP and registers the user in the database.
- **Steps**:
  1.  Parse the JSON request body to extract the `otp` and `phone_number`.
  2.  Retrieve the stored OTP and user data from Redis.
  3.  Compare the provided OTP with the stored OTP.
  4.  If valid, insert the user into the database using `UserModel.Insert`.
  5.  Respond with a success message and user details.

```go
func (app *application) verifyAndRegisterUserHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		OTP         string `json:"otp"`
		PhoneNumber string `json:"phone_number"`
	}

	/*
		Read JSON from request body.
		If an error occurs while reading, respond with a bad request error.
	*/
	err := app.readJSON(w, r, &input)
	if err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	/*
		Ensure OTP and phone number are provided in the request.
		If either is missing, respond with a bad request error.
	*/
	if input.OTP == "" || input.PhoneNumber == "" {
		app.errorResponse(w, http.StatusBadRequest, "OTP and phone number are required")
		return
	}

	/*
		Set a timeout for Redis operations to prevent blocking indefinitely.
		If Redis operations fail, respond with an unauthorized error indicating invalid or expired OTP.
	*/
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Retrieve user data from Redis using the phone number as the key
	userData, err := app.cache.HGetAll(ctx, input.PhoneNumber).Result()
	if err != nil || len(userData) == 0 {
		app.errorResponse(w, http.StatusUnauthorized, "Invalid or expired OTP")
		return
	}

	// Compare the provided OTP with the stored one in Redis
	storedOTP := userData["otp"]
	if input.OTP != storedOTP {
		app.errorResponse(w, http.StatusUnauthorized, "Invalid OTP")
		return
	}

	// OTP is valid, retrieve the user's name from Redis
	userName := userData["name"]

	/*
		Proceed with creating the user in the database or application.
		Example: app.createUser(userName, input.PhoneNumber)
	*/
	user := data.User{
		Name:        userName,
		PhoneNumber: input.PhoneNumber,
	}

	err = app.models.User.Insert(&user)

	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to register user")
		app.logger.Println("Error registering user:", err)
		return
	}

	/*
		Respond with a success message indicating the user has been registered successfully.
		The response includes a JSON object with a success flag and a message containing the user's name.
	*/
	app.writeJSON(w, http.StatusOK, envelope{
		"success": true,
		"data":    user,
		"message": "User registered successfully",
	}, nil)
}

```

**Key Points**:

- Redis ensures the OTP is valid for a limited time, preventing replay attacks.
- The database insert operation is performed only after successful OTP verification.

Here's an explanation of the additions and how the provided code integrates into the overall OTP-based authentication server:

### 4. Utility Function: `generateOTP`

A helper function to generate a secure 4-digit OTP:

```go
func generateOTP() string {
	otp := make([]byte, 2)

	_, err := rand.Read(otp)
	if err != nil {
		log.Fatal("Error generating OTP:", err)
	}
	return fmt.Sprintf("%04d", int(otp[0])%10000)
}
```

**Explanation**:

- Uses `crypto/rand` for secure random number generation.
- Converts the byte value to a 4-digit number.

### 5. Response Handling

The `signupUserHandler` and `verifyAndRegisterUserHandler` use helper functions like `app.readJSON`, `app.writeJSON`, and `app.errorResponse` to handle:

- JSON parsing and serialization.
- Error responses with appropriate HTTP status codes.
- Success responses with user-friendly messages.

Lets implement those as well, create a new `helper.go` file in the api folder and paste the following code.

```go
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)

type envelope map[string]interface{}

func (app *application) errorResponse(w http.ResponseWriter, status int, message interface{}) {
	env := envelope{"error": message}

	err := app.writeJSON(w, status, env, nil)
	if err != nil {
		app.logger.Println(err)
		w.WriteHeader(500)
	}

}

func (app *application) writeJSON(w http.ResponseWriter, status int, body envelope, headers http.Header) error {
	js, err := json.Marshal(body)
	if err != nil {
		return err
	}

	js = append(js, '\n')

	for key, value := range headers {
		w.Header()[key] = value
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(js)

	return nil
}

func (app *application) readJSON(w http.ResponseWriter, r *http.Request, dst interface{}) error {
	maxBytes := 104856
	r.Body = http.MaxBytesReader(w, r.Body, int64(maxBytes))
	// Decode the request body into the target destination.

	// Initialize the json.Decoder, and call the DisallowUnknownFields() method on it
	// before decoding. This means that if the JSON from the client now includes any
	// field which cannot be mapped to the target destination, the decoder will return
	// an error instead of just ignoring the field.
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	// Decode the request body to the destination.
	err := dec.Decode(dst)
	if err != nil {
		// If there is an error during decoding, start the triage...
		var syntaxError *json.SyntaxError
		var unmarshalTypeError *json.UnmarshalTypeError
		var invalidUnmarshalError *json.InvalidUnmarshalError
		switch {
		// Use the errors.As() function to check whether the error has the type
		// *json.SyntaxError. If it does, then return a plain-english error message
		// which includes the location of the problem.
		case errors.As(err, &syntaxError):
			return fmt.Errorf("body contains badly-formed JSON (at character %d)", syntaxError.Offset)
		// In some circumstances Decode() may also return an io.ErrUnexpectedEOF error
		// for syntax errors in the JSON. So we check for this using errors.Is() and
		// return a generic error message. There is an open issue regarding this at
		// https://github.com/golang/go/issues/25956.
		case errors.Is(err, io.ErrUnexpectedEOF):
			return errors.New("body contains badly-formed JSON")
		// Likewise, catch any *json.UnmarshalTypeError errors. These occur when the
		// JSON value is the wrong type for the target destination. If the error relates
		// to a specific field, then we include that in our error message to make it
		// easier for the client to debug.
		case errors.As(err, &unmarshalTypeError):
			if unmarshalTypeError.Field != "" {
				return fmt.Errorf("body contains incorrect JSON type for field %q", unmarshalTypeError.Field)
			}
			return fmt.Errorf("body contains incorrect JSON type (at character %d)", unmarshalTypeError.Offset)
		// An io.EOF error will be returned by Decode() if the request body is empty. We
		// check for this with errors.Is() and return a plain-english error message
		// instead.
		case errors.Is(err, io.EOF):
			return errors.New("body must not be empty")
		// A json.InvalidUnmarshalError error will be returned if we pass a non-nil
		// pointer to Decode(). We catch this and panic, rather than returning an error
		// to our handler. At the end of this chapter we'll talk about panicking
		// versus returning errors, and discuss why it's an appropriate thing to do in
		// this specific situation.
		case errors.As(err, &invalidUnmarshalError):
			panic(err)
		// For anything else, return the error message as-is.
		default:
			return err
		}
	}

	// Call Decode() again, using a pointer to an empty anonymous struct as the
	// destination. If the request body only contained a single JSON value this will
	// return an io.EOF error. So if we get anything else, we know that there is
	// additional data in the request body and we return our own custom error message.
	err = dec.Decode(&struct{}{})

	if err != io.EOF {
		return errors.New("body must only contain a single JSON value")
	}

	return nil
}

```

### **Testing the Application**

With the code in place, you’re ready to test the application. Follow these steps:

1.  **Start the Application**:

    - Run the following command to start your application in the background using Docker Compose:

      `docker-compose up -d`

2.  **Run the Server**:

    - Once the containers are up and running, you can start your Go server by executing

      `go run ./cmd/api`

3.  **Test the Endpoints**:

    - Now that the server is running, you can test the `/signup` and `/verify` endpoints to ensure everything works as expected.

### **Next Steps: Implementing Authentication**

Once the basic signup and OTP verification flow is working, the next step is to secure the application using authenticated routes. Here's how you can proceed:

1.  **Token-Based Authentication**:

    - Implement JWT (JSON Web Tokens) for secure, stateless authentication.
    - After verifying the OTP and registering the user, generate a JWT that will be sent back to the client.
    - The client can use this token in the `Authorization` header for subsequent requests to access protected resources.

2.  **Middleware**:

    - Create middleware to validate JWT tokens in the request headers.
    - Only allow authenticated users to access certain routes.

3.  **Integrate Twilio**:

    - Use Twilio for sending OTP messages instead of generating the OTP manually.
    - Integrate the Twilio API to send SMS with the OTP to the user’s phone number.
