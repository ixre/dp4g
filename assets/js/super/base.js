define(["super/jr.all"], function () {
    renderUi();
    var tab = {
        getWin: function () {
            var win = window;
            while (win.parent != win) {
                win = win.parent;
            }
            return win;
        },
        check: function () {
            if (this.getWin().FwTab) return true;
            alert('不支持此功能');
            return false;
        },
        open: function (title, url, closeable) {
            if (this.check()) {
                this.getWin().FwTab.show(title, url, closeable);
            }
        },
        close: function (title) {
            if (this.check()) {
                this.getWin().FwTab.close(title);
            }
        },
        closeAndRefresh: function (title) {
            if (this.check()) {
                var win = this.getWin().FwTab.getTargetWindow(title);
                if (win != null) {
                    if (win.refresh)
                        win.refresh();
                }
                this.getWin().FwTab.close();
            }
        }
    };

    var cls = jr;
    cls.extend({
        parseTmpl: function (htm) {
            return htm.replace(/(\{|\})/ig, '$1$1');
        },
        float: function (val) {
            return parseFloat(val);
        },
        //tab控件
        tab: tab,
        //确认框
        confirm: function (a1, a2, a3) {
            jr.dialog.confirm(a1, a2, a3);
        },
        //提示框
        alert: function (a1, a2, a3, a4) {
            jr.dialog.alert(a1, a2, a3, a4);
        },
        html: function (ele, html) {
            ele = ele.nodeName ? ele : this.$(ele);
            if (ele) {
                if (html != null) {
                    ele.innerHTML = html;
                }
                return ele.innerHTML;
            }
            return '';
        },
        //unix转为字符
        unix2str: function (v) {
            if (typeof(v) == 'string') {
                v = parseInt(v);
            }
            return new Date(v * 1000).format("yyyy-MM-dd HH:mm");
        },
        //unix转为时间
        unix2Date: function (v) {
            if (typeof(v) == 'string') {
                v = parseInt(v);
            }
            return new Date(v * 1000).format("yyyy-MM-dd");
        },
        //获取数值
        roundStr: function (v) {
            if (typeof(v) == 'string') {
                v = parseFloat(v);
            }
            return v.toFixed(2).toString().replace(/\.0(0*)$/, "");
        }
    });
    return cls;
});


function renderUi() {
    // 设置高度Grid高度
    var grid = document.getElementById('dg');
    if (grid) {
        grid.style.height = jr.screen.height() + 'px';
        if (window.refresh == null) {
            window.refresh = function () {
                expr.search('dg');
            };
        }
    }
    setExport();
    parseEasyUi();
}

// 设置数据控件参数
function setExport() {
    if (window.expr) {
        if (expr.ele == null || expr.ele.length == 0) {
            expr.ele = 'search_bar';
        }
        if (expr.checkParams == null) {
            expr.checkParams = function (data) {
                return true;
            };
        }
    }
}

// 重新渲染EasyUI
function parseEasyUi() {
    if (window.$) {
        var timer;

        function parse() {
            if ($.parser && !window.renderedFlag) {
                clearInterval(timer);
                $.parser.parse();
                window.renderedFlag = true;
            }
        }

        timer = setInterval(parse, 10);
    }
}