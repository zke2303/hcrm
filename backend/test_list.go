package main
import (
"fmt"
"net/http"
"time"
)
func main() {
	start := time.Now()
	resp, _ := http.Get("http://localhost:8080/api/v1/users?page=1&pageSize=10")
	fmt.Println("List Time:", time.Since(start), resp.Status)
}
