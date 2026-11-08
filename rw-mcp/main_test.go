package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name      string
		operation string
		a         float64
		b         float64
		want      float64
		wantErr   string
	}{
		{name: "addition", operation: "add", a: 2, b: 3, want: 5},
		{name: "subtraction", operation: "subtract", a: 8, b: 3, want: 5},
		{name: "multiplication", operation: "multiply", a: 2, b: 3, want: 6},
		{name: "division", operation: "divide", a: 9, b: 3, want: 3},
		{name: "division by zero", operation: "divide", a: 9, b: 0, wantErr: "cannot divide by zero"},
		{name: "unknown operation preserves zero result", operation: "unknown", a: 1, b: 2, want: 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := calculate(tt.operation, tt.a, tt.b)
			if tt.wantErr != "" {
				if err == nil || err.Error() != tt.wantErr {
					t.Fatalf("calculate() error = %v, want %q", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("calculate() unexpected error: %v", err)
			}
			if got != tt.want {
				t.Errorf("calculate() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestFetchRemoteContentCachesSuccessfulResponse(t *testing.T) {
	resetContentCache()

	requests := 0
	setDefaultClient(t, testRoundTripper(func(r *http.Request) (*http.Response, error) {
		requests++
		return response(r, http.StatusOK, "remote content"), nil
	}))

	const url = "https://example.test/agent.md"
	for range 2 {
		got, err := fetchRemoteContent(context.Background(), url)
		if err != nil {
			t.Fatalf("fetchRemoteContent() unexpected error: %v", err)
		}
		if got != "remote content" {
			t.Errorf("fetchRemoteContent() = %q, want %q", got, "remote content")
		}
	}
	if requests != 1 {
		t.Errorf("server received %d requests, want 1", requests)
	}
}

func TestFetchRemoteContentDoesNotCacheFailures(t *testing.T) {
	resetContentCache()

	requests := 0
	setDefaultClient(t, testRoundTripper(func(r *http.Request) (*http.Response, error) {
		requests++
		if requests == 1 {
			return response(r, http.StatusServiceUnavailable, "temporarily unavailable"), nil
		}
		return response(r, http.StatusOK, "recovered"), nil
	}))

	const url = "https://example.test/retry.md"
	if _, err := fetchRemoteContent(context.Background(), url); err == nil ||
		!strings.Contains(err.Error(), "status 503") {
		t.Fatalf("first fetch error = %v, want status 503", err)
	}

	got, err := fetchRemoteContent(context.Background(), url)
	if err != nil {
		t.Fatalf("second fetch unexpected error: %v", err)
	}
	if got != "recovered" {
		t.Errorf("second fetch = %q, want %q", got, "recovered")
	}
	if requests != 2 {
		t.Errorf("server received %d requests, want 2", requests)
	}
}

func TestFetchRemoteContentReturnsTransportError(t *testing.T) {
	resetContentCache()
	setDefaultClient(t, testRoundTripper(func(*http.Request) (*http.Response, error) {
		return nil, errors.New("connection failed")
	}))

	_, err := fetchRemoteContent(context.Background(), "https://example.test/agent.md")
	if err == nil || !strings.Contains(err.Error(), "failed to fetch content") {
		t.Fatalf("fetchRemoteContent() error = %v, want transport error", err)
	}
}

func TestFetchRemoteContentReturnsReadError(t *testing.T) {
	resetContentCache()
	setDefaultClient(t, testRoundTripper(func(r *http.Request) (*http.Response, error) {
		return &http.Response{
			StatusCode: http.StatusOK,
			Body:       errorReaderCloser{},
			Header:     make(http.Header),
			Request:    r,
		}, nil
	}))

	_, err := fetchRemoteContent(context.Background(), "https://example.test/agent.md")
	if err == nil || !strings.Contains(err.Error(), "failed to read body") {
		t.Fatalf("fetchRemoteContent() error = %v, want body read error", err)
	}
}

func TestFetchRemoteContentRejectsInvalidURL(t *testing.T) {
	resetContentCache()

	_, err := fetchRemoteContent(context.Background(), "://invalid")
	if err == nil || !strings.Contains(err.Error(), "failed to create request") {
		t.Fatalf("fetchRemoteContent() error = %v, want request creation error", err)
	}
}

func TestBuildAgentPromptIncludesBaseAndAvailableSkills(t *testing.T) {
	resetContentCache()

	responses := map[string]string{
		"/caraya/agent-skills/coding/agents/content-editor/agent.md":    "base agent",
		"/caraya/agent-skills/main/skills/markdown-formatting/skill.md": "markdown skill",
		"/caraya/agent-skills/main/skills/grammar-correction/skill.md":  "grammar skill",
	}
	setDefaultClient(t, testRoundTripper(func(r *http.Request) (*http.Response, error) {
		body, ok := responses[r.URL.Path]
		if !ok {
			return nil, fmt.Errorf("unexpected URL: %s", r.URL)
		}
		return response(r, http.StatusOK, body), nil
	}))

	prompt, err := buildAgentPrompt(context.Background())
	if err != nil {
		t.Fatalf("buildAgentPrompt() unexpected error: %v", err)
	}
	for _, want := range []string{
		"base agent",
		"# ASSOCIATED SKILLS",
		"## Skill Module\nmarkdown skill",
		"## Skill Module\ngrammar skill",
	} {
		if !strings.Contains(prompt, want) {
			t.Errorf("buildAgentPrompt() result does not contain %q:\n%s", want, prompt)
		}
	}
	if strings.Index(prompt, "markdown skill") > strings.Index(prompt, "grammar skill") {
		t.Errorf("buildAgentPrompt() skills are out of order:\n%s", prompt)
	}
}

func TestBuildAgentPromptRequiresBaseAgent(t *testing.T) {
	resetContentCache()
	setDefaultClient(t, testRoundTripper(func(*http.Request) (*http.Response, error) {
		return nil, errors.New("connection failed")
	}))

	prompt, err := buildAgentPrompt(context.Background())
	if err == nil || prompt != "" {
		t.Fatalf("buildAgentPrompt() = (%q, %v), want empty prompt and error", prompt, err)
	}
}

type testRoundTripper func(*http.Request) (*http.Response, error)

func (roundTripper testRoundTripper) RoundTrip(request *http.Request) (*http.Response, error) {
	return roundTripper(request)
}

func setDefaultClient(t *testing.T, roundTripper http.RoundTripper) {
	t.Helper()
	previousClient := http.DefaultClient
	http.DefaultClient = &http.Client{Transport: roundTripper}
	t.Cleanup(func() {
		http.DefaultClient = previousClient
	})
}

func response(request *http.Request, status int, body string) *http.Response {
	return &http.Response{
		StatusCode: status,
		Body:       io.NopCloser(strings.NewReader(body)),
		Header:     make(http.Header),
		Request:    request,
	}
}

type errorReaderCloser struct{}

func (errorReaderCloser) Read([]byte) (int, error) {
	return 0, errors.New("body read failed")
}

func (errorReaderCloser) Close() error {
	return nil
}

func resetContentCache() {
	cacheMu.Lock()
	contentCache = make(map[string]string)
	cacheMu.Unlock()
}
