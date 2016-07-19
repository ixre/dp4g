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
    "net/http"
    "github.com/jsix/gof"
    "time"
)
var(
    Template *gof.CachedTemplate
    data map[string]interface{}
)

func init(){
    Template = gof.NewCachedTemplate("views/",true)
    data = map[string]interface{}{
        "TimeSpan":time.Now().Unix(),
        "Author":"jsix",
        "SiteUrl":"http://at3.net/me",
    }
}

// 首页
func Index(w http.ResponseWriter,r *http.Request) {
    Template.Execute(w, "index.html",data)
}

// 页面
func Page(w http.ResponseWriter,r *http.Request){
    filePath := r.URL.Path[6:]
    Template.Execute(w,filePath,data)
}

// 静态文件
func Assets(w http.ResponseWriter,r *http.Request){
    http.ServeFile(w,r,r.URL.Path[1:])
}