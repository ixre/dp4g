/**
 * Copyright 2015 @ z3q.net.
 * name : go
 * author : jarryliu
 * date : 2016-07-20 10:49
 * description :
 * history :
 */
package util

import (
	"errors"
	"github.com/jsix/gof/shell"
	"io/ioutil"
	"os"
)

func GoFmt(code string) ([]byte, error) {
	const tmpFile string = "tmp/csharp.go"
	var err error
	var d []byte
	fi, err := os.OpenFile(tmpFile, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, os.ModePerm)
	if err == nil {
		fi.Write([]byte(code))
		fi.Close()
		result, output, err := shell.Run("gofmt -w tmp/csharp.go")
		if result != 0 {
			if err == nil {
				err = errors.New(output)
			}
			return d, err
		}
		d, err = ioutil.ReadFile(tmpFile)
		if err == nil {
			err = os.Remove(fi.Name())
		}
	}
	return d, err
}
