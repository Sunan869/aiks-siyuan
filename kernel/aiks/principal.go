// SiYuan - From thought to insight, with agents
// Copyright (c) 2020-present, b3log.org
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

package aiks

import (
	"os"
	"strings"
)

const (
	// PrincipalContextKey 是 Gin 上下文中可信 AIKS 团队身份的固定键。
	PrincipalContextKey = "aiks-principal"

	// TeamAuthEnabledEnv 显式启用 AIKS 团队认证。默认关闭，避免影响普通 SiYuan 工作区。
	TeamAuthEnabledEnv = "AIKS_TEAM_AUTH_ENABLED"
)

// Principal 是 AIKS Service 完成企业认证后交给 SiYuan Kernel 的最小可信身份。
// 这里不保存钉钉令牌、AIKS access token 或任何第三方凭据。
type Principal struct {
	CompanyID   string `json:"company_id"`
	UserID      string `json:"user_id"`
	SessionID   string `json:"session_id"`
	AuthVersion string `json:"auth_version"`
}

// Valid 只接受有界、无控制字符的稳定身份字段。
// 身份的真实性由后续 SSO ticket 交换验证，本函数仅负责拒绝畸形持久化内容。
func (p Principal) Valid() bool {
	return validIdentity(p.CompanyID) &&
		validIdentity(p.UserID) &&
		validIdentity(p.SessionID) &&
		validIdentity(p.AuthVersion)
}

// EqualIdentity 判断两个 Principal 是否属于同一授权会话。
func (p Principal) EqualIdentity(other Principal) bool {
	return p.CompanyID == other.CompanyID &&
		p.UserID == other.UserID &&
		p.SessionID == other.SessionID &&
		p.AuthVersion == other.AuthVersion
}

// TeamAuthEnabled 仅在显式设置为 true 时启用团队认证。
func TeamAuthEnabled() bool {
	return strings.EqualFold(strings.TrimSpace(os.Getenv(TeamAuthEnabledEnv)), "true")
}

func validIdentity(value string) bool {
	if value == "" || len(value) > 512 || strings.TrimSpace(value) != value {
		return false
	}
	for _, r := range value {
		if r < 0x21 || r == 0x7f {
			return false
		}
	}
	return true
}
