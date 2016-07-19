function SimplePagination(opt) {
    this.opts = {
        ele: null, //容器
        total: 0, //总页数
        size: 10, //每页显示条数
        pages: 0, //总页数
        num: 5, //每页显示分页链接数
        curr:1, //当前页码,从1开使
        previousText: opt.previousText || '上一页',
        nextText: opt.nextText || '下一页',
        infoText: opt.infoText || '共{curr}/{pages}页,{total}条',
        pageChanged: null, //页面更改回调函数
    };
    for (var i in opt) {
        this.opts[i] = opt[i];
    }
    this.nodes = {
        ele:this.opts.ele,
        previous: null, //上一页
        next: null, //下一页
        info: null, //信息
    }
    this.init();
}

SimplePagination.prototype = {
    getPages: function (total, size) {
        var p = parseInt(total / size);
        if (total % size == 0) {
            return p
        }
        return p + 1
    },
    createNode: function (nodeName, cls, text, pn) {
        var a = document.createElement(nodeName);
        a.className = cls;
        a.innerHTML = text;
        if (pn > 0) {
            a.setAttribute("pn", pn);
        }
        return a;
    },
    init: function () {
        //获取总页数
        this.opts.pages = this.getPages(this.opts.total, this.opts.size);
        this.nodes.previous = this.createNode('A', 'pn previous', this.opts.previousText);
        this.nodes.ele.appendChild(this.nodes.previous);
        this.nodes.next = this.createNode('A', 'pn next', this.opts.nextText);
        this.nodes.ele.appendChild(this.nodes.next);
        this.nodes.info = this.createNode('SPAN', 'info',
            jr.template(this.opts.infoText, {
                curr: this.opts.curr,
                pages: this.opts.pages,
                total: this.opts.total
            }));
        this.nodes.ele.appendChild(this.nodes.info);
        //初始化事件
        this.nodes.previous.onclick = (function (t) {
            return function () {
                if (t.opts.curr > 1) {
                    t.opts.curr -= 1;
                    t.notifyPageChanged(t.opts.curr);
                }
            };
        })(this);
        this.nodes.next.onclick = (function (t) {
            return function () {
                if (t.opts.curr < t.opts.pages) {
                    t.opts.curr += 1;
                    t.notifyPageChanged(t.opts.curr);
                }
            };
        })(this);
        //创建相应的链接
        this.renewPageNodes();
    },
    notifyPageChanged: function (pn) {
        this.renewPageNodes();
        this.nodes.info.innerHTML = jr.template(this.opts.infoText, {
            curr: this.opts.curr,
            pages: this.opts.pages,
            total: this.opts.total
        });
        if (this.opts.pageChanged && this.opts.pageChanged instanceof Function) {
            this.opts.pageChanged(pn);
        }
    },
    pnClick: function (pn) {
        if (this.opts.pages >= pn) {
            this.opts.curr = pn;
            this.notifyPageChanged(pn);
        }
    },
    removePnNodes: function () {
        var nodes = this.nodes.ele.childNodes;
        var offset = 3; //包含了3个不需移除的元素
        for (var i = nodes.length - offset; i >= 0; i--) {
            var n = nodes[i];
            if (n.nodeName[0] == '#' ||
                (n != this.nodes.next &&
                n != this.nodes.previous &&
                n != this.nodes.info)) {
                this.nodes.ele.removeChild(n);
            }
        }
    },
    //更新页码数
    renewPageNodes: function () {
        this.removePnNodes();
        var linkNumber = this.opts.num; //页码数
        var currIndex = this.opts.curr; //当前页,从1开始
        var pageCount = this.opts.pages; //总页面
        var beginPage = currIndex; //页码链接开始页
        var offset = parseInt(linkNumber / 2) + linkNumber % 2; //选中
        if (beginPage - offset > pageCount - linkNumber &&
            pageCount - linkNumber >0) { //最后一组
            beginPage = pageCount - linkNumber;
        } else if (beginPage > offset && beginPage != pageCount) {
            beginPage -= offset; //超出第一组,但不为最后一组
        } else {
            beginPage = 0;
        }


        for (var i = 1, j = beginPage; i <= linkNumber && j < pageCount; i++) {
            j++;
            var node = this.createNode('A', j == currIndex ? //当前页
                'pn current' : 'pn', j, j);
            this.nodes.ele.insertBefore(node, this.nodes.next);
            node.onclick = (function (t, pn) {
                return function () {
                    t.pnClick(pn, this);
                };
            })(this, j);
        }
    }
};

(function(r){
    var obj = {
        pagination:function(opt){
            return new SimplePagination(opt);
        }
    };
    if(r){
        require(['jr/core'],function(jr){
            return jr.extend(obj);
        });
    }else{
        jr.extend(obj);
    }
})(window.define);