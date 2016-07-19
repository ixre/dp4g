//
// ===========================
//  导出及查询页面通用Js
// ===========================
// 此脚本依赖于：json4html.js

//
//  配置：
//  expr.portal = '这里为导出项的类名';
//
//  expr.checkParams = function (data) {
//    //这里校验参数的准确性,data为Json格式
//    return true;
//  };
//
//
//


if (!window.jr) {
    alert('请加载json4html.js文件!');
}

var expr = {
    ele: 'search_bar',
    appPath: '/',
    handlerPrefix: '/export/',
    portal: '',
    _getParams: function () {
        var e = document.getElementById(this.ele);
        if (e) {
            return encodeURIComponent(jr.json.toString(this.ele));
        }
        return '';
    },
    checkParams: function (data) {
        return true;
    },
    getDataUrl: function () {
        if (this.checkParams()) {
            var _appPath = window.appPath || this.appPath;
            return (_appPath == '/' ? '' : _appPath)
                + this.handlerPrefix
                + 'getExportData?portal=' + this.portal
                + '&params=' + this._getParams();
        }
        return null;
    },
    showExportDialog: function (title, width, height) {
        if (!PW) {
            alert('PW对象为空！');
            return;
        }
        if (!expr.checkParams()) return;
        var _appPath = window.appPath || this.appPath;
        var url = (_appPath == '/' ? '' : _appPath)
            + this.handlerPrefix
            + 'setup?portal=' + expr.portal
            + '&params=' + expr._getParams();
        PW.getWindow(url, title || '导出数据', width || 400, height || 300);
    },
    search: function (id) {
        if (jr.dataGrid) { //jr
            var dg = jr.dataGrid(id);
            dg.options({url: expr.getDataUrl()});
            dg.load();
        } else {
            $('#' + id).datagrid({url: expr.getDataUrl()});
        }
    },
    reload: function (id) {
        if (jr.dataGrid) { //jr
            jr.dataGrid(id).reload();
        } else { //jquery
            $('#' + id).datagrid('reload');
        }
    },
    bindTotalView: function (id) {
        if (!expr.checkParams()) return;
        var _appPath = window.appPath || this.appPath;
        var url = (_appPath == '/' ? '' : _appPath)
            + this.handlerPrefix
            + 'getTotalView?portal=' + expr.portal
            + '&params=' + expr._getParams();

        jr.xhr.post(url, {}, function (json) {
            jr.json.bind(id || 'totalView', json);
        });
    }
};
