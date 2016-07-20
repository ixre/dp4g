/**
 * Copyright 2015 @ z3q.net.
 * name : odl_to_go
 * author : jarryliu
 * date : 2016-07-19 19:40
 * description :
 * history :
 */
package parser

import (
	"bytes"
	"fmt"
	"github.com/jsix/dp4g/handler/util"
	"regexp"
	"strings"
	"sync"
)

var _ Parser = new(csharpToGo)

type goIfaceImpl struct {
	mux sync.Mutex
	buf *bytes.Buffer
}

func NewIfaceImpl() *goIfaceImpl {
	return &goIfaceImpl{
		buf: bytes.NewBuffer([]byte("")),
	}
}

func (o *goIfaceImpl) Parse(code string, options map[string]string) []byte {
	o.mux.Lock()
	defer o.mux.Unlock()
	ImplementGoInterface(o.buf, code)
	codeBytes := o.buf.Bytes()
	o.buf.Reset()
	if options["fmt"] == "true" {
		var err error
		codeBytes, err = util.GoFmt(string(codeBytes))
		if err != nil {
			return []byte("Error:" + err.Error())
		}
	}
	return codeBytes
}

var (
	goIfaceNameReg   = regexp.MustCompile(`(//\s*(\S+)\s*)*(\w+)\s+interface\s*\{`)
	goIfaceMemberReg = regexp.MustCompile(`(//\s*(.+?)\s*)*(\w+)(\(.+)`)
)

func ImplementGoInterface(buf *bytes.Buffer, code string) {
	matches := goIfaceNameReg.FindStringSubmatch(code)
	inName := matches[3] // 接口名称
	inDesc := matches[2] // 接口备注
	if inName == "" {
		buf.WriteString("Error: not find interface")
		return
	}
	if buf.Len() == 0 {
		buf.WriteString("package main\n\n")
	}
	if inName[:1] == "I" {
		inName = inName[1:]
	}

	if inDesc == "" {
		inDesc = "The implment of " + inName
	}
	buf.WriteString("// ")
	buf.WriteString(inDesc)
	buf.WriteString("\ntype ")
	buf.WriteString(inName)
	buf.WriteString("Impl struct {\n")
	buf.WriteString("}\n\n")

	writeGoImplementConstructor(buf, inName)
	writeGoImplementMembers(buf, inName, code)
}

// 实现构造函数
func writeGoImplementConstructor(buf *bytes.Buffer, inName string) {
	buf.WriteString("func New")
	buf.WriteString(inName)
	buf.WriteString("()*")
	buf.WriteString(inName)
	buf.WriteString("{\n")
	buf.WriteString("    return &")
	buf.WriteString(inName)
	buf.WriteString("{\n")
	buf.WriteString("    }\n")
	buf.WriteString("}")
}

// 实现方法
func writeGoImplementMembers(buf *bytes.Buffer, inName string, code string) {
	matches := goIfaceMemberReg.FindAllStringSubmatch(code, -1)
	prefix := fmt.Sprintf("func (%s *%s) ", strings.ToLower(inName[:1]), inName)
	for _, v := range matches {
		mmName := v[3]
		mmDesc := v[2]
		mmBody := v[4]
		buf.WriteString("\n\n")
		if len(mmDesc) > 0 {
			buf.WriteString("// ")
			buf.WriteString(mmDesc)
			buf.WriteString("\n")
		}
		buf.WriteString(prefix)
		buf.WriteString(" ")
		buf.WriteString(mmName)
		buf.WriteString(" ")
		buf.WriteString(mmBody)
		buf.WriteString(" {\n")
		buf.WriteString("    panic(\" not implement\")\n")
		buf.WriteString("}")
	}
}
