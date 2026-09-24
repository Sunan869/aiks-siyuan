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
	"strings"
	"sync/atomic"
	"testing"

	ginSessions "github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/siyuan-note/siyuan/kernel/aiks"
	"github.com/siyuan-note/siyuan/kernel/model"
	"github.com/siyuan-note/siyuan/kernel/util"
)

func TestAIKSAuthExchangeCreatesWorkspaceSession(t *testing.T) {
	const ticket = "ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34ab12cd34"
	var exchanges atomic.Int32
	service := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Host != "team.example.test" {
			t.Fatalf("AIKS service Host = %q, want team.example.test", r.Host)
		}
		switch r.URL.Path {
		case "/api/v1/internal/workspace/tickets/consume":
			if exchanges.Add(1) != 1 {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			var input map[string]string
			if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
				t.Fatal(err)
			}
			if input["ticket"] != ticket {
				t.Fatalf("ticket = %q, want %q", input["ticket"], ticket)
			}
			_ = json.NewEncoder(w).Encode(aiks.Principal{
				InstanceID:  "instance-1",
				CompanyID:   "corp-1",
				UserID:      "user-a",
				SpaceID:     "space-a",
				SessionID:   "session-1",
				AuthVersion: 9,
			})
		case "/api/v1/internal/workspace/principals/validate":
			w.WriteHeader(http.StatusNoContent)
		default:
			t.Fatalf("unexpected AIKS service path: %s", r.URL.Path)
		}
	}))
	defer service.Close()

	t.Setenv(aiks.TeamAuthEnabledEnv, "true")
	t.Setenv(aiks.ServiceURLEnv, service.URL)
	t.Setenv(aiks.ServiceHostEnv, "team.example.test")

	originalConf := model.Conf
	originalWorkspaceDir := util.WorkspaceDir
	model.Conf = model.NewAppConf()
	util.WorkspaceDir = "team-workspace"
	t.Cleanup(func() {
		model.Conf = originalConf
		util.WorkspaceDir = originalWorkspaceDir
	})

	engine := gin.New()
	store := cookie.NewStore([]byte("aiks-workspace-cookie-key"))
	engine.Use(ginSessions.Sessions("siyuan", store))
	engine.POST("/api/aiks/auth/exchange", aiksAuthExchange)
	engine.POST("/api/protected", model.CheckAuth, func(c *gin.Context) {
		value, exists := c.Get(aiks.PrincipalContextKey)
		if !exists {
			c.Status(http.StatusInternalServerError)
			return
		}
		principal, ok := value.(*aiks.Principal)
		if !ok || principal.UserID != "user-a" || principal.AuthVersion != 9 {
			c.Status(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusNoContent)
	})

	exchange := func(body string) *httptest.ResponseRecorder {
		request := httptest.NewRequest(http.MethodPost, "https://workspace.example.test/api/aiks/auth/exchange", strings.NewReader(body))
		request.Header.Set("Content-Type", "application/json")
		request.RemoteAddr = "192.0.2.2:1234"
		recorder := httptest.NewRecorder()
		engine.ServeHTTP(recorder, request)
		return recorder
	}

	response := exchange(`{"ticket":"` + ticket + `"}`)
	if response.Code != http.StatusOK {
		t.Fatalf("exchange status = %d, want %d, body = %s", response.Code, http.StatusOK, response.Body.String())
	}
	if strings.Contains(response.Body.String(), ticket) {
		t.Fatal("workspace ticket leaked into response body")
	}
	setCookie := response.Header().Get("Set-Cookie")
	for _, required := range []string{"HttpOnly", "Secure", "SameSite=Lax"} {
		if !strings.Contains(setCookie, required) {
			t.Fatalf("Set-Cookie missing %s: %s", required, setCookie)
		}
	}

	protected := httptest.NewRequest(http.MethodPost, "https://workspace.example.test/api/protected", nil)
	protected.RemoteAddr = "192.0.2.2:1234"
	protected.Header.Set("Origin", "https://workspace.example.test")
	for _, responseCookie := range response.Result().Cookies() {
		protected.AddCookie(responseCookie)
	}
	protectedRecorder := httptest.NewRecorder()
	engine.ServeHTTP(protectedRecorder, protected)
	if protectedRecorder.Code != http.StatusNoContent {
		t.Fatalf("protected status = %d, want %d, body = %s", protectedRecorder.Code, http.StatusNoContent, protectedRecorder.Body.String())
	}

	replayed := exchange(`{"ticket":"` + ticket + `"}`)
	if replayed.Code != http.StatusUnauthorized {
		t.Fatalf("replayed ticket status = %d, want %d", replayed.Code, http.StatusUnauthorized)
	}
}

func TestAIKSAuthExchangeFailsClosed(t *testing.T) {
	t.Setenv(aiks.TeamAuthEnabledEnv, "false")
	engine := gin.New()
	engine.POST("/api/aiks/auth/exchange", aiksAuthExchange)

	request := httptest.NewRequest(http.MethodPost, "/api/aiks/auth/exchange", strings.NewReader(`{"ticket":"x"}`))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	engine.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("disabled exchange status = %d, want %d", recorder.Code, http.StatusNotFound)
	}
}
