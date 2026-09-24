// SiYuan - From thought to insight, with agents
// Copyright (c) 2020-present, b3log.org
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

package api

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/siyuan-note/siyuan/kernel/aiks"
)

var errAIKSTeamAuthorizationUnavailable = errors.New("AIKS team authorization unavailable")

func filterAIKSReadableDocuments(c *gin.Context, documentIDs []string) (map[string]bool, error) {
	allowed := make(map[string]bool, len(documentIDs))
	if !aiks.TeamAuthEnabled() {
		for _, id := range documentIDs {
			allowed[id] = true
		}
		return allowed, nil
	}

	value, exists := c.Get(aiks.PrincipalContextKey)
	if !exists {
		// Team mode also permits the loopback AIKS Service API token. That path is the
		// trusted content writer and intentionally has no end-user Principal.
		for _, id := range documentIDs {
			allowed[id] = true
		}
		return allowed, nil
	}
	principal, ok := value.(*aiks.Principal)
	if !ok || principal == nil || !principal.Valid() {
		return nil, errAIKSTeamAuthorizationUnavailable
	}
	if len(documentIDs) == 0 {
		return allowed, nil
	}
	client, err := aiks.NewClientFromEnvironment()
	if err != nil {
		return nil, errAIKSTeamAuthorizationUnavailable
	}
	visible, err := client.FilterReadableDocuments(c.Request.Context(), principal, documentIDs)
	if err != nil {
		return nil, errAIKSTeamAuthorizationUnavailable
	}
	for _, id := range visible {
		allowed[id] = true
	}
	return allowed, nil
}

func isAIKSDocumentReadable(c *gin.Context, documentID string) (bool, error) {
	allowed, err := filterAIKSReadableDocuments(c, []string{documentID})
	if err != nil {
		return false, err
	}
	return allowed[documentID], nil
}
