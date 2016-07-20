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
    Parse(code string, options map[string]string) []byte
}

func parserInit() {
    mux.Lock()
    defer mux.Unlock()
    if parserMap == nil {
        parserMap = map[string]Parser{
            "odl2go":    NewOdlToGo(),
            "csharp2go": NewCsharpToGo(),
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

    options := make(map[string]string)
    for k, v := range r.Form {
        if k == "action" || k == "src" {
            continue
        }
        if v[0] == "on" {
            v[0] = "true"
        }
        options[k] = v[0]
    }

    if p, ok := parserMap[action]; ok {
        w.Header().Add("Content-Type", "text/plan")
        w.Write(p.Parse(code, options))
    } else {
        w.Write([]byte("not implement " + action))
    }
}
