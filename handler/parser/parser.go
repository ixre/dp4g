/**
 * Copyright 2015 @ to2.net.
 * name : parser
 * author : jarryliu
 * date : 2016-07-20 13:30
 * description :
 * history :
 */
package parser

type Parser interface {
	Parse(code string, options map[string]string) []byte
}
