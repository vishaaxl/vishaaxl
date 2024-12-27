---
title: Beginner Go Project - Create a Task Runner in Go
subtitle: Learn How to Automate Your Development Workflow Using Go, YAML, and Task Automation Concepts
author: Vishal Shukla
date: December 27, 2024
---

```go
package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"gopkg.in/yaml.v3"
)

// Task defines the structure of a task in the configuration file.
// Each task has a description, a command to run, and a list of dependencies
// (other tasks that need to be completed before this task).
type Task struct {
	Description  string   `yaml:"description"`  // A brief description of the task.
	Command      string   `yaml:"command"`      // The shell command to execute for the task.
	Dependencies []string `yaml:"dependencies"` // List of tasks that need to be completed before this task.
}

// Config represents the entire configuration file,
// which contains a map of tasks by name.
type Config struct {
	Tasks map[string]Task `yaml:"tasks"` // A map of task names to task details.
}

// loadConfig reads and parses the configuration file (e.g., Makefile.yaml),
// and returns a Config struct containing the tasks and their details.
func loadConfig(filename string) (Config, error) {
	// Read the content of the config file.
	data, err := os.ReadFile(filename)
	if err != nil {
		return Config{}, err
	}

	// Unmarshal the YAML data into a Config struct.
	var config Config
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		return Config{}, err
	}

	return config, nil
}

// executeTask recursively executes the specified task and its dependencies.
// It first ensures that all dependencies are executed before running the current task's command.
func executeTask(taskName string, tasks map[string]Task, executed map[string]bool) error {
	// If the task has already been executed, skip it.
	if executed[taskName] {
		return nil
	}

	// Get the task details from the tasks map.
	task, exists := tasks[taskName]
	if !exists {
		return fmt.Errorf("task %s not found", taskName)
	}

	// First, execute all the dependencies of this task.
	for _, dep := range task.Dependencies {
		// Recursively execute each dependency.
		if err := executeTask(dep, tasks, executed); err != nil {
			return err
		}
	}

	// Now that dependencies are executed, run the task's command.
	fmt.Printf("Running task: %s\n", taskName)
	fmt.Printf("Command: %s\n", task.Command)

	// Execute the task's command using the shell (sh -c allows for complex shell commands).
	cmd := exec.Command("sh", "-c", task.Command)
	cmd.Stdout = os.Stdout // Direct standard output to the terminal.
	cmd.Stderr = os.Stderr // Direct error output to the terminal.

	// Run the command and check for any errors.
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to execute command %s: %v", task.Command, err)
	}

	// Mark the task as executed.
	executed[taskName] = true
	return nil
}

func main() {
	// Define command-line flags
	configFile := flag.String("f", "Makefile.yaml", "Path to the configuration file") // Path to the config file (defaults to Makefile.yaml)
	taskName := flag.String("task", "", "Task to execute")                             // The task to execute (required flag)

	// Parse the flags
	flag.Parse()

	// Check if the task flag is provided
	if *taskName == "" {
		fmt.Println("Error: Please specify a task using -task flag.")
		os.Exit(1) // Exit if no task is provided
	}

	// Load the configuration file
	config, err := loadConfig(*configFile)
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		os.Exit(1) // Exit if the configuration file can't be loaded
	}

	// Map to track which tasks have been executed already (avoiding re-execution).
	executed := make(map[string]bool)

	// Start executing the specified task (with dependencies)
	if err := executeTask(*taskName, config.Tasks, executed); err != nil {
		fmt.Printf("Error executing task: %v\n", err)
		os.Exit(1) // Exit if task execution fails
	}
}

```
