---
name: javascript-performance
description: "JavaScript performance skill for event loop optimization, memory profiling, and runtime efficiency in Node.js and browsers. Trigger phrases: JavaScript performance, event loop stall, memory heap, GC pause, async performance, CPU profile, throughput."
---

# JavaScript Performance

## Use When

- Profiling Node.js or browser JavaScript for CPU, memory, or responsiveness issues.
- Investigating event loop stalls, GC pauses, or memory leaks.
- Optimizing async control flow and concurrency.

## Profiling Tools

1. **Node.js profiling**
- CPU: `node --prof` then `node --prof-process --preprocess` for flame graphs.
- Memory: Start with `node --inspect` and Chrome DevTools heap snapshots.
- Real-time: Use `clinic.js` or `0x` for interactive profiles.

2. **Event loop and async analysis**
- Trace event loop: Use `--trace-events` flag and analyze in Chrome DevTools.
- Async hooks: Use `async_hooks` module to detect blocking or slow async operations.
- Benchmark libraries: `benchmark.js` for micro-benchmarks, custom timers for macro.

3. **Memory profiling**
- Heap snapshots: Chrome DevTools or `heapdump` package.
- Allocation timeline: See where memory is allocated over time.
- GC statistics: Use `--trace-gc` to see pause times and frequency.

4. **Browser profiling**
- Prefer Chrome DevTools MCP when available: use the known target URL and reproduction steps to open the page, record performance traces, analyze insights, and capture heap snapshots as needed. Save profiling artifacts and base findings on the collected evidence before asking the user to collect data.
- Discover the available MCP tools and follow their schemas. For page loads, navigate before starting a reload trace; for interaction issues, start a trace without reloading or auto-stopping, reproduce the interaction, then stop the trace. Use performance tracing, not the MCP Lighthouse audit, for performance measurements.
- Use existing project context before requesting input. If tools are unavailable, access fails, or essential details are missing, explain the blocker and ask only for the missing URL, reproduction steps, authentication, approval, or manual profiling results. Do not bypass access controls or perform destructive interactions.
- CPU/responsiveness: Chrome DevTools Performance panel; look for Long Tasks (>50ms) and layout thrashing.
- Memory: DevTools Memory panel heap snapshots and allocation sampling.
- Metrics: `performance.mark/measure`, `PerformanceObserver` for long tasks and Web Vitals (INP, LCP, CLS).

## Checklist

1. Event loop efficiency
- Are any operations blocking the event loop (synchronous I/O, tight loops)?
- Is work properly chunked with `setImmediate` when needed?
- Are there unnecessary await points or promise chains?

2. Concurrency and throughput
- Is concurrency limited by connection/resource pools?
- Are operations properly parallelized (Promise.all) or sequenced incorrectly?
- Check for lock contention in shared state or database pools.

3. Memory management
- Are objects retained longer than needed (circular references, forgotten listeners)?
- Is memory growing unbounded or within expected bounds?
- Are timers, listeners, or streams properly cleaned up?

4. Garbage collection
- Is GC pause time acceptable for your workload?
- Are large objects or frequent allocations causing GC pressure?
- Consider using `--max-old-space-size` if running large workloads.

## Output Requirements

If the user has provided neither code nor profiling output, first attempt to collect browser profiling evidence using Chrome DevTools MCP when available and the target is known and accessible. Do not produce findings without evidence. If collection is blocked or inapplicable, explain why and provide a short diagnostic plan: the specific commands or tools from Profiling Tools to run, what output to capture, and what to look for, then ask only for the missing information or results needed to proceed.

For each finding provide:
- Measurement (baseline throughput, latency, memory).
- Profiling evidence (flame graph, trace, heap snapshot).
- Root cause and impact.
- Optimization strategy and expected improvement.

If no profiling data or measurements are available, do not invent numbers or artifacts. For source-only findings, label the finding as 'Hypothesis (unmeasured)' and describe the code evidence that suggests the issue. Attempt to confirm browser hypotheses using Chrome DevTools MCP before requesting user assistance; if collection is blocked or inapplicable, specify the exact command or tool from the Profiling Tools section needed to confirm them.
