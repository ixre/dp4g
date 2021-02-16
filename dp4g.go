/**
 * Copyright 2015 @ to2.net.
 * name : godp
 * author : jarryliu
 * date : 2016-07-19 15:23
 * description :
 * history :
 */
package main

import (
	"flag"
	"fmt"
	"github.com/jsix/dp4g/handler"
	"log"
	"net/http"
)

func main() {
	var (
		port  int
		debug bool
	)

	flag.IntVar(&port, "port", 8080, "web server port")
	flag.BoolVar(&debug, "debug", false, "enable debug")
	flag.Parse()

	s := http.NewServeMux()
	s.HandleFunc("/", handler.Index)
	s.HandleFunc("/page/", handler.Page)
	s.HandleFunc("/assets/", handler.Assets)
	s.HandleFunc("/p", handler.ParseCode)

	log.Println("serve running on addr :", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), s)

}
