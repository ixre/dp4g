/**
 * Copyright 2015 @ z3q.net.
 * name : handler
 * author : jarryliu
 * date : 2016-07-19 19:41
 * description :
 * history :
 */
package handler

import (
	"errors"
	"github.com/jsix/dp4g/handler/conf"
	"github.com/jsix/dp4g/handler/parser"
	"github.com/jsix/gof"
	"net/http"
	"os"
	"sync"
	"time"
)

var (
	Template  *gof.CacheTemplate
	data      map[string]interface{}
	parserMap map[string]parser.Parser
	mux       sync.Mutex
)

func parserInit() {
	mux.Lock()
	defer mux.Unlock()
	if parserMap == nil {
		parserMap = map[string]parser.Parser{
			"odl-to-go":      parser.NewOdlToGo(),
			"csharp-to-go":   parser.NewCsharpToGo(),
			"go-entity-form": parser.NewGoEntityForm(),
			"go-iface-impl":  parser.NewIfaceImpl(),
		}
	}
}

func init() {
	Template = gof.NewCacheTemplate("views/", true)
	data = map[string]interface{}{
		"TimeSpan": time.Now().Unix(),
		"Author":   "jsix",
		"SiteUrl":  "http://to2.net/me",
	}
	if err := createTmpEnv(); err != nil {
		panic(err)
	}
	parserInit()
}

func createTmpEnv() error {
	fi, err := os.Stat(conf.TmpPath)
	if err == nil {
		if !fi.IsDir() {
			return errors.New("tmp not dir")
		}
		return nil
	}
	return os.Mkdir(conf.TmpPath, os.ModePerm)
}

// 首页
func Index(w http.ResponseWriter, r *http.Request) {
	Template.Execute(w, "index.html", data)
}

// 页面
func Page(w http.ResponseWriter, r *http.Request) {
	filePath := r.URL.Path[6:]
	Template.Execute(w, filePath, data)
}

// 静态文件
func Assets(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, r.URL.Path[1:])
}

// 处理程序
func ParseCode(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.Write([]byte("Godp v0.1"))
		return
	}
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
