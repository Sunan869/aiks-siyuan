package model

import (
	"errors"
	"os"
	"strings"
	"time"

	"github.com/88250/gulu"
)

const confWriteMaxAttempts = 6

func writeConfFile(filePath string, data []byte) error {
	return writeConfFileWithRetry(filePath, data, gulu.File.WriteFileSafer, time.Sleep)
}

func writeConfFileWithRetry(
	filePath string,
	data []byte,
	writer func(string, []byte, os.FileMode) error,
	sleep func(time.Duration),
) error {
	var err error
	for attempt := 1; attempt <= confWriteMaxAttempts; attempt++ {
		err = writer(filePath, data, 0644)
		if err == nil {
			return nil
		}
		if !isTransientConfWriteError(err) || attempt == confWriteMaxAttempts {
			return err
		}
		sleep(time.Duration(attempt*50) * time.Millisecond)
	}
	return err
}

func isTransientConfWriteError(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, os.ErrPermission) {
		return true
	}
	message := strings.ToLower(err.Error())
	return strings.Contains(message, "access is denied") ||
		strings.Contains(message, "used by another process") ||
		strings.Contains(message, "being used by another process")
}
