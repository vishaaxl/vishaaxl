---
title: "Build Your Own Redis-like Cache in Go"
subtitle: Learn How to Create a Simple Key-Value Store with Persistence and LRU Caching
author: Vishal Shukla
date: April 1, 2025
---


This tutorial will guide you through building your own Redis-like in-memory cache system using Go. By the end of this tutorial, you'll have a functional cache that supports basic operations such as setting and getting keys, LRU eviction, and persistence to disk.

## **Prerequisites**

Before you get started, make sure you have the following prerequisites:

- **Basic Knowledge of Go**: Familiarity with Go programming, including understanding of data types, structs, control flow, and basic concurrency (goroutines and channels).

- **Understanding of Caching and LRU Algorithm**: Knowing how caches work and what the LRU (Least Recently Used) eviction strategy is will help you understand the logic behind cache management.

Once you have these prerequisites in place, you're ready to start!


## **Folder Structure**

```
redis-clone/                  
│
├── store/                      
│   ├── cache.go               
│   └── persistence.go          
│
├── cache.aof                   
├── main.go                     
├── go.mod                      
├── go.sum                      
└── README.md                  

```
### Explanation of the Folder Structure:

1. **`store/`**:
    
    - This directory contains the core logic for the cache and persistence mechanisms.
        
    - **`cache.go`**: Implements the LRU (Least Recently Used) cache where key-value pairs are stored and evicted when the cache exceeds the maximum size.
        
    - **`persistence.go`**: Handles the persistence logic for the cache, storing commands (such as `SET`) in a file (AOF file). This allows for data recovery after a restart.
        
2. **`cache.aof`**:
    
    - This file stores the commands in an append-only format. Whenever a `SET` operation is performed, the command is appended to this file. This helps ensure that data is not lost during server restarts.
        
3. **`main.go`**:
    
    - This is the entry point of the application. It contains the logic to start the server, set up the cache, and handle incoming connections from clients. It binds to a specific port and listens for commands like `SET` and `GET`.


## **Implementation**

### `cache.go`: Implementing the LRU Cache

In the `store/` folder, the `cache.go` file contains the core logic for our in-memory LRU (Least Recently Used) cache. The LRU cache is designed to store key-value pairs and automatically evict the least recently used entries when the cache reaches its maximum size.

```go
package store

import (
	"container/list"
	"fmt"
	"log"
	"sync"
	"time"
)

/*
Item represents a single cache entry in the LRU (Least Recently Used) cache.
It contains the value of the cached item, the expiration time (if any),
and a reference to its corresponding list element in the LRU doubly linked list.
The reference to the list element allows the cache to efficiently update the position of the item
when it is accessed, ensuring the correct eviction of the least recently used items.
*/
type Item struct {
	value     string        // The value stored in the cache item
	expiresAt time.Time     // The expiration time for the cache item (if applicable)
	elem      *list.Element // A reference to the element in the LRU doubly linked list
}

/*
Cache represents an LRU (Least Recently Used) cache that stores key-value pairs.
The cache supports setting and getting items, with optional TTL (Time To Live) for each cache entry.
When the cache exceeds its maximum size, it evicts the least recently used item to make room for new entries.
Additionally, the cache can persist commands to an AOF (Append-Only File) for persistence between restarts.
*/
type Cache struct {
	mu      sync.RWMutex     // Mutex to ensure thread safety for concurrent access to the cache
	items   map[string]*Item // Map that stores cache items by their key
	lru     *list.List       // Doubly linked list used for tracking the access order of cache items (for LRU eviction)
	maxSize int              // Maximum number of items the cache can hold before eviction occurs
	persist *Persistence     // Optional persistence mechanism for appending commands to a file
}

/*
NewCache initializes and returns a new Cache instance with the specified max size.
The cache starts with an empty linked list and an empty item map, and optionally supports persistence.
*/
func NewCache(maxSize int, persist *Persistence) *Cache {
	return &Cache{
		items:   make(map[string]*Item), // Initialize the map to store cache items
		lru:     list.New(),             // Initialize the doubly linked list to track the LRU order
		maxSize: maxSize,                // Set the maximum size for the cache
		persist: persist,                // Optionally set the persistence mechanism
	}
}

/*
Set stores a key-value pair in the cache, optionally with a TTL (Time To Live).
If the cache exceeds the maximum size, the least recently used (LRU) item is evicted.
If persistence is enabled, the SET command is appended to the AOF file.
*/
func (c *Cache) Set(key string, value string, ttl time.Duration, replaying bool) {
	c.mu.Lock()         // Lock the cache to ensure thread-safe access
	defer c.mu.Unlock() // Unlock once the operation is complete

	var expiresAt time.Time
	if ttl != 0 {
		expiresAt = time.Now().Add(ttl) // Set the expiration time if TTL is provided
	}

	// Check if the key already exists in the cache
	if item, exists := c.items[key]; exists {
		// Update the value and expiration time of the existing item
		item.value = value
		item.expiresAt = expiresAt
		// Move the item to the front of the LRU list to mark it as recently used
		c.lru.MoveToFront(item.elem)
	} else {
		// Create a new item and insert it at the front of the LRU list
		elem := c.lru.PushFront(key)
		c.items[key] = &Item{
			value:     value,
			expiresAt: expiresAt,
			elem:      elem, // Store the list element reference with the item
		}
	}

	// Evict the least recently used item if the cache exceeds the max size
	if c.lru.Len() > c.maxSize {
		oldest := c.lru.Back() // Get the least recently used item (the oldest in the list)
		if oldest != nil {
			delete(c.items, oldest.Value.(string)) // Remove the item from the map
			c.lru.Remove(oldest)                   // Remove the item from the LRU list
		}
	}

	// Persist the command in the AOF file if persistence is enabled and not replaying
	if c.persist != nil && !replaying {
		cmd := fmt.Sprintf("SET %s %s", key, value)
		err := c.persist.Append(cmd)
		if err != nil {
			log.Println("Failed to append to AOF file:", err)
		}
	}
}

/*
Get retrieves the value associated with a key from the cache.
If the key exists and has not expired, it is moved to the front of the LRU list.
If the key does not exist or has expired, it is removed from the cache and not returned.
*/
func (c *Cache) Get(key string) (string, bool) {
	c.mu.Lock()         // Lock the cache to ensure thread-safe access
	defer c.mu.Unlock() // Unlock once the operation is complete

	// Check if the key exists in the cache
	item, exists := c.items[key]
	if !exists {
		return "", false // Return false if the key doesn't exist
	}

	// Check if the item has expired
	if !item.expiresAt.IsZero() && time.Now().After(item.expiresAt) {
		// If expired, remove it from the LRU list and delete it from the cache
		c.lru.Remove(item.elem)
		delete(c.items, key)
		return "", false
	}

	// Move the item to the front of the LRU list to mark it as recently used
	c.lru.MoveToFront(item.elem)

	// Return the value of the item along with a true flag indicating success
	return item.value, true
}

/*
StartCleaningServer periodically runs a cleanup task that removes expired items from the cache.
This task is triggered every minute and ensures the cache does not hold stale data.
*/
func (c *Cache) StartCleaningServer() {
	ticker := time.NewTicker(time.Minute * 1) // Set the cleanup interval to 1 minute
	defer ticker.Stop()

	// Run the cleanup process at regular intervals
	for range ticker.C {
		log.Println("Running cache cleanup")
		c.cleanExpiredItems() // Perform the cleanup of expired items
	}
}

/*
cleanExpiredItems iterates through the cache and removes any expired items.
It checks each item in the LRU list, and if the item has expired, it is removed from both the list and the cache.
Additionally, if the cache exceeds its maximum size, the least recently used item is evicted.
*/
func (c *Cache) cleanExpiredItems() {
	c.mu.Lock()         // Lock the cache for thread-safe access
	defer c.mu.Unlock() // Unlock once the operation is complete

	// Iterate through the LRU list from the back (oldest) to the front (most recently used)
	for e := c.lru.Back(); e != nil; e = e.Prev() {
		item := c.items[e.Value.(string)]

		// Skip items that do not have an expiration time
		if item.expiresAt.IsZero() {
			continue
		}

		// Remove expired items
		if time.Now().After(item.expiresAt) {
			c.lru.Remove(e)                   // Remove the expired item from the LRU list
			delete(c.items, e.Value.(string)) // Remove the expired item from the cache map
			log.Printf("Removed expired item: %s\n", e.Value)
		}
	}

	// If the cache exceeds the maximum size, evict the least recently used item
	if c.lru.Len() > c.maxSize {
		oldest := c.lru.Back()
		if oldest != nil {
			delete(c.items, oldest.Value.(string))
			c.lru.Remove(oldest)
		}
	}
}

```

### `persistence.go`: Managing Persistence for the Cache

In the `store/` folder, the `persistence.go` file is responsible for handling the persistence logic of our custom Redis-like in-memory cache. Specifically, it focuses on storing commands to a file, ensuring that we can recover the cache's state after a restart. This is done using the **Append-Only File** (AOF) strategy, which logs every write operation to disk.

```go
package store

import (
	"os"
)

/*
*
Persistence represents the mechanism for persisting the cache commands to a file.
It uses an append-only file (AOF) to persist commands that modify the cache state.
*/
type Persistence struct {
	file *os.File // The file used to store the commands
}

/*
*
NewAOF initializes and returns a new Persistence instance for appending commands to a file.
It opens the specified file in append mode, creating it if it doesn't exist.
*/
func NewAOF(filename string) (*Persistence, error) {
	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}

	return &Persistence{file: file}, nil
}

/*
*
Append writes a command to the AOF file.
The command is written as a string followed by a newline character.
*/
func (p *Persistence) Append(cmd string) error {
	_, err := p.file.WriteString(cmd + "\n")
	return err
}

/*
*
Close closes the AOF file when the server is shutting down.
*/
func (p *Persistence) Close() {
	p.file.Close()
}

```

### `main.go`: Starting the Redis-like Server

The **`main.go`** file serves as the entry point to our custom Redis-like server. It contains the initialization code for setting up and running the server, which includes loading the cache, setting up persistence, and listening for client connections. This file ties together all the components of the server and gets everything running.

```go
package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"os"
	"strings"
	"time"

	"github.com/vishaaxl/redis-clone/store"
)

/*
Server represents a simple Redis-like server that handles connections and processes Redis commands such as SET and GET.
The server uses an in-memory cache (LRU cache) to store key-value pairs, which is backed by an Append-Only File (AOF) persistence mechanism.
The server is capable of replaying the AOF file during startup to restore the cache state and handles incoming client connections to execute Redis-like commands.
*/
type Server struct {
	cache *store.Cache // Cache used to store key-value pairs
}

/*
NewServer initializes a new instance of the Server.
It creates a Cache instance with AOF persistence enabled, reading from the specified AOF file.
It also replays the AOF file to restore the cache state and starts a background cleaning process for the cache.
*/
func NewServer(aofFilename string) (*Server, error) {
	// Initialize AOF persistence
	persist, err := store.NewAOF(aofFilename)
	if err != nil {
		return nil, err
	}

	// Create the cache with a maximum size of 5 items and enable AOF persistence
	cache := store.NewCache(5, persist)

	// Replay the AOF file to restore the cache state
	if err := replayAOF(aofFilename, cache); err != nil {
		return nil, err
	}

	// Start the cache cleaning server in the background
	go cache.StartCleaningServer()

	return &Server{
		cache: cache, // Initialize the server with the cache
	}, nil
}

/*
replayAOF reads the AOF file and replays the commands to restore the cache state.
It processes each "SET" command in the AOF file and sets the corresponding key-value pair in the cache.
*/
func replayAOF(aofFilename string, cache *store.Cache) error {
	// Open the AOF file for reading
	file, err := os.Open(aofFilename)
	if err != nil {
		return fmt.Errorf("could not open AOF file: %v", err)
	}
	defer file.Close()

	// Read the file line by line
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()

		// Check if the line contains a "SET" command
		if strings.HasPrefix(line, "SET") {
			parts := strings.Fields(line)
			if len(parts) == 3 {
				// Set the key-value pair with a TTL of one hour
				cache.Set(parts[1], parts[2], time.Hour, true)
			}
		}
	}

	// Handle any errors encountered while reading the AOF file
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("error reading AOF file: %v", err)
	}

	return nil
}

/*
HandleConnection processes commands sent by the client over a network connection.
It reads commands from the client, processes them, and writes the appropriate response back to the client.
Commands are expected in the format "COMMAND key value" for SET commands, or "COMMAND key" for GET commands.
*/
func (s *Server) HandleConnection(conn net.Conn) {
	defer conn.Close()              // Ensure the connection is closed after processing
	reader := bufio.NewReader(conn) // Create a reader to read data from the connection

	// Continuously read and process commands from the client
	for {
		// Read the incoming message from the client
		message, err := reader.ReadString('\n')
		if err != nil {
			log.Println(err)
			return
		}

		// Clean up the message by trimming spaces
		message = strings.TrimSpace(message)
		// Split the message into command tokens
		tokens := strings.Split(message, " ")

		// Ensure there are at least two tokens (command and key)
		if len(tokens) < 2 {
			conn.Write([]byte("Invalid command\n"))
			continue
		}

		// Convert the command to uppercase for consistency
		cmd := strings.ToUpper(tokens[0])

		// Process different Redis commands
		switch cmd {
		case "SET":
			// Handle the SET command (set a key-value pair)
			if len(tokens) < 3 {
				conn.Write([]byte("Usage: SET key value\n"))
				continue
			}

			// Set the key-value pair in the cache with a TTL of 1 hour
			s.cache.Set(tokens[1], tokens[2], time.Hour, false)
			conn.Write([]byte("OK\n"))

		case "GET":
			// Handle the GET command (retrieve a value by key)
			key := tokens[1]
			if item, exists := s.cache.Get(key); !exists {
				// Respond with "nil" if the key doesn't exist in the cache
				conn.Write([]byte("nil\n"))
			} else {
				// Respond with the value if the key exists in the cache
				conn.Write([]byte(item + "\n"))
			}

		default:
			// Handle unknown commands
			conn.Write([]byte("Unknown Command\n"))
		}
	}
}

/*
Start listens for incoming connections on the specified address and port.
It accepts client connections and spawns a goroutine to handle each connection concurrently.
*/
func (s *Server) Start(address string) {
	// Set up the server to listen on the specified address (TCP port)
	listener, err := net.Listen("tcp", address)
	if err != nil {
		panic(err)
	}

	defer listener.Close() // Ensure the listener is closed when the function exits

	fmt.Println("Cache server running on port", address) // Log that the server has started

	// Continuously accept incoming client connections
	for {
		// Accept an incoming connection
		conn, err := listener.Accept()
		if err != nil {
			log.Println(err)
			continue // Skip any errors in accepting connections
		}

		// Handle the connection concurrently by spawning a goroutine
		go s.HandleConnection(conn)
	}
}

/*
Main function initializes the server and starts it to listen on port 6379.
It specifies the AOF filename for persistence and begins handling incoming client connections.
*/
func main() {
	// Specify the AOF file for persistence
	aofFilename := "cache.aof"

	// Initialize the server with AOF persistence
	server, err := NewServer(aofFilename)
	if err != nil {
		log.Fatalf("Error initializing server: %v", err)
	}

	// Start the server on port 6379
	server.Start(":6379")
}

```

Thanks for following along, and happy coding!