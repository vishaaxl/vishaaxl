---
title: "Build an OTP-Based Authentication Server with Go: Part 1"
subtitle: Learn to create a secure OTP authentication system with Go, including OTP generation, validation, and security best practices.
author: Vishal Shukla
date: January 5, 2025
---

### Getting Started

Begin by creating a new folder for your project and initialize a Go module with the following command:

`go mod init github.com/vishaaxl/cheershare`

### Set up the Project Structure

Start by setting up a new Go project with the following folder structure:

```sh
my-otp-auth-server/
├── cmd/
│   └── api/
│       └── main.go
│       └── user.go
│       └── token.go
├── internal/
│   └── data/
│       ├── models.go
│       └── user.go
│       └── token.go
├── docker-compose.yml
├── go.mod
└── Makefile
```

Next, set up your `docker-compose.yml` file. This configuration will define the services—PostgreSQL and Redis—that you'll be working with throughout this tutorial.

### **Setting Up Services with Docker Compose**

We will start by configuring the services required for our project. For the backend, we need the following:

- **Redis**: We'll use the `redis:6` image. This service will configure a password for secure access, expose port `6379`, and enforce password authentication using the `--requirepass` flag to secure Redis access.

- **PostgreSQL**: We'll use the `postgres:13` image. The service will define a default user, password, and database, expose port `5432` for communication, and persist data with a named volume (`postgres_data`) to ensure durability.

**Optional:**

- **Main Backend Service**: You can define the main backend service here as well, which will interact with both PostgreSQL and Redis.

```docker
// docker-compose.yml
services:
  postgres:
    image: postgres:13
    container_name: postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_DB: cheershare
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6
    container_name: redis
    environment:
      REDIS_PASSWORD: mysecretpassword
    ports:
      - "6379:6379"
    command: ["redis-server", "--requirepass", "mysecretpassword"]

volumes:
  postgres_data:

```

### Main Backend Service

For routing and handling HTTP requests, we’ll use the `github.com/julienschmidt/httprouter` package. To install the dependency, run the following command:

```sh
go get github.com/julienschmidt/httprouter
```

Next, create a file at `cmd/api/main.go` and paste the following code. An explanation for each line is provided in the comments:

```go
//  main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/julienschmidt/httprouter"
)

/*
config struct:
- Holds application-wide configuration settings such as:
  - `port`: The port number on which the server will listen.
  - `env`: The current environment (e.g., "development", "production").
*/
type config struct {
	port int
	env  string
}

/*
applications struct:
- Encapsulates the application's dependencies, including:
  - `config`: The application's configuration settings.
  - `logger`: A logger instance to handle log messages.
*/
type applications struct {
	config config
	logger *log.Logger
}

func main() {
	cfg := &config{
		port: 4000,
		env:  "development",
	}

	logger := log.New(os.Stdout, "INFO\t", log.Ldate|log.Ltime)

	app := &applications{
		config: *cfg,
		logger: logger,
	}

	router := httprouter.New()

	router.GET("/", func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Welcome to the Go application!")
	})

	/*
		Initialize the HTTP server
		- Set the server's address to listen on the specified port.
		- Assign the router as the handler.
		- Configure timeouts for idle, read, and write operations.
		- Set up an error logger to capture server errors.
	*/
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", app.config.port),
		Handler:      router,
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	app.logger.Printf("Starting server on port %d in %s mode", app.config.port, app.config.env)

	err := srv.ListenAndServe()
	if err != nil {
		app.logger.Fatalf("Could not start server: %s", err)
	}
}

```

Right now, you can test your setup by starting out server using `go run ./cmd/api` and sending a request to `http://localhost:4000`, which will return a welcome message. Next, we’ll define three additional routes to implement our core functionality:

1.  **`/send-otp`**: This route will handle sending OTPs to users. It will generate a unique OTP, store it in Redis, and deliver it to the user.
2.  **`/verify-otp`**: This route will verify the OTP provided by the user. It will check against the value stored in Redis to confirm the user's identity.
3.  **`/login`**: This route will handle user login functionality once the OTP is verified and user is successfully created.

But before we continue, we need a way to store user information like phone number and their one-time password for which we need to connect to the services we defined earlier in the `docker-compose.yml` file.

### **Defining Helper Functions**

Before implementing the routes, let’s define two essential helper functions. These functions will handle connections to the Redis and PostgreSQL servers, ensuring that our backend can interact with these services.

Modify the 'config' struct to store information about the services. These functions are pretty self-explanatory.

```go
//main.go

// connectDB establishes a connection to the PostgreSQL database using the provided configuration.
// It returns a database connection instance or an error if the connection fails.
func connectDB(cfg config) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.db.dsn)
	if err != nil {
		return nil, err
	}

	// Set the maximum number of open connections and idle connections for the database pool.
	db.SetMaxOpenConns(cfg.db.maxOpenConns)
	db.SetMaxIdleConns(cfg.db.maxIdleConns)
	db.SetConnMaxIdleTime(cfg.db.maxIdleTime)

	// Create a context with a timeout of 5 seconds to ensure the connection attempt doesn't hang indefinitely.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Ping the database to verify the connection is successful.
	err = db.PingContext(ctx)
	if err != nil {
		return nil, err
	}

	// Return the connected database instance if successful.
	return db, nil
}

// connectRedis establishes a connection to the Redis server using the provided configuration.
// It returns a Redis client instance or an error if the connection fails.
func connectRedis(cfg redisConfig) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.addr,     // Redis server address
		Password: cfg.password, // Redis server password
		DB:       cfg.db,       // Redis database index
	})

	// Create a context with a timeout of 5 seconds for the Redis connection.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Ping the Redis server to verify the connection.
	_, err := client.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("unable to connect to Redis: %w", err)
	}

	// Return the connected Redis client instance if successful.
	return client, nil
}
```

You can use these functions to establish a connection to the PostgreSQL database and Redis server after starting the services with the `docker-compose up -d` command.

But first lets install the required dependencies.

```sh
go get github.com/lib/pq
go get github.com/go-redis/redis/v8
```

In the next part, we'll start working on those routes we talked about earlier. This is what your `main.go` file should look like now.

```go
//  main.go
package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/julienschmidt/httprouter"
	_ "github.com/lib/pq"
)

/*
config struct:
- Holds application-wide configuration settings such as:
  - `port`: The port number on which the server will listen.
  - `env`: The current environment (e.g., "development", "production").
  - `db`: Database-specific configurations.
  - `redis`: Redis-specific configurations.
*/
type config struct {
	port  int
	env   string
	db    db
	redis redisConfig
}

type db struct {
	dsn          string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  time.Duration
}

type redisConfig struct {
	addr     string
	password string
	db       int
}

/*
applications struct:
- Encapsulates the application's dependencies, including:
  - `config`: The application's configuration settings.
  - `logger`: A logger instance to handle log messages.
  - `redis`: A Redis client instance for caching.
*/
type applications struct {
	config config
	logger *log.Logger
	cache  *redis.Client
}

func main() {
	/*
	   Configuration includes:
	   - `port`: The port on which the server will run (default is 4000).
	   - `env`: The environment mode (e.g., "development", "production").
	   - `db`: Database connection settings, including the DSN, connection limits, and idle timeout.
	   - `redis`: Redis connection settings, including server address, password, and database index.
	*/
	cfg := &config{
		port: 4000,
		env:  "development",
		db: db{
			dsn:          "user=postgres password=mysecretpassword dbname=cheershare sslmode=disable",
			maxOpenConns: 25,
			maxIdleConns: 25,
			maxIdleTime:  time.Minute,
		},
		redis: redisConfig{
			addr:     "localhost:6379",
			password: "mysecretpassword",
			db:       0,
		},
	}

	/*
	   Logger settings:
	   - Prefix: "INFO\t" indicates informational logs.
	   - Flags: Includes date and time for log entries.
	*/
	logger := log.New(os.Stdout, "INFO\t", log.Ldate|log.Ltime)

	/*
	   - connectDB establishes a connection using the database configuration.
	   - If the connection fails, the application logs a fatal error and exits.
	   - If successful, logs a success message and defers closing the connection.
	*/
	db, err := connectDB(cfg.db)
	if err != nil {
		logger.Fatalf("Failed to connect to database: %s", err)
	}
	logger.Println("Connected to PostgreSQL database")
	defer db.Close()

	/*
	   - connectRedis establishes a connection using the Redis configuration.
	   - If the connection fails, the application logs a fatal error and exits.
	   - If successful, logs a success message and defers closing the connection.
	*/
	redisClient, err := connectRedis(cfg.redis)
	if err != nil {
		logger.Fatalf("Failed to connect to Redis: %s", err)
	}
	logger.Println("Connected to Redis server")
	defer redisClient.Close()

	app := &applications{
		config: *cfg,
		logger: logger,
	}

	router := httprouter.New()
	router.GET("/", func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Welcome to the Go application!")
	})

	/*
	   Server configuration:
	   - Address: Uses the configured port from `config`.
	   - Handler: Routes handled by `httprouter`.
	   - Timeouts: Configured for idle, read, and write operations.
	   - Error logging: Logs errors during server startup or operation.
	*/
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", app.config.port),
		Handler:      router,
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	// Log server start information
	app.logger.Printf("Starting server on port %d in %s mode", app.config.port, app.config.env)

	// Start the server and handle potential errors
	err = srv.ListenAndServe()
	if err != nil {
		app.logger.Fatalf("Could not start server: %s", err)
	}
}

func connectDB(cfg db) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.dsn)

	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(cfg.maxOpenConns)
	db.SetMaxIdleConns(cfg.maxIdleConns)
	db.SetConnMaxIdleTime(cfg.maxIdleTime)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = db.PingContext(ctx)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func connectRedis(cfg redisConfig) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.addr,
		Password: cfg.password,
		DB:       cfg.db,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := client.Ping(ctx).Result()
	if err != nil {
		return nil, err
	}

	return client, nil
}

```
