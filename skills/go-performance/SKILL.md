---
name: go-performance
description: "Go performance skill for profiling, benchmarking, optimization including goroutine efficiency, lock contention, and allocation patterns. Trigger phrases: Go performance, goroutine leak, CPU profile, memory allocation, lock contention, benchmarking, pprof, -bench."
---

# Go Performance

## Use When

- Profiling Go applications for CPU, memory, goroutine, or allocation issues.
- Analyzing lock contention and goroutine efficiency.
- Benchmarking and optimizing hot paths.

## Profiling Tools

1. **Benchmarking**
- `go test -bench=. -benchmem` to run benchmarks and show memory allocations.
- `go test -bench=. -cpuprofile=cpu.prof` to profile benchmark execution.
- `go tool pprof cpu.prof` to analyze the profile interactively.

2. **Runtime profiling (pprof)**
- Add `import _ "net/http/pprof"` to enable profiling endpoint.
- Start an HTTP server to serve the endpoint, e.g. `go func() { log.Println(http.ListenAndServe("localhost:6060", nil)) }()` (with `log` and `net/http` imported), or register `pprof` handlers on your existing mux.
- Access profiles at `http://localhost:6060/debug/pprof/`.
- CPU profile: `go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30`.
- Heap: `go tool pprof http://localhost:6060/debug/pprof/heap`.
- Goroutines: `curl http://localhost:6060/debug/pprof/goroutine`.

3. **Memory and allocation analysis**
- `go test -bench=. -memprofile=mem.prof` then `go tool pprof mem.prof`.
- Look for alloc bytes vs. bytes in use; high alloc suggests GC pressure.

## Checklist

1. CPU and hot paths
- Profile to identify bottleneck functions (top of call graph).
- Check for unnecessary allocations or repeated computations in hot paths.
- Verify algorithm complexity is appropriate (avoid O(n²) operations).

2. Memory and allocation
- High allocation count in benchmarks suggests unnecessary allocations.
- Use sync.Pool for frequently allocated/freed objects.
- Preallocate slices and maps when size is known.

3. Goroutine efficiency
- Check goroutine count at rest vs. under load; look for leaks.
- Use `-race` flag to detect concurrent access to shared memory.
- Verify goroutine cleanup on application shutdown.

4. Lock contention
- Enable mutex profiling with `runtime.SetMutexProfileFraction(1)` (or `go test -bench=. -mutexprofile=mutex.prof`), then analyze `go tool pprof http://localhost:6060/debug/pprof/mutex` or `go tool pprof mutex.prof`. Use `/debug/pprof/block` (after `runtime.SetBlockProfileRate(1)`) for channel/select blocking.
- If high contention, consider finer-grained locking or lock-free data structures.
- Use `RWMutex` if read-heavy. Prefer a mutex-guarded map by default; use `sync.Map` only when keys are written once and read many times, or when goroutines access disjoint key sets. For high write contention, consider sharding the map.

5. Channel and concurrency patterns
- Avoid goroutine-per-request at scale; use worker pools.
- Ensure channels are closed by the sender when no more values will be sent; goroutines leak when they block forever on a channel that is never closed, never written to, or never read from. Use `context` cancellation or a `done` channel in `select` to guarantee exit.

## Output Requirements

For each finding provide:
- Measurement (benchmark results, baseline latency/memory).
- Profiling evidence (goroutine count, CPU profile, allocation trace).
- Root cause (algorithm, allocation, lock, goroutine leak).
- Optimization strategy and expected improvement (e.g., "Reduce allocations by X%").
- Effort (Low: <1 hour, localized change / Medium: 1–4 hours, touches multiple functions / High: >4 hours or architectural change) and Risk (Low: no behavior change / Medium: concurrency or API surface changes / High: changes to shared state, locking, or lifecycle), each with a one-sentence justification.

If benchmark or profile data is not available, do not invent numbers or profiling evidence. State "Measurement: not available" and/or "Profiling evidence: not available" as appropriate, and provide the exact command(s) the user should run to obtain it (e.g., `go test -bench=BenchmarkX -benchmem -cpuprofile=cpu.prof`). Mark expected improvements as estimates.
