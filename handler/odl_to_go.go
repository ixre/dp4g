/**
 * Copyright 2015 @ z3q.net.
 * name : odl_to_go
 * author : jarryliu
 * date : 2016-07-19 19:40
 * description :
 * history :
 */
package handler

import (
	"bytes"
	"sync"
)

var _ Parser = new(odlToGo)

type odlToGo struct {
	mux sync.Mutex
	buf *bytes.Buffer
}

func NewOdlToGo() *odlToGo {
	return &odlToGo{
		buf: bytes.NewBuffer([]byte("")),
	}
}

func (o *odlToGo) Parse(code string, options map[string]string) []byte {
	o.mux.Lock()
	defer o.mux.Unlock()
	o.buf.Write([]byte("it's ok!"))
	d := o.buf.Bytes()
	o.buf.Reset()
	return d
}
