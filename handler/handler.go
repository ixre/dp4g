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
	"github.com/jsix/gof"
	"net/http"
	"os"
	"time"
)

var (
	Template *gof.CachedTemplate
	data     map[string]interface{}
)

func init() {
	Template = gof.NewCachedTemplate("views/", true)
	data = map[string]interface{}{
		"TimeSpan": time.Now().Unix(),
		"Author":   "jsix",
		"SiteUrl":  "http://at3.net/me",
	}
	if err := createTmpEnv(); err != nil {
		panic(err)
	}

}

func createTmpEnv() error {
	fi, err := os.Stat("tmp")
	if err == nil {
		if !fi.IsDir() {
			return errors.New("tmp not dir")
		}
		return nil
	}
	return os.Mkdir("tmp", os.ModePerm)
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
