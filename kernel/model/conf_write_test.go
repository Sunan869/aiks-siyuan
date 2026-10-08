package model

import (
	"errors"
	"os"
	"testing"
	"time"
)

func TestWriteConfFileWithRetryRetriesTransientPermissionErrors(t *testing.T) {
	attempts := 0
	writer := func(_ string, _ []byte, _ os.FileMode) error {
		attempts++
		if attempts < 3 {
			return &os.PathError{Op: "rename", Path: "conf.json", Err: os.ErrPermission}
		}
		return nil
	}

	err := writeConfFileWithRetry("conf.json", []byte("{}"), writer, func(time.Duration) {})
	if err != nil {
		t.Fatalf("expected transient permission error to recover, got %v", err)
	}
	if attempts != 3 {
		t.Fatalf("expected 3 attempts, got %d", attempts)
	}
}

func TestWriteConfFileWithRetryDoesNotRetryPermanentErrors(t *testing.T) {
	attempts := 0
	permanent := errors.New("disk full")
	writer := func(_ string, _ []byte, _ os.FileMode) error {
		attempts++
		return permanent
	}

	err := writeConfFileWithRetry("conf.json", []byte("{}"), writer, func(time.Duration) {})
	if !errors.Is(err, permanent) {
		t.Fatalf("expected permanent error, got %v", err)
	}
	if attempts != 1 {
		t.Fatalf("expected a permanent error to stop after one attempt, got %d", attempts)
	}
}
