---
title: "Build an OTP-Based Authentication Server with Go: Part 4 - File Uploads and Graceful Shutdown"
subtitle: Learn to create a secure OTP authentication system with Go, including OTP generation, validation, and security best practices.
author: Vishal Shukla
date: January 17, 2025
---

We will implement a route to upload files, simplify our workflow by defining commands using a Makefile, and add a graceful shutdown mechanism to our server. This ensures the server does not stop abruptly and completes ongoing tasks before shutting down.

## Graceful Shutdown

Create a new `cmd/api/server.go` file to manage all server-related functionalities in a separate file. We will create a new Go routine that listens for termination signals, and upon receiving one, it will gracefully shut down the server.

I have added comments to make it easier to understand what each part does.

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func (app *application) serve(router http.Handler) error {
	/**
	 * Initialize a new HTTP server instance with configurations defined in the application config.
	 * The server includes timeouts for idle, read, and write operations to handle connections gracefully.
	 * The "Handler" chain applies middleware for panic recovery and authentication.
	 */
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", app.config.port),
		Handler:      app.recoverPanic(app.authenticate(router)),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	/**
	 * Create a channel to capture errors that might occur during the shutdown process.
	 * This channel ensures the serve function properly waits for shutdown tasks to complete.
	 */
	shutdownError := make(chan error)

	/**
	 * Start a goroutine to listen for termination signals (e.g., SIGINT, SIGTERM).
	 * Upon receiving a signal, the server initiates a graceful shutdown sequence.
	 */
	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

		s := <-quit
		app.logger.Printf("Received %v, starting shutdown", s.String())

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		err := srv.Shutdown(ctx)
		if err != nil {
			shutdownError <- err
		}

		/**
		 * Wait for any background tasks to complete.
		 * The application's WaitGroup (app.wg) ensures that no tasks are left running.
		 */
		app.logger.Printf("completing background tasks: port %d", app.config.port)
		app.wg.Wait()

		shutdownError <- nil
	}()

	/**
	 * Log the server startup details, including the configured port and environment mode.
	 * The server will start listening for incoming connections.
	 */
	app.logger.Printf("Starting server on port %d in %s mode", app.config.port, app.config.env)
	err := srv.ListenAndServe()

	/**
	 * If the server stops unexpectedly (not due to a shutdown signal), return the error.
	 */
	if !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	/**
	 * Wait for the shutdown process to complete and capture any errors that occur.
	 * If there is an error during shutdown, return it wrapped with additional context.
	 */
	err = <-shutdownError
	if err != nil {
		return fmt.Errorf("server shutdown error: %w", err)
	}

	/**
	 * Log that the server stopped successfully and return nil to indicate no errors.
	 */
	app.logger.Println("server stopped :)")

	return nil
}

```

Let's use this `serve` function in our `main.go` file. Remove the `srv.ListenAndServe` block and replace it with this.

```go
err = app.serve(router)
	if err != nil {
		logger.Fatal(err, nil)
	}
```

Try shutting down the server using the `Ctrl+C` command, and you’ll notice that it waits for ongoing tasks to complete before shutting down. To test this, you can use the retry mechanism we implemented when sending OTPs. Remove the credentials so it keeps retrying, and then try shutting down the server midway. You’ll observe that it waits for the retries to finish before shutting down.

## Automating Commands with Makefile

Next, we need to create new database migrations, but if you've been following along, you might have noticed how tedious it is to write the same commands repeatedly. Let's make this easier by automating it with a Makefile.

In the root directory of your project, open the `Makefile` and add the following content:

```makefile
# Include variables from the .envrc file
include .envrc

## help: print this help message
.PHONY: help
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'

.PHONY: confirm
confirm:
	@echo -n 'Are you sure? [y/N] ' && read ans && [ $${ans:-N} = y ]

## run/api: run the cmd/api application
.PHONY: run/api
run/api:
	go run ./cmd/api

## db/psql: connect to the database using psql
.PHONY: db/psql
db/psql:
	psql ${GREENLIGHT_DB_DSN}

## db/migrations/new name=$1: create a new database migration
.PHONY: db/migrations/new
db/migrations/new:
	@echo "Migrating ${name}"
	migrate create -seq -ext=.sql -dir=./migrations ${name}

## db/migrations/up: apply all up database migrations
.PHONY: db/migrations/up
db/migrations/up: confirm
	@echo "Running migrations"
	migrate -path=./migrations -database=${GREENLIGHT_DB_DSN} up


## audit: tidy and vendor dependencies and format, vet and test all code
.PHONY: audit
audit: vendor
	@echo 'Formatting code...'
	go fmt ./...
	@echo 'Vetting code...'
	go vet ./...
	staticcheck ./...
	@echo 'Running tests...'
	go test -race -vet=off ./...
## vendor: tidy and vendor dependencies
.PHONY: vendor
vendor:
	@echo 'Tidying and verifying module dependencies...'
	go mod tidy
	go mod verify
	@echo 'Vendoring dependencies...'
	go mod vendor

## build/api: build the cmd/api application
.PHONY: build/api
build/api:
	@echo 'Building cmd/api...'
	go build -o=./bin/api ./cmd/api
	GOOS=linux GOARCH=amd64 go build -o=./bin/linux_amd64/api ./cmd/api
```

### Run a Make Command

Once in the project directory, you can run any of the available commands defined in the Makefile. Here are a few examples:

- To display the help message and see all available commands:

```bash

make help

```

- To run your Go application:

```bash

make run/api

```

- To create a new database migration (you will need to pass a name for the migration):

```bash

make db/migrations/new name=my_migration

```

- To apply all pending migrations:

```bash

make db/migrations/up

```

- To format, vet, and test your code:

```bash

make audit

```

- To build the Go application for your default platform:

```bash

make build/api

```

### Add More Commands

You can add more commands to the Makefile as needed, following the structure provided. Each task is defined with a `.PHONY` declaration (indicating that it's not a real file target), followed by the task name and the commands to execute.

This simple process helps you automate tasks, manage your Go project efficiently, and improve productivity.

## File upload and tracking

Next, we’ll create a new table in the database to track all files and their associated metadata.

Run the following command to create a new migration:

```bash
 make db/migrations/new name=create-creative
```

Then, add the following SQL code in the `000003_create-creative.up.sql` and `000003_create-creative.down.sql` files, respectively:

```sql
CREATE TABLE IF NOT EXISTS creatives (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users on DELETE CASCADE,
    creative_url text NOT NULL,
    scheduled_at DATE NOT NULL,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);
```

```sql
DROP  TABLE  IF  EXISTS creatives;
```

Next, we’ll integrate this into our central repository model, following the same approach we’ve been using. Create a new file called `internal/data/creatives.go` and add the following code:

```go
package data

import (
	"context"
	"database/sql"
	"time"

	"github.com/lib/pq"
)

type Creative struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"-"`
	CreativeURL string    `json:"creative_url"`
	ScheduledAt time.Time `json:"scheduled_at"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreativeModel struct {
	DB *sql.DB
}

func (c *CreativeModel) Insert(creative *Creative) error {
	query := `INSERT INTO creatives (user_id, creative_url, scheduled_at)
			VALUES ($1, $2, $3)
			RETURNING id, created_at`

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()

	args := []interface{}{creative.UserID, creative.CreativeURL, creative.ScheduledAt}
	err := c.DB.QueryRowContext(ctx, query, args...).Scan(&creative.ID, &creative.CreatedAt)

	if err != nil {
		return err
	}

	return nil
}

func (c *CreativeModel) GetScheduledCreatives() (map[string][]Creative, error) {
	query := `
		SELECT id, user_id, creative_url, scheduled_at, created_at
		FROM creatives
		WHERE scheduled_at = ANY($1)
	`

	dates := []time.Time{
		time.Now().Truncate(24 * time.Hour),
		time.Now().AddDate(0, 0, 1).Truncate(24 * time.Hour),
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
	defer cancel()

	rows, err := c.DB.QueryContext(ctx, query, pq.Array(dates))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	creatives := map[string][]Creative{
		"today":    {},
		"tomorrow": {},
	}

	for rows.Next() {
		var creative Creative
		err := rows.Scan(&creative.ID, &creative.UserID, &creative.CreativeURL, &creative.ScheduledAt, &creative.CreatedAt)
		if err != nil {
			return nil, err
		}

		if creative.ScheduledAt.Equal(dates[0]) {
			creatives["today"] = append(creatives["today"], creative)
		} else if creative.ScheduledAt.Equal(dates[1]) {
			creatives["tomorrow"] = append(creatives["tomorrow"], creative)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return creatives, nil
}

```

### Controller for File Upload and Tracking

Next, we'll create a new file `cmd/api/creative.go` where we’ll define two handlers: one to upload a file and another to retrieve scheduled files for today.

Create the file and paste the following code:

```go
package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/vishaaxl/cheershare/internal/data"
)

const MaxFileSize = 10 << 20

/**
 * generateUUIDFilename generates a unique filename based on a UUID.
 * It uses the original file's extension to keep the file format intact.
 * This helps avoid naming conflicts when storing uploaded files.
 */
func generateUUIDFilename(filePath string) string {
	ext := path.Ext(filePath)
	return fmt.Sprintf("%s%s", uuid.New().String(), ext)
}

/**
 * isImageFile checks whether the uploaded file is an image.
 * It checks the file extension to ensure that only .jpg, .jpeg, .png, and .gif files are allowed.
 */
func isImageFile(filename string) bool {
	allowedExtensions := []string{".jpg", ".jpeg", ".png", ".gif"}
	ext := strings.ToLower(path.Ext(filename))

	for _, validExt := range allowedExtensions {
		if ext == validExt {
			return true
		}
	}

	return false
}

/**
 * uploadFile handles the file upload logic.
 * It parses the incoming form data, checks for errors, and saves the file to disk.
 * The method also ensures that only images are uploaded by checking the file type.
 */
func (app *application) uploadFile(r *http.Request) (string, error) {
	err := r.ParseMultipartForm(MaxFileSize)
	if err != nil {
		/**
		 * If parsing the form fails (e.g., file size exceeds limit or form is malformed),
		 * return an empty string and the error to notify the caller.
		 */
		return "", err
	}

	/**
	 * Retrieve the uploaded file from the form data using the key "file".
	 * This returns the file object, its header (containing metadata like filename), and an error if any.
	 */
	file, header, err := r.FormFile("file")
	if err != nil {
		/**
		 * If there was an error retrieving the file (e.g., missing file in the request),
		 * return an empty string and the error to notify the caller.
		 */
		return "", err
	}
	defer file.Close()

	/**
	 * Check if the uploaded file is a valid image (using the file extension).
	 * The isImageFile function verifies that the file is one of the allowed image types (e.g., .jpg, .png).
	 */
	if !isImageFile(header.Filename) {
		return "", fmt.Errorf("invalid file type: only images are allowed")
	}

	/**
	 * Generate a unique filename for the uploaded file using a UUID to avoid naming conflicts.
	 * The generateUUIDFilename function ensures that each uploaded file gets a unique name,
	 * while retaining the file's original extension.
	 */
	uploadDir := "./uploads"
	destinationFilePath := fmt.Sprintf("%s/%s", uploadDir, generateUUIDFilename(header.Filename))

	/**
	 * Create the destination file in the specified upload directory.
	 * The os.Create function returns a file pointer for the newly created file.
	 */
	destinationFile, err := os.Create(destinationFilePath)
	if err != nil {
		return "", err
	}
	defer destinationFile.Close()

	/**
	 * Copy the contents of the uploaded file to the newly created destination file.
	 * The io.Copy function writes from the source (file) to the destination (destinationFile).
	 */
	_, err = io.Copy(destinationFile, file)
	if err != nil {
		return "", err
	}

	return destinationFilePath, nil
}

/**
 * uploadCreativeHandler handles the HTTP request for uploading a creative file.
 * It processes the file upload, checks for errors, and returns a response with the uploaded file path.
 */
func (app *application) uploadCreativeHandler(w http.ResponseWriter, r *http.Request) {
	/**
	 * Extract the "scheduled_at" parameter from the request form data.
	 * This represents the date when the creative will be scheduled.
	 * If the "scheduled_at" parameter is missing, respond with a 400 Bad Request error.
	 */
	scheduledAtStr := r.FormValue("scheduled_at")
	if scheduledAtStr == "" {
		app.errorResponse(w, http.StatusBadRequest, "scheduled_at is required")
		return
	}

	scheduledAt, err := time.Parse("2006-01-02", scheduledAtStr)
	if err != nil {
		app.errorResponse(w, http.StatusBadRequest, "invalid date format for scheduled_at")
		return
	}

	/**
	 * Validate that the scheduled date is not in the past.
	 * If the date is earlier than the current date, respond with a 400 Bad Request error.
	 */
	if scheduledAt.Before(time.Now()) {
		app.errorResponse(w, http.StatusBadRequest, "cannot set scheduled_at before today")
		return
	}

	/**
	 * Handle the file upload using the app.uploadFile method.
	 * If the file upload fails, respond with a 400 Bad Request error containing the error message.
	 */
	uploadedFile, err := app.uploadFile(r)
	if err != nil {
		app.errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	creative := &data.Creative{
		CreativeURL: uploadedFile,
		ScheduledAt: scheduledAt,
		UserID:      app.contextGetUser(r).ID,
	}

	err = app.models.Creative.Insert(creative)
	if err != nil {
		app.logger.Println("Error saving creative:", err)
		app.errorResponse(w, http.StatusInternalServerError, "failed to save creative")
		return
	}

	app.writeJSON(w, http.StatusOK, envelope{"creative": creative}, nil)
}

func (app *application) getScheduledCreativesHandler(w http.ResponseWriter, r *http.Request) {
	scheduledCreatives, err := app.models.Creative.GetScheduledCreatives()
	if err != nil {

		app.errorResponse(w, http.StatusInternalServerError, "failed to fetch scheduled creatives")
		return
	}

	app.writeJSON(w, http.StatusOK, envelope{"scheduled_creatives": scheduledCreatives}, nil)
}

```

Instead of checking for the existence of the `./uploads` folder every time a request is made, we will perform this check when the server starts. If the directory doesn't exist, we will create it.

Add the following code to your `main.go` or server initialization logic and add the two new methods to upload and get the files:

```go
uploadDir := "./uploads"
if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
	err := os.MkdirAll(uploadDir, os.ModePerm)
	if err != nil {
		fmt.Println("Unable to create uploads directory:", err)
	}
}
...

router.HandlerFunc(http.MethodPost, "/upload-creative", app.requireAuthenticatedUser(app.uploadCreativeHandler))
router.HandlerFunc(http.MethodGet, "/scheduled", app.requireAuthenticatedUser(app.getScheduledCreativesHandler))
```

This concludes our Go backend development series. We've successfully implemented most of the essential features, with the exception of the payment functionality. Stay tuned for future updates where we will dive deeper into more advanced features!

Part 3: https://dev.to/vishaaxl/build-an-otp-based-authentication-server-with-go-part-3-2jc0
