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
	"io"
	"net/http"

	ginSessions "github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/siyuan-note/siyuan/kernel/aiks"
	"github.com/siyuan-note/siyuan/kernel/util"
)

const maxAIKSAuthExchangeBody = 4 * 1024

type aiksAuthExchangeInput struct {
	Ticket string `json:"ticket"`
}

// aiksAuthExchange 将 AIKS Service 签发的一次性 ticket 换成当前 workspace 的 HttpOnly session。
// ticket 只发送到回环 AIKS Service，SiYuan 不接收钉钉令牌或 AIKS access/refresh token。
func aiksAuthExchange(c *gin.Context) {
	if !aiks.TeamAuthEnabled() {
		c.Status(http.StatusNotFound)
		return
	}

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxAIKSAuthExchangeBody)
	decoder := json.NewDecoder(c.Request.Body)
	decoder.DisallowUnknownFields()
	input := &aiksAuthExchangeInput{}
	if err := decoder.Decode(input); err != nil || input.Ticket == "" {
		c.JSON(http.StatusBadRequest, map[string]any{"code": -1, "msg": "Invalid AIKS workspace ticket"})
		return
	}
	var extra any
	if err := decoder.Decode(&extra); err != io.EOF {
		c.JSON(http.StatusBadRequest, map[string]any{"code": -1, "msg": "Invalid AIKS workspace ticket"})
		return
	}

	client, err := aiks.NewClientFromEnvironment()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, map[string]any{"code": -1, "msg": "AIKS team authentication unavailable"})
		return
	}
	principal, err := client.ConsumeWorkspaceTicket(c.Request.Context(), input.Ticket)
	if err != nil {
		c.JSON(http.StatusUnauthorized, map[string]any{"code": -1, "msg": "AIKS workspace ticket rejected"})
		return
	}

	session := util.GetSession(c)
	if !util.SetAIKSPrincipal(session, *principal) {
		c.JSON(http.StatusUnauthorized, map[string]any{"code": -1, "msg": "AIKS workspace principal rejected"})
		return
	}
	ginSessions.Default(c).Options(ginSessions.Options{
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	if err = session.Save(c); err != nil {
		session.Clear(c)
		c.JSON(http.StatusInternalServerError, map[string]any{"code": -1, "msg": "AIKS workspace session unavailable"})
		return
	}

	c.Header("Cache-Control", "no-store")
	c.Header("Referrer-Policy", "no-referrer")
	c.JSON(http.StatusOK, map[string]any{"code": 0})
}
