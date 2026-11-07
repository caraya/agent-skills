package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"sync"

	"github.com/mark3labs/kit/pkg/kit"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"golang.org/x/sync/singleflight"
)

var (
	cacheMu      sync.RWMutex
	contentCache = make(map[string]string)
	requestGroup singleflight.Group
)

func fetchRemoteContent(ctx context.Context, url string) (string, error) {
	cacheMu.RLock()
	if cachedContent, exists := contentCache[url]; exists {
		cacheMu.RUnlock()
		fmt.Fprintf(os.Stderr, "Cache hit for: %s\n", url)
		return cachedContent, nil
	}
	cacheMu.RUnlock()

	v, err, _ := requestGroup.Do(url, func() (interface{}, error) {
		cacheMu.RLock()
		if cachedContent, exists := contentCache[url]; exists {
			cacheMu.RUnlock()
			return cachedContent, nil
		}
		cacheMu.RUnlock()

		fmt.Fprintf(os.Stderr, "Downloading: %s\n", url)
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if err != nil {
			return "", fmt.Errorf("failed to create request for %s: %w", url, err)
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return "", fmt.Errorf("failed to fetch content from %s: %w", url, err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return "", fmt.Errorf("failed to fetch %s: status %d", url, resp.StatusCode)
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return "", fmt.Errorf("failed to read body from %s: %w", url, err)
		}

		content := string(body)

		cacheMu.Lock()
		contentCache[url] = content
		cacheMu.Unlock()

		return content, nil
	})

	if err != nil {
		return "", err
	}

	return v.(string), nil
}

// Helper to build the prompt from remote sources
func buildAgentPrompt(ctx context.Context) (string, error) {
	baseAgentURL := "https://raw.githubusercontent.com/caraya/agent-skills/main/agents/content-editor/agent.md"
	skillURLs := []string{
		"https://raw.githubusercontent.com/caraya/agent-skills/main/skills/markdown-formatting/skill.md",
		"https://raw.githubusercontent.com/caraya/agent-skills/main/skills/grammar-correction/skill.md",
	}

	var fullPrompt strings.Builder

	baseAgent, err := fetchRemoteContent(ctx, baseAgentURL)
	if err != nil {
		return "", err
	}
	fullPrompt.WriteString(baseAgent)
	fullPrompt.WriteString("\n\n# ASSOCIATED SKILLS\n")

	for _, url := range skillURLs {
		skillDef, err := fetchRemoteContent(ctx, url)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Warning: failed to load skill %s: %v\n", url, err)
			continue
		}
		fullPrompt.WriteString(fmt.Sprintf("\n## Skill Module\n%s\n", skillDef))
	}
	return fullPrompt.String(), nil
}

func main() {
	s := server.NewMCPServer("MyGoServer", "1.0.0", server.WithToolCapabilities(false))

	// --- Calculator Tool ---
	calculatorTool := mcp.NewTool("calculate",
		mcp.WithDescription("Perform basic arithmetic operations"),
		mcp.WithString("operation", mcp.Required(), mcp.Enum("add", "subtract", "multiply", "divide")),
		mcp.WithNumber("a", mcp.Required()),
		mcp.WithNumber("b", mcp.Required()),
	)

	s.AddTool(calculatorTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		op, _ := request.RequireString("operation")
		a, _ := request.RequireFloat("a")
		b, _ := request.RequireFloat("b")

		var result float64
		switch op {
		case "add": result = a + b
		case "subtract": result = a - b
		case "multiply": result = a * b
		case "divide":
			if b == 0 { return mcp.NewToolResultError("cannot divide by zero"), nil }
			result = a / b
		}
		return mcp.NewToolResultText(fmt.Sprintf("%f", result)), nil
	})

	// --- Dynamic Content Editor Tool (API Driven) ---
	contentEditorTool := mcp.NewTool("apply_content_editor",
		mcp.WithDescription("Uses the remote Content Editor Agent via Anthropic to refine markdown."),
		mcp.WithString("content", mcp.Required(), mcp.Description("The raw markdown content to edit.")),
	)

	s.AddTool(contentEditorTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		content, _ := request.RequireString("content")

		prompt, err := buildAgentPrompt(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		// Requires ANTHROPIC_API_KEY environment variable
		agent, err := kit.NewIsolatedAgent(ctx,
			kit.WithModel("anthropic/claude-3-5-sonnet-latest"),
			kit.WithSystemPrompt(prompt),
		)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to initialize sub-agent: %v", err)), nil
		}
		defer agent.Close()

		fmt.Fprintf(os.Stderr, "Applying Content Editor agent (API)...\n")
		response, err := agent.Prompt(ctx, "Please apply your skills to edit the following content:\n\n" + content)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Agent execution error: %v", err)), nil
		}

		return mcp.NewToolResultText(response), nil
	})

	// --- Dynamic Content Editor Tool (Zero-Cost Local via `llm`) ---
	localEditorTool := mcp.NewTool("apply_content_editor_local",
		mcp.WithDescription("Uses the remote Content Editor Agent via the local `llm` CLI to refine markdown for free."),
		mcp.WithString("content", mcp.Required(), mcp.Description("The raw markdown content to edit.")),
	)

	s.AddTool(localEditorTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		content, _ := request.RequireString("content")

		prompt, err := buildAgentPrompt(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		fmt.Fprintf(os.Stderr, "Applying Content Editor agent (Local CLI)...\n")
		userPrompt := "Please apply your skills to edit the following content:\n\n" + content

		// Shell out to Simon Willison's `llm` CLI
		cmd := exec.CommandContext(ctx, "llm", "prompt", userPrompt, "--system", prompt)

		output, err := cmd.CombinedOutput()
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Local LLM execution error: %v\nOutput: %s", err, string(output))), nil
		}

		return mcp.NewToolResultText(string(output)), nil
	})

	// --- Start Server ---
	fmt.Fprintf(os.Stderr, "Starting MCP server...\n")
	if err := server.ServeStdio(s); err != nil {
		fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
		os.Exit(1)
	}
}
