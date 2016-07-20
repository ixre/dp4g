/**
 * Copyright 2015 @ z3q.net.
 * name : entity_form
 * author : jarryliu
 * date : 2016-07-20 13:35
 * description :
 * history :
 */
package parser

import (
	"bytes"
	"regexp"
	"strconv"
	"strings"
	"sync"
)

var _ Parser = new(goEntityForm)

const (
	goEntityHeader = `<!DOCTYPE html>
<html>
<head>
    <title></title>
    <link rel="stylesheet" href="{{.Var.StaticServe}}/assets/su/semantic.min.css?spam={{.Var.Spam}}"/>
</head>
<body>
    `
	goEntityScript = `
<script src="{{.Var.StaticServe}}/assets/js/lib/jquery.3x.js?spam={{.Var.Spam}}"></script>
<script src="{{.Var.StaticServe}}/assets/su/semantic.min.js?spam={{.Var.Spam}}"></script>
<script src="{{.Var.StaticServe}}/assets/js/require.js?spam={{.Var.Spam}}"></script>

<script type="text/javascript">
    var entity = {};
    var $B = {};
    var baseJsUrl ={{.Var.StaticServe}};
    require([baseJsUrl + '/assets/js/require_config.js'], function () {
        require(['base'], pageLoad);
    });

    function pageLoad(b) {
        $B = b;
        $B.json.bind('form1', entity);

        $B.$('btn_save').onclick = function () {
            if ($B.validator.validate('form1')) {
                var data = $B.json.toObject('form1');
                $B.xhr.jsonPost('', data, function (json) {
                    if (json.result) {
                        $B.dialog.alert('保存成功',function(){}, "ok");
                    } else {
                        $B.dialog.alert(json.message,null,'error');
                    }
                });
            }
        }
    }
</script>`

	goEntitySaveButton = `
    <div class="field">
        <div class="ui primary button" id="btn_save">
           提交
        </div>
    </div>`
)

type goEntityForm struct {
	mux         sync.Mutex
	buf         *bytes.Buffer
	blockReg    *regexp.Regexp
	propertyReg *regexp.Regexp
}

func NewGoEntityForm() *goEntityForm {
	return &goEntityForm{
		buf:         bytes.NewBuffer([]byte("")),
		blockReg:    regexp.MustCompile(`struct\s*\{([\S\s]+)\}`),
		propertyReg: regexp.MustCompile(`(//(.*)\s*)*(\w+)\s*(\w+)\s*(` + "`[^`]*`" + `)*`),
	}
}

func (o *goEntityForm) Parse(code string, options map[string]string) []byte {
	o.mux.Lock()
	defer o.mux.Unlock()
	columns, _ := strconv.Atoi(options["columns"])
	o.buf.WriteString(goEntityHeader)

	o.buf.WriteString(`<div class="ui form segment" id="form1">`)
	// 插入属性表单
	o.writePropertyFromCode(o.buf, code, columns)
	o.writeButton(o.buf)
	// 插入结尾
	o.buf.WriteString(`</div>`)
	// 插入脚本
	o.writeScriptTag(o.buf)
	o.buf.WriteString("<body>\n</html>")

	codeBytes := o.buf.Bytes()
	o.buf.Reset()
	if options["fmt"] == "true" {

	}
	return codeBytes
}

func (o *goEntityForm) writePropertyFromCode(buf *bytes.Buffer, code string, columns int) {
	code = o.blockReg.FindStringSubmatch(code)[1]
	matches := o.propertyReg.FindAllStringSubmatch(code, -1)
	for i, mc := range matches {
		if columns > 1 && columns < 5 && i%columns == 0 {
			if i > 0 {
				buf.WriteString("</div>\n")
			}
			switch columns {
			case 2:
				buf.WriteString("<div class=\"two fields\">\n")
			case 3:
				buf.WriteString("<div class=\"three fields\">\n")
			case 4:
				buf.WriteString("<div class=\"four fields\">\n")
			case 5:
				buf.WriteString("<div class=\"five fields\">\n")
			}
		}
		o.writeProperty(buf, mc[2], mc[3])
	}
}

func (o *goEntityForm) getNameAndComment(name string) (string, string) {
	comment := ""
	i := strings.Index(name, ",")
	if i == -1 {
		i = strings.Index(name, "，")
		if i == -1 {
			i = strings.Index(name, " ")
		}
	}
	if i > 0 {
		comment = name[i+1:]
		name = name[:i]
	}
	return name, comment
}

func (o *goEntityForm) writeProperty(buf *bytes.Buffer, name string, field string) {

	field = strings.TrimSpace(field)
	name = strings.TrimSpace(name)
	comment := ""
	if name == "" {
		name = field
	} else {
		name, comment = o.getNameAndComment(name)
	}

	buf.WriteString("<div class=\"field\">\n")
	buf.WriteString("<label>")
	buf.WriteString(name)
	buf.WriteString("：</label>\n")
	buf.WriteString("<div class=\"ui input\">")
	buf.WriteString(`<input type="text" name="`)
	buf.WriteString(field)
	buf.WriteString(`" field="`)
	buf.WriteString(field)
	buf.WriteString(`" value="" required=""/>`)
	buf.WriteString("</div>\n")
	if len(comment) > 0 {
		buf.WriteString(`<div class="ui comment remark">`)
		buf.WriteString(comment)
		buf.WriteString("</div>\n")
	}
	buf.WriteString("</div>\n")
}

// 插入脚本
func (o *goEntityForm) writeButton(buf *bytes.Buffer) {
	buf.WriteString(goEntitySaveButton)
}

// 插入脚本
func (o *goEntityForm) writeScriptTag(buf *bytes.Buffer) {
	buf.WriteString(goEntityScript)
}
