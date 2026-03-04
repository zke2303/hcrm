package main

import (
"bytes"
"fmt"
"net/http"
"time"
)

func main() {
	start := time.Now()
	// Update user 2
	payload := []byte(`{"realName":"Test","phone":"13800138000"}`)
	req, _ := http.NewRequest("PUT", "http://localhost:8080/api/v1/users/2", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	// Add token if needed... wait, I don't have a token. I'll get unauthorized. 
	resp, err := http.DefaultClient.Do(req)
	fmt.Println("Time:", time.Since(start), "Err:", err, "Status:", resp.StatusCode)
}
