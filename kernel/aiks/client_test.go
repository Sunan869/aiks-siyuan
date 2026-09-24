// SiYuan - From thought to insight, with agents
// Copyright (c) 2020-present, b3log.org
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

package aiks

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestConsumeWorkspaceTicket(t *testing.T) {
	expectedTicket := "ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34"
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("unexpected method: %s", r.Method)
		}
		if r.Host != "team.example.test" {
			t.Fatalf("Host = %q, want team.example.test", r.Host)
		}
		if r.Header.Get("Authorization") != "" {
			t.Fatal("AIKS access token must not be sent to workspace authentication")
		}
		switch r.URL.Path {
		case filterDocumentsPath:
			var input filterDocumentsRequest
			if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
				t.Fatal(err)
			}
			if input.Principal.UserID != "user-a" || len(input.DocumentIDs) != 2 {
				t.Fatalf("unexpected filter input: %+v", input)
			}
			_ = json.NewEncoder(w).Encode(filterDocumentsResponse{DocumentIDs: []string{input.DocumentIDs[1]}})
		case consumeTicketPath:
			var body map[string]string
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatal(err)
			}
			if body["ticket"] != expectedTicket {
				t.Fatalf("ticket = %q, want %q", body["ticket"], expectedTicket)
			}
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(Principal{
				InstanceID:  "instance-1",
				CompanyID:   "corp-1",
				UserID:      "user-a",
				SpaceID:     "space-a",
				SessionID:   "session-1",
				AuthVersion: 4,
			})
		case validatePrincipalPath:
			principal := &Principal{}
			if err := json.NewDecoder(r.Body).Decode(principal); err != nil {
				t.Fatal(err)
			}
			if !principal.Valid() || principal.UserID != "user-a" {
				t.Fatalf("unexpected principal validation body: %+v", principal)
			}
			w.WriteHeader(http.StatusNoContent)
		default:
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
	}))
	defer server.Close()

	client, err := NewClient(server.URL, "team.example.test")
	if err != nil {
		t.Fatal(err)
	}
	principal, err := client.ConsumeWorkspaceTicket(context.Background(), expectedTicket)
	if err != nil {
		t.Fatal(err)
	}
	if principal.CompanyID != "corp-1" || principal.UserID != "user-a" || principal.AuthVersion != 4 {
		t.Fatalf("unexpected principal: %+v", principal)
	}
	if err = client.ValidatePrincipal(context.Background(), principal); err != nil {
		t.Fatal(err)
	}
	visible, err := client.FilterReadableDocuments(
		context.Background(),
		principal,
		[]string{"20260924180000-private1", "20260924180000-shared01"},
	)
	if err != nil {
		t.Fatal(err)
	}
	if len(visible) != 1 || visible[0] != "20260924180000-shared01" {
		t.Fatalf("visible documents = %v", visible)
	}
}

func TestAIKSClientRejectsUnsafeOriginsAndResponses(t *testing.T) {
	for _, rawURL := range []string{
		"https://127.0.0.1:28081",
		"http://example.com:28081",
		"http://127.0.0.1:28081/path",
		"http://user@127.0.0.1:28081",
		"http://127.0.0.1",
	} {
		if _, err := NewClient(rawURL, "team.example.test"); err == nil {
			t.Fatalf("unsafe service URL accepted: %s", rawURL)
		}
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(Principal{InstanceID: "instance-1", CompanyID: "corp-1", UserID: "user-a"})
	}))
	defer server.Close()
	client, err := NewClient(server.URL, "team.example.test")
	if err != nil {
		t.Fatal(err)
	}
	if _, err = client.ConsumeWorkspaceTicket(context.Background(), "ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34"); err == nil {
		t.Fatal("malformed principal response was accepted")
	}
	if _, err = client.ConsumeWorkspaceTicket(context.Background(), "not-a-ticket"); err == nil {
		t.Fatal("malformed workspace ticket was accepted")
	}
}
