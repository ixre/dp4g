// 服务端接受 begin 和size, 返回total和rows
(function (define) {
    if (define) {
        define(['jr/core'],function (jr) {
            return {
                //文档滚动高度
                getDocumentTop: function () {
                    var scrollTop, bodyScrollTop = 0, documentScrollTop = 0;
                    if (document.body) {
                        bodyScrollTop = document.body.scrollTop;
                    }
                    if (document.documentElement) {
                        documentScrollTop = document.documentElement.scrollTop;
                    }
                    scrollTop = (bodyScrollTop - documentScrollTop > 0) ?
                        bodyScrollTop : documentScrollTop;
                    return scrollTop;
                },
                //可视窗口高度
                getWindowHeight: function () {
                    var windowHeight = 0;
                    if (document.compatMode == "CSS1Compat") {
                        windowHeight = document.documentElement.clientHeight;
                    } else {
                        windowHeight = document.body.clientHeight;
                    }
                    return windowHeight;
                },
                //滚动条滚动高度
                getScrollHeight: function () {
                    var scrollHeight, bodyScrollHeight = 0, documentScrollHeight = 0;
                    if (document.body) {
                        bodyScrollHeight = document.body.scrollHeight;
                    }
                    if (document.documentElement) {
                        documentScrollHeight = document.documentElement.scrollHeight;
                    }
                    scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
                    return scrollHeight;
                },
                //监听事件
                listenEvent: function (event, func) {
                    document.attachEvent ? window.attachEvent('on' + event, func) :
                        window.addEventListener(event, func, false);
                },
                //注册滚动加载事件
                scrollLoad: function (call) {
                    this.listenEvent('scroll', (function (t) {
                        return function () {
                            if (t.getScrollHeight() == t.getWindowHeight() + t.getDocumentTop()) {
                                if (call)call(t);
                            }
                        };
                    })(this));
                },
                //滚动并带xhr加载
                xhrScrollLoad: function (opt) {
                    var data = {
                        _isOver: false, //是否已经加载完毕
                        _isLoad: false, //是否正在加载
                        totalNum:0, //总数量
                        loadNum: 0, //已经加载数量
                        //-----------------------------
                        size: 10,  //每次加载数量
                        url: location.href, //加载地址
                        params: {}, //参数
                        load: function (code, data, opt) {
                        }, //加载事件,code:0为开使请求,1为请求完成,2为请求失败
                    };
                    for (var i in opt) {
                        if (opt[i])data[i] = opt[i];
                    }
                    this.xhrLoad(data); //打开页面后加载数据
                    this.listenEvent('scroll', (function (t, opt) {
                        return function () {
                            if (t.getScrollHeight() == t.getWindowHeight() + t.getDocumentTop()) {
                                t.xhrLoad(opt);
                            }
                        };
                    })(this, data));
                },
                xhrLoad: function (opt) {
                    if (opt._isOver || opt._isLoad)return;
                    opt.load(0, null);
                    if (opt.params instanceof Object) {
                        opt._isLoad = true; //标记为正在加载
                        opt.params.size = opt.size;
                        opt.params.begin = opt.loadNum;
                    } else {
                        alert('参数必须为对象');
                        return false;
                    }
                    //客户端判断是否已经加载所有数据
                    if(opt.totalNum !=0 && opt.loadNum == opt.totalNum){
                        setTimeout(function() {
                            opt.load(1, {total: opt.totalNum, rows: []}, opt);
                        },300);
                        return false;
                    }
                    //服务端数据格式:{total:10,rows:[]}
                    jr.xhr.jsonPost(opt.url, opt.params, (function (t) {
                        return function (d) {
                            t._isLoad = false; //标记为已加载
                            t.totalNum = d.total;
                            var rowLen = d.rows.length;
                            if (t.totalNum == opt.loadNum || rowLen == 0) {
                                opt._isOver = true;
                            }
                            opt.load(1, d, opt); //加载完成后触发事件
                            opt.loadNum += rowLen; //更新加载数量
                        };
                    })(opt), function () {
                        opt._isLoad = false;
                        opt.load(2, null, opt);
                    });
                },
            }
        });
    }
})(window.define);