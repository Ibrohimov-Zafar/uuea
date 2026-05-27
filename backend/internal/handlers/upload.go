package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

func (a *API) Upload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	defer file.Close()

	if err := os.MkdirAll(a.UploadDir, 0o755); err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	ext := filepath.Ext(header.Filename)
	name := uuid.NewString() + ext
	dest := filepath.Join(a.UploadDir, name)
	out, err := os.Create(dest)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer out.Close()
	if _, err := io.Copy(out, file); err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	url := fmt.Sprintf("/uploads/%s", name)
	writeJSON(w, http.StatusOK, map[string]string{"url": url, "path": name})
}

func UploadsFileServer(dir string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		name := strings.TrimPrefix(r.URL.Path, "/uploads/")
		if name == "" || strings.Contains(name, "..") {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, filepath.Join(dir, name))
	})
}

func nowTS() string {
	return time.Now().UTC().Format(time.RFC3339)
}
