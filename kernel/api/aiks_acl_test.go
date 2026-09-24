// SiYuan - From thought to insight, with agents
// Copyright (c) 2020-present, b3log.org
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/siyuan-note/siyuan/kernel/aiks"
	"github.com/siyuan-note/siyuan/kernel/model"
)

func TestFilterAIKSReadableDocuments(t *testing.T) {
	t.Setenv(aiks.TeamAuthEnabledEnv, "true")
	service := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/v1/internal/workspace/documents/filter" || r.Host != "team.example.test" {
			t.Fatalf("unexpected authorization request: %s host=%s", r.URL.Path, r.Host)
		}
		var input struct {
			Principal   aiks.Principal `json:"principal"`
			DocumentIDs []string       `json:"document_ids"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			t.Fatal(err)
		}
		if input.Principal.UserID != "user-a" || len(input.DocumentIDs) != 2 {
			t.Fatalf("unexpected authorization input: %+v", input)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"document_ids": []string{input.DocumentIDs[1]},
		})
	}))
	defer service.Close()
	t.Setenv(aiks.ServiceURLEnv, service.URL)
	t.Setenv(aiks.ServiceHostEnv, "team.example.test")

	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = httptest.NewRequest(http.MethodPost, "/api/test", nil)
	c.Set(aiks.PrincipalContextKey, &aiks.Principal{
		InstanceID:  "instance-1",
		CompanyID:   "corp-1",
		UserID:      "user-a",
		SpaceID:     "space-a",
		SessionID:   "session-1",
		AuthVersion: 1,
	})
	allowed, err := filterAIKSReadableDocuments(c, []string{
		"20260924180000-private1",
		"20260924180000-shared01",
	})
	if err != nil {
		t.Fatal(err)
	}
	if allowed["20260924180000-private1"] || !allowed["20260924180000-shared01"] {
		t.Fatalf("unexpected allowed set: %+v", allowed)
	}

	blocks, err := filterAIKSReadableBlocks(c, []*model.Block{
		{ID: "20260924180100-block001", RootID: "20260924180000-private1"},
		{ID: "20260924180100-block002", RootID: "20260924180000-shared01"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(blocks) != 1 || blocks[0].RootID != "20260924180000-shared01" {
		t.Fatalf("unexpected filtered blocks: %+v", blocks)
	}
	matchedBlocks, matchedRoots, pageCount := 99, 88, 77
	sanitizeAIKSSearchCounts(c, blocks, 3, &matchedBlocks, &matchedRoots, &pageCount)
	if matchedBlocks != 1 || matchedRoots != 1 || pageCount != 3 {
		t.Fatalf("unexpected sanitized counts: blocks=%d roots=%d pages=%d", matchedBlocks, matchedRoots, pageCount)
	}
}

func TestFilterAIKSReadableDocumentsAllowsTrustedLoopbackServiceContext(t *testing.T) {
	t.Setenv(aiks.TeamAuthEnabledEnv, "true")
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = httptest.NewRequest(http.MethodPost, "/api/test", nil)
	allowed, err := filterAIKSReadableDocuments(c, []string{"20260924180000-service1"})
	if err != nil || !allowed["20260924180000-service1"] {
		t.Fatalf("trusted service context rejected: allowed=%v err=%v", allowed, err)
	}
}
