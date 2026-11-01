---
name: go-debugging
description: "Go debugging skill for delve setup, race condition detection, goroutine tracking, and panic diagnosis. Trigger phrases: Go debug, delve, race condition, goroutine leak, panic recovery, context leak, deadlock, -race flag."
---

# Go Debugging

## Use When

- Debugging Go code with delve or gdb.
- Investigating goroutine leaks and race conditions.
- Analyzing panics and recovering stack context.
- Diagnosing context abortion and cancellation issues.

## Setup and Tools

1. Delve debugging
- **Installation**: `go install github.com/go-delve/delve/cmd/dlv@latest`.
- **Starting**: `dlv debug` (current package) or `dlv debug ./cmd/app`.
- **Breakpoints**: `break main.main`, `break package.Function:line`.
- **VS Code**: Use the official Go extension; it integrates delve automatically.

2. Race detector
- **Build with `-race`**: `go build -race` or `go test -race`.
- **Run**: `./app` or `go test -race ./...`.
- Detects data races on goroutine access to shared memory.

3. Profiling and inspection
- **pprof**: `import _ "net/http/pprof"`, start a server with `go http.ListenAndServe("localhost:6060", nil)`, then visit `http://localhost:6060/debug/pprof/`.
- **goroutine dump**: `curl http://localhost:6060/debug/pprof/goroutine` for live goroutine list.
- **CPU and memory profiling**: Built into pprof; analyze with `go tool pprof`.

## Checklist

1. Goroutine leaks
- Compare goroutine dumps (`/debug/pprof/goroutine?debug=2`) before and after the operation to find goroutines that never exit.
- Count goroutines at startup vs. after operations: `runtime.NumGoroutine()`.
- Check that all spawned goroutines have clean exit paths.
- Verify channels are closed by the sender; stuck receivers leak goroutines.

2. Data races
- Use `-race` flag to detect unexpected concurrent access.

3. Context and cancellation
- Propagate context through all I/O operations and goroutines.
- Use `context.WithCancel()` or `context.WithTimeout()` appropriately.
- Check that cancellation handlers (deferred cleanup) run even if context is cancelled.

4. Deadlocks and locks
- Ensure mutexes are unlocked in all code paths (use `defer unlock()`).
- Avoid nested locks or ensure consistent lock ordering.
- Use `RWMutex` for read-heavy workloads instead of `Mutex`.

5. Panic and recovery
- Catch panics at goroutine entry points (not in library code).
- Log panic stack with `debug.Stack()` for troubleshooting.
- Distinguish panics (bugs) from errors (expected failures).

6. Memory and heap
- Be cautious with large allocations in loops; move out of loop if possible.
- Release resources (close files, connections) with `defer`.
- Use pointers for large structs passed to functions to avoid unnecessary copies.

## Output Requirements

For each finding provide:
- Issue description
- Evidence (race condition output, goroutine dump, panic stack)
- Root cause category, e.g. goroutine leak, data race, context/cancellation issue, deadlock, panic, memory/heap misuse, or other (state explicitly)
- Steps to reproduce using the most appropriate tool for the issue type (delve for panics/deadlocks, -race for data races, pprof or runtime.NumGoroutine() for leaks and memory)
- Fix strategy

If no evidence is available, state that explicitly under Evidence and list the exact commands the user should run to gather it. If no issues are found, say so and summarize the checks performed.
