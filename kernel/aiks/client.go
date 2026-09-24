// SiYuan - From thought to insight, with agents
// Copyright (c) 2020-present, b3log.org
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

package aiks

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

var (
	ErrPrincipalRejected  = errors.New("AIKS workspace principal rejected")
	ErrServiceUnavailable = errors.New("AIKS team service unavailable")
)

const (
	ServiceURLEnv  = "AIKS_TEAM_SERVICE_URL"
	ServiceHostEnv = "AIKS_TEAM_SERVICE_HOST"

	consumeTicketPath     = "/api/v1/internal/workspace/tickets/consume"
	validatePrincipalPath = "/api/v1/internal/workspace/principals/validate"
	filterDocumentsPath   = "/api/v1/internal/workspace/documents/filter"
	maxResponseBytes      = 32 * 1024
)

type Client struct {
	baseURL *url.URL
	host    string
	http    *http.Client
}

func NewClientFromEnvironment() (*Client, error) {
	return NewClient(os.Getenv(ServiceURLEnv), os.Getenv(ServiceHostEnv))
}

func NewClient(rawURL, host string) (*Client, error) {
	baseURL, err := url.Parse(rawURL)
	if err != nil || baseURL.Scheme != "http" || baseURL.User != nil || baseURL.RawQuery != "" || baseURL.Fragment != "" ||
		(baseURL.Path != "" && baseURL.Path != "/") {
		return nil, errors.New("invalid AIKS team service URL")
	}
	ip := net.ParseIP(baseURL.Hostname())
	if ip == nil || !ip.IsLoopback() || baseURL.Port() == "" {
		return nil, errors.New("AIKS team service must use a fixed numeric loopback origin")
	}
	host = strings.TrimSpace(host)
	publicURL, publicErr := url.Parse("https://" + host)
	if host == "" || len(host) > 512 || strings.Contains(host, " ") || containsControl(host) ||
		publicErr != nil || publicURL.User != nil || publicURL.Host != host || publicURL.Hostname() == "" ||
		publicURL.Path != "" || publicURL.RawQuery != "" || publicURL.Fragment != "" {
		return nil, errors.New("invalid AIKS team service Host")
	}
	return &Client{
		baseURL: baseURL,
		host:    host,
		http: &http.Client{
			Timeout: 5 * time.Second,
			CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
	}, nil
}

func (client *Client) ValidatePrincipal(ctx context.Context, principal *Principal) error {
	if principal == nil || !principal.Valid() {
		return errors.New("invalid AIKS workspace principal")
	}
	body, err := json.Marshal(principal)
	if err != nil {
		return errors.New("encode AIKS workspace principal")
	}
	endpoint := *client.baseURL
	endpoint.Path = validatePrincipalPath
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint.String(), bytes.NewReader(body))
	if err != nil {
		return errors.New("create AIKS workspace principal request")
	}
	request.Host = client.host
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Accept", "application/json")

	response, err := client.http.Do(request)
	if err != nil {
		return ErrServiceUnavailable
	}
	defer response.Body.Close()
	_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, maxResponseBytes))
	if response.StatusCode == http.StatusNoContent {
		return nil
	}
	if response.StatusCode >= 400 && response.StatusCode < 500 {
		return ErrPrincipalRejected
	}
	return ErrServiceUnavailable
}


type filterDocumentsRequest struct {
	Principal   Principal `json:"principal"`
	DocumentIDs []string  `json:"document_ids"`
}

type filterDocumentsResponse struct {
	DocumentIDs []string `json:"document_ids"`
}

func (client *Client) FilterReadableDocuments(ctx context.Context, principal *Principal, documentIDs []string) ([]string, error) {
	if principal == nil || !principal.Valid() || len(documentIDs) > 512 {
		return nil, errors.New("invalid AIKS workspace document filter")
	}
	for _, id := range documentIDs {
		if !validIdentity(id) {
			return nil, errors.New("invalid AIKS workspace document id")
		}
	}
	body, err := json.Marshal(filterDocumentsRequest{
		Principal:   *principal,
		DocumentIDs: documentIDs,
	})
	if err != nil {
		return nil, errors.New("encode AIKS workspace document filter")
	}
	endpoint := *client.baseURL
	endpoint.Path = filterDocumentsPath
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint.String(), bytes.NewReader(body))
	if err != nil {
		return nil, errors.New("create AIKS workspace document filter request")
	}
	request.Host = client.host
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Accept", "application/json")

	response, err := client.http.Do(request)
	if err != nil {
		return nil, ErrServiceUnavailable
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, maxResponseBytes))
		if response.StatusCode >= 400 && response.StatusCode < 500 {
			return nil, ErrPrincipalRejected
		}
		return nil, ErrServiceUnavailable
	}
	data, err := io.ReadAll(io.LimitReader(response.Body, maxResponseBytes+1))
	if err != nil || len(data) > maxResponseBytes {
		return nil, ErrServiceUnavailable
	}
	output := &filterDocumentsResponse{}
	if err = json.Unmarshal(data, output); err != nil || len(output.DocumentIDs) > len(documentIDs) {
		return nil, ErrServiceUnavailable
	}
	requested := make(map[string]struct{}, len(documentIDs))
	for _, id := range documentIDs {
		requested[id] = struct{}{}
	}
	seen := make(map[string]struct{}, len(output.DocumentIDs))
	for _, id := range output.DocumentIDs {
		if _, ok := requested[id]; !ok || !validIdentity(id) {
			return nil, ErrServiceUnavailable
		}
		if _, duplicate := seen[id]; duplicate {
			return nil, ErrServiceUnavailable
		}
		seen[id] = struct{}{}
	}
	return output.DocumentIDs, nil
}

func (client *Client) ConsumeWorkspaceTicket(ctx context.Context, ticket string) (*Principal, error) {
	if !validTicket(ticket) {
		return nil, errors.New("invalid AIKS workspace ticket")
	}
	body, err := json.Marshal(map[string]string{"ticket": ticket})
	if err != nil {
		return nil, errors.New("encode AIKS workspace ticket")
	}
	endpoint := *client.baseURL
	endpoint.Path = consumeTicketPath
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint.String(), bytes.NewReader(body))
	if err != nil {
		return nil, errors.New("create AIKS workspace ticket request")
	}
	request.Host = client.host
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Accept", "application/json")

	response, err := client.http.Do(request)
	if err != nil {
		return nil, errors.New("AIKS workspace ticket exchange unavailable")
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, maxResponseBytes))
		return nil, errors.New("AIKS workspace ticket rejected")
	}
	data, err := io.ReadAll(io.LimitReader(response.Body, maxResponseBytes+1))
	if err != nil || len(data) > maxResponseBytes {
		return nil, errors.New("invalid AIKS workspace ticket response")
	}
	principal := &Principal{}
	if err = json.Unmarshal(data, principal); err != nil || !principal.Valid() {
		return nil, errors.New("invalid AIKS workspace principal")
	}
	return principal, nil
}

func validTicket(ticket string) bool {
	if len(ticket) != 64 {
		return false
	}
	for _, r := range ticket {
		if !(r >= '0' && r <= '9') && !(r >= 'a' && r <= 'f') {
			return false
		}
	}
	return true
}

func containsControl(value string) bool {
	for _, r := range value {
		if r < 0x20 || r == 0x7f {
			return true
		}
	}
	return false
}
