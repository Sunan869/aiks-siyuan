// SiYuan - From thought to insight, with agents
// Copyright (c) 2020-present, b3log.org
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

package aiks

import "testing"

func TestPrincipalValidation(t *testing.T) {
	valid := Principal{
		CompanyID:   "corp-1",
		UserID:      "user_a",
		SessionID:   "session-1",
		AuthVersion: 7,
	}
	if !valid.Valid() {
		t.Fatal("valid principal was rejected")
	}

	tests := []Principal{
		{},
		{CompanyID: "corp-1", UserID: " user", SessionID: "session-1", AuthVersion: 7},
		{CompanyID: "corp-1", UserID: "user\nname", SessionID: "session-1", AuthVersion: 7},
		{CompanyID: "corp-1", UserID: "user", SessionID: "", AuthVersion: 7},
		{CompanyID: "corp-1", UserID: "user", SessionID: "session-1", AuthVersion: 0},
	}
	for _, principal := range tests {
		if principal.Valid() {
			t.Fatalf("invalid principal accepted: %+v", principal)
		}
	}
}

func TestPrincipalEqualIdentity(t *testing.T) {
	left := Principal{CompanyID: "corp-1", UserID: "user-a", SessionID: "session-1", AuthVersion: 2}
	right := left
	if !left.EqualIdentity(right) {
		t.Fatal("identical principals were not equal")
	}
	right.AuthVersion = 3
	if left.EqualIdentity(right) {
		t.Fatal("different auth versions were treated as the same session")
	}
}

func TestTeamAuthRequiresExplicitEnablement(t *testing.T) {
	t.Setenv(TeamAuthEnabledEnv, "")
	if TeamAuthEnabled() {
		t.Fatal("team auth enabled without explicit configuration")
	}
	t.Setenv(TeamAuthEnabledEnv, "true")
	if !TeamAuthEnabled() {
		t.Fatal("team auth did not enable explicitly")
	}
	t.Setenv(TeamAuthEnabledEnv, " false ")
	if TeamAuthEnabled() {
		t.Fatal("false team auth value was accepted")
	}
}
