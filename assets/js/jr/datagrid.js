//
//文件：数据表格
//版本: 1.0
//时间：2014-04-01
//

var grids = {};
function datagrid(ele, config) {
    this.panel = ele.nodeName ? ele : jr.$(ele);
    this.opts = {
        idField: config.idField || "id",//ID域
        url: config.url,
        data: config.data || {}, //数据
        rows: config.size > 0 ? config.size : 10,   //每页条数
        page: 1,//当前页码
        pagination: config.pagination == true ? true : false, //是否分页
        paginationNum:config.paginationNum || 5, //分页链接数
        columns: config.columns[0] instanceof Array ?
            config.columns[0] : config.columns, //列
        afterLoad: config.afterLoad ||config.loaded, //加载完成后触发
        beforeLoad:config.beforeLoad,
    };

    //相关的界面元素
    this.pgEle = null;
    this.loadbox = null;
    this.gridView = null;

    //存入全局表中
    if (this.panel.id) {
        grids[this.panel.id] = this;
    }



    /* 为兼容IE6 */
    //var resizeFunc = (function (t) {
    //    return function () {
    //        t.resize.apply(t);
    //    };
    //})(this);
    //jr.event.add(window, 'load', resizeFunc);
    //window.attachEvent('resize', resizeFunc);
    //jr.event.add(window, 'resize', this.resize.apply(this));

    this.initLayout();

    //重置尺寸
    //this._resize();

    //加载数据
    this.load();
}

datagrid.prototype = {
    options: function (obj) {
        if (obj instanceof Object) {
            for (var attr in obj) {
                this.opts[attr] = obj[attr];
            }
        }
        return this.opts;
    },
    loading: function () {
        //初始化高度
        if (this.gridView.offsetHeight === 0) {
            var headerHeight = this.gridView.previousSibling.offsetHeight;
            var gridviewHeight = this.panel.offsetHeight - headerHeight;
            this.gridView.style.cssText = this.gridView.style.cssText
                .replace(/(\s*)height:[^;]+;/ig, ' height:' + (gridviewHeight > headerHeight ? gridviewHeight + 'px;' : 'auto'));


            var ldLft = Math.ceil((this.gridView.clientWidth - this.loadbox.offsetWidth) / 2);
            var ldTop = Math.ceil((this.gridView.clientHeight - this.loadbox.offsetHeight) / 2);

            this.loadbox.style.cssText = this.loadbox.style.cssText
                .replace(/(;\s*)*left:[^;]+;([\s\S]*)(\s)top:([^;]+)/ig,
                    '$1left:' + ldLft + 'px;$2 top:'
                    + (ldTop < 0 ? -ldTop : ldTop) + 'px');

        }

        this.loadbox.style.display = '';
    },
    initLayout: function () {
        var html = '';
        var cols = this.opts.columns;
        if (cols && cols.length != 0) {
            //添加头部
            html += '<div class="ui-datagrid-header"><table width="100%" cellspacing="0" cellpadding="0"><tr>';
            for (var i in cols) {
                // this.columns_width.push(cols[i].width);
                html += '<td'
                    + (i == 0 ? ' class="first"' : '')
                    + (cols[i].align ? ' align="' + cols[i].align + '"' : '')
                    + (cols[i].width ? ' width="' + cols[i].width + '"' : '')
                    + '><div class="ui-datagrid-header-title">'
                    + cols[i].title
                    + '</div></td>';
            }
            html += '</tr></table></div>';
            //添加内容页
            html += '<div class="ui-datagrid-msg" style="position: absolute; display: inline-block;min-width:60px;top:0;bottom:0;left:0;right:0;margin:auto;">加载中...</div>'
                + '<div class="ui-datagrid-view"></div>';
        }
        this.panel.innerHTML = html;

        if (this.opts.pagination) { //创建分页容器
            this.pgEle = document.createElement('DIV');
            this.pgEle.className = 'ui-pagination';
            this.panel.appendChild(this.pgEle);
        }

        this.gridView = (this.panel.getElementsByClassName
            ? this.panel.getElementsByClassName('ui-datagrid-view')
            : jr.dom.getsByClass(this.panel, 'ui-datagrid-view'))[0];
        this.loadbox = this.gridView.previousSibling;
    },
    //填充列
    fillRows: function (code, data) {
        if (!data) return;
        var item;
        var col;
        var val;
        var html = '';
        var rows = data['rows'] || data;
        if (this.opts.pagination) {
            jr.pagination({
                ele: this.pgEle,
                total: data.total,
                size: this.opts.rows,
                curr: this.opts.page,
                num : this.opts.paginationNum,
                pageChanged: (function (t) {
                    return function (pn) {
                        t.opts.page = pn;
                        t.load();
                    };
                })(this),
            })
        }

        html += '<table width="100%" cellspacing="0" cellpadding="0">';

        for (var i = 0; i < rows.length; i++) {
            item = rows[i];
            html += '<tr'
                + (item[this.opts.idField] != null ? ' data-indent="' + item[this.opts.idField] + '"' : '')
                + '>';

            for (var j in this.opts.columns) {
                col = this.opts.columns[j];
                val = item[col.field];
                html += '<td'
                    + (j == 0 ? ' class="first"' : '')
                    + (col.align ? ' align="' + col.align + '"' : '')
                    + (i == 0 && col.width ? ' width="' + col.width + '"' : '')
                    + '><div class="field-value">'
                    + (col.formatter && col.formatter instanceof Function ? col.formatter(val, item, i) : val)
                    + '</div></td>';

            }
            html += '</tr>';
        }

        html += '</table><div style="clear:both"></div>';

        //gridview的第1个div
        this.gridView.innerHTML = html;

        //this._fixPosition();

        this.gridView.srcollTop = 0;

        this.loadbox.style.display = 'none';

        if (this.opts.afterLoad && this.opts.afterLoad instanceof Function)
            this.opts.afterLoad(data);
    },


    _fixPosition: function () {
    },

    _load_data: function (func) {
        if (!this.opts.url) return;
        if(this.opts.beforeLoad && this.opts.beforeLoad instanceof Function){
            this.opts.beforeLoad();
        }else{
            this.loading(); //显示加载框
        }
        this.opts.data.rows = this.opts.rows;
        this.opts.data.page = this.opts.page;
        var t = this;
        jr.xhr.request({
            uri: this.opts.url,
            data: 'json',
            params: this.opts.data,
            method: 'POST'
        }, {
            success: function (json) {
                t.fillRows(1, json);
            }, error: function () {
                t.fillRows(0, {});
            }
        });

    },
    resize: function () {
        this._fixPosition();
    },
    load: function (data) {
        if (data && data instanceof Object) {
            this.fillRows(1, data);
            return;
        }
        this._load_data();
    },

    /* 重新加载 */
    reload: function (params, data) {
        if (params) {
            this.opts.data = params;
        }
        this.load(data);
    }
};

(function (r) {
    var obj = {
        grid: function (ele, config) {
            return new datagrid(ele, config);
        },
        dataGrid: function (ele, config) {
            if (!config && typeof(ele) == 'string') {
                return grids[ele];
            }
            return new datagrid(ele, config);
        }
    };

    if (r) {
        define(['jr/core', 'jr/pagination'], function (jr) {
            jr.extend(obj);
        })
    } else {
        jr.extend(obj);
    }
})(window.define);



