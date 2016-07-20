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
	"regexp"
	"strings"
	"sync"
)

var _ Parser = new(csharpToGo)

type csharpToGo struct {
	mux sync.Mutex
	buf *bytes.Buffer
}

func NewCsharpToGo() *csharpToGo {
	return &csharpToGo{
		buf: bytes.NewBuffer([]byte("")),
	}
}

func (o *csharpToGo) Parse(code string, fmt bool) []byte {
	code = o.fixCode(code)
	o.mux.Lock()
	defer o.mux.Unlock()
	o.buf.WriteString(code)
	codeBytes := o.buf.Bytes()
	o.buf.Reset()
	if fmt {
		var err error
		codeBytes, err = GoFmt(string(codeBytes))
		if err != nil {
			return []byte("Error:" + err.Error())
		}
	}
	return codeBytes
}

var (
	namespaceRegexp  = regexp.MustCompile("([\\S\\s]+)namespace (.+?){([\\S\\s]+)}")
	usingReg         = regexp.MustCompile("using (.+?);")
	typeReg          = regexp.MustCompile("([a-zA-Z]+\\s+)*(interface|class)\\s+(\\w+\\s*)")
	methodCommentReg = regexp.MustCompile("///\\s<summary>(\\s+///)+(.+)\\s+///\\s</summary>")
	revertParamsReg  = regexp.MustCompile("([a-zA-Z]+\\s)*(\\w+)_(\\w+)(,*)") // 颠倒函数参数定义的顺序
	methodReg        = regexp.MustCompile("([^\\s]+)\\s+([A-Za-z0-9]+)\\(([^\\)]*)\\);")
)

func (o *csharpToGo) fixCode(code string) string {
	code = namespaceRegexp.ReplaceAllString(code, "package $2\n$1\n$3")
	code = usingReg.ReplaceAllStringFunc(code, func(str string) string {
		if strings.Index(str, "System") != -1 {
			return ""
		}
		return "import \"$1\""
	})
	code = typeReg.ReplaceAllString(code, "type $3 $2")
	code = methodCommentReg.ReplaceAllString(code, "//$2")
	code = revertParamsReg.ReplaceAllString(code, "$3 $2$4")
	code = methodReg.ReplaceAllString(code, "$2($3)($1)")
	code = o.replaceKeywords(code)
	return code
}

func (o *csharpToGo) replaceKeywords(code string) string {
	s := strings.Replace(code, "class", "struct", -1)
	s = strings.Replace(s, "_", "", -1)
	return s
}