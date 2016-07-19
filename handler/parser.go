/**
 * Copyright 2015 @ z3q.net.
 * name : parser
 * author : jarryliu
 * date : 2016-07-19 19:42
 * description :
 * history :
 */
package handler

import (
    "net/http"
    "sync"
)

var (
    parserMap map[string]Parser
    mux sync.Mutex
)

type Parser interface {
    Parse(code string) []byte
}

func parserInit() {
    mux.Lock()
    defer mux.Unlock()
    if parserMap == nil {
        parserMap = map[string]Parser{
            "odl2go":NewOdlToGo(),
        }
    }
}

// 处理程序
func ParseCode(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        w.Write([]byte("Godp v0.1"))
        return
    }
    parserInit()
    r.ParseForm()
    action := r.Form.Get("action")
    code := r.Form.Get("src")
    if p, ok := parserMap[action]; ok {
        w.Header().Add("Content-Type", "text/plan")
        w.Write(p.Parse(code))
    } else {
        w.Write([]byte("not implement " + action))
    }
}
