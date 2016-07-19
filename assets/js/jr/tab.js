/**
 *
 *
 *==============  HTML 定义  ===================
 1. 作为frame切换

 HTML :
 -----------------------------------------------
 <div class="ui-tabs">
 <div title="Tab1" href="Tab1"></div>
 <div title="Tab2" href="Tab2"></div>
 <div title="Tab3" href="Tab3"></div>

 <div class="frames" id="frames">
 <div class="frame">1</div>
 <div class="frame">2</div>
 <div class="frame">3</div>
 </div>
 </div>

 JS :
 -----------------------------------------------
 var tab = new tabControl({
    frames:document.getElementById('frames')
 }).init();


 2.切换网页

 HTML :
 -----------------------------------------------
 <div class="ui-tabs" id="tabs">
 <div title="Tab1" href="index1.html"></div>
 <div title="Tab2" href="index2.html"></div>
 <div title="Tab3" href="index3.html"></div>
 </div>

 JS :
 -----------------------------------------------
 var tab = new tabControl({
    panel:document.getElementById('tabs')
 }).init();

 * @param opt
 */

function tabControl(opt) {
    //框架集
    this.panel = null;
    this.frames = null; //框架
    this.tabs = null;  //标签
    this.fitHeight = false; //自动适应高度
    this.heightOffset = 0; //高度偏移量
    this.loadType = 'frame'; //加载方式,[ajax|frame]
    this.event = 'click'; //鼠标事件
    this.frameClass = 'frame';
    //切换时触发的函数,可通过index获取tab选项
    this.frameChange = function(frame, indent, index){
        return true;
    };
    //如果指定了frames,那么panel默认为其父元素

    for (var attr in opt) {
        if (opt[attr] != null) {
            this[attr] = opt[attr];
        }
    }
    if (this.frames != null && this.frames.nodeName && this.panel == null) {
        this.panel = this.frames.parentNode;
    }
    if (typeof(this.panel) == 'string')
        this.panel = document.getElementById(this.panel);
}

tabControl.prototype = {
    //获取tab下所有的LI
    getTabChild: function () {
        return this.tabs.getElementsByTagName('LI');
    },
    getFrameChild: function () {
        var list = [];
        var eles = this.frames.childNodes;
        for (var i = 0; i < eles.length; i++) {
            if (eles[i].nodeName[0] != '#' &&
                eles[i].className.indexOf(this.frameClass) != -1) {
                list.push(eles[i]);
            }
        }
        return list;
    },
    each: function (list, call) {
        for (var i = 0; i < list.length; i++) {
            call(i, list[i]);
        }
    },
    createNode: function (nodeName, attrs) {
        var n = document.createElement(nodeName);
        for (var attr in attrs) {
            if (attr == 'html') {
                n.innerHTML = attrs[attr];
                continue
            }
            n.setAttribute(attr, attrs[attr]);
        }
        return n;
    },
    getTabsFromPanel: function () {
        var tabs = [];
        this.each(this.panel.childNodes, (function (t) {
            return function (_, e) {
                if (e.nodeName[0] != '#') {
                    var obj = {
                        title: e.getAttribute('title'),
                        href: e.getAttribute('href'),
                        closeable: e.getAttribute('closeable') == 'true',
                    }
                    if (obj.title && obj.href) {
                        tabs.push(obj);
                        t.panel.removeChild(e);
                    }
                }
            };
        })(this));
        return tabs;
    },
    initUI: function () {
        //如果tab或frames为空则创建
        if (this.tabs != null && this.frames != null) return;
        this.tabs = this.createNode('UL', {class: 'tabs'});
        //针对IE7优化
        var ie7 = this.createNode('DIV', {
            style: 'height:0px;overflow:hidden;clear:both;margin:0;',
            html: '-'
        });
        var mask = this.createNode('DIV', {class: 'mask hidden'});
        var loader = this.createNode('DIV', {
            class: 'loading hidden',
            html: '<div><span class="lft"></span><span>加载中</span></div>',
        });
        with (this.panel) {
            //如果frame不存在,则自动创建
            if (this.frames == null) {
                appendChild(this.tabs);
                appendChild(ie7);
                appendChild(mask);
                appendChild(loader);
                this.frames = this.createNode('DIV', {class: 'frames'});
                appendChild(this.frames);
            } else {
                insertBefore(this.tabs, this.frames);
                insertBefore(ie7, this.frames);
                insertBefore(mask, this.frames);
                insertBefore(loader, this.frames);
            }
        }
        //自适应高度
        if (this.fitHeight) {
            var offset = this.heightOffset;
            with (this.frames) {
                var height = Math.max(document.body.clientHeight,
                        document.documentElement.clientHeight)
                    - offsetTop - parentNode.offsetTop * 2;
                style.height = (height + offset) + 'px';
            }
        }
    },
    init: function () {
        //加载panel里的默认元素
        var tabChild = this.getTabsFromPanel();
        this.initUI();
        if (tabChild.length > 0) {
            this.each(tabChild, (function (t) {
                return function (_, e) {
                    t.add(e.title, e.href, e.closeable);
                }
            })(this));
            this.set(0); //默认选中第一个
        }
        return this;
    },
    pageBeforeLoad: function () {
        this.showLoadBar();
    },
    pageLoad: function () {
        this.hiddenLoadBar();
    },
    showLoadBar: function () {
    },
    hiddenLoadBar: function () {
    },

    //添加选项卡
    add: function (title, url, closeable) {
        var li = document.createElement('LI');
        li.onmouseout = function () {
            if (this.className != 'current') this.className = '';
        };
        li.onmouseover = function () {
            if (this.className != 'current') this.className = 'hover';
        };
        li.setAttribute('href', url);
        this.tabs.appendChild(li);
        li.appendChild(this.createNode('SPAN', {class: 'lft'}));
        //添加标题
        var titEle = this.createNode('SPAN', {
            class: 'tab-title',
            html: title
        })
        li.appendChild(titEle);

        //添加触发事件
        var titCall = (function (t, li) {
            return function () {
                var tabs = t.getTabChild();
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i] == li) {
                        t.set(i);
                        break;
                    }
                }
            };
        })(this, li);
        if (titEle.attachEvent) {
            titEle.attachEvent('on' + this.event, titCall);
        } else {
            titEle.addEventListener(this.event, titCall, false);
        }

        if (closeable != false) {
            var closeEle = this.createNode('SPAN', {
                class: 'tab-close',
                title: '关闭选项卡',
                html: '<i class="fa fa-times" aria-hidden="true"></i><span>X</span>'
            });
            li.appendChild(closeEle);
            closeEle.onclick = (function (t, li) {
                return function () {
                    t.close(li); //todo:refactor to index
                };
            })(this, li);
        }
        li.appendChild(this.createNode('SPAN', {class: 'rgt'}));

        // 添加content frame
        this.frames.appendChild(this.createNode('DIV', {class: this.frameClass}));
        return li;
    },
    show: function (text, url, closeable) {
        var index = -1;
        var _tabs = this.getTabChild();
        var _cur_indents = url;

        jr.each(_tabs, function (i, obj) {
            if (_cur_indents == obj.getAttribute('href')) {
                index = i;
                return false;
            }
        });
        if (index == -1) { //不存在则创建
            index = _tabs.length;
            this.add(text, url, closeable); //添加选项卡
        }

        //触发事件,切换IFRAME
        this.set(index, true);
    },
    set: function (index, isOpen) {
        //如果不是刚打开的tab,则关闭加载提示
        if (!isOpen) {
            this.hiddenLoadBar();
        }
        var ptr = this;
        var _frames = this.getFrameChild();
        var _lis = this.getTabChild();
        var frameClass = this.frameClass;
        this.each(_lis, function (i, li) {
            if (index == i) {
                li.className = 'current';
                _frames[i].className = frameClass + ' current';
                _frames[i].style.height = '100%';
                var indent = li.getAttribute('href');
                //如果返回了false,则停止加载
                if (ptr.frameChange instanceof Function) {
                    if (!ptr.frameChange(_frames[i], indent,i)) {
                        return false;
                    }
                }
                if (_frames[i].innerHTML == '') { //加载内容
                    ptr.load(_frames[i], indent, i);
                }
            }else {
                li.className = '';
                _frames[i].className = frameClass;
                _frames[i].style.height = '0px';
                _frames[i].style.overflow = 'hidden';
            }
        });

    },
    load: function (frameDiv, url,index) {
        //框架加载
        if (this.loadType == 'frame') {
            this.pageBeforeLoad();
            var frame;
            try {
                //解决ie8下有边框的问题
                frame = this.createNode('<IFRAME frameborder="0">');
            } catch (ex) {
                frame = this.createNode('IFRAME');
            }
            frame.src = url;
            frameDiv.appendChild(frame);
            // 添加加载回调函数
            var loadCall = (function (t) {
                return function () {
                    t.pageLoad.apply(t);
                };
            })(this);
            frame.frameBorder = '0';
            frame.setAttribute('frameBorder', '0', 0); //IE
            frame.setAttribute('href', url);
            frame.setAttribute('id', 'ifr_' + url);
            jr.event.add(frame, 'load', loadCall);
            return false;
        }
        //AJAX加载
        if (this.loadType == 'ajax') {
            jr.load(frameDiv, url);
            return false;
        }
    },
    //关闭tab,如果不指定关闭按钮，则关闭当前页
    close: function (t) {
        var closeIndex = -1;
        var isActived = false;
        var closeLi = null;

        if (t) {
            //根据标题来关闭
            if (typeof (t) == 'string') {
                var list = jr.dom.getsByClass(this.tabs, 'tab-title');
                for (var i = 0; i < list.length; i++) {
                    if (t == list[i].innerHTML.replace(/<[^>]+>/g, '')) {
                        closeIndex = i;
                        closeLi = list[i].parentNode.parentNode;
                        break;
                    }
                }
            } else {
                closeLi = t;
                var list = this.getTabChild();
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == t) {
                        closeIndex = i;
                        break;
                    }
                }
            }
        } else {
            //关闭当前选中的tab
            var _lis = this.getTabChild();
            for (var i = 0; i < _lis.length; i++) {
                if (_lis[i].className == 'current') {
                    closeIndex = i;
                    closeLi = _lis[i];
                    break;
                }
            }
        }

        //判断是否关闭当前选中的tab
        if (closeLi) {
            isActived = closeLi.className == 'current';
        }

        if (closeIndex > 0) {
            var lis = this.getTabChild();
            var ifrs = this.frames.getElementsByTagName('DIV');
            //移除LI
            this.tabs.removeChild(lis[closeIndex]);
            //释放IFRAME资源
            if (ifrs[closeIndex]) {
                var ifr = ifrs[closeIndex].childNodes[0];
                if (ifr && ifr.nodeName == 'IFRAME') {
                    ifr.src = '';
                    ifr = null;
                }
                this.frames.removeChild(ifrs[closeIndex]);
            }

            //如果关闭当前激活的tab,则显示其他的tab和iframe
            if (isActived) {
                this.hiddenLoadBar();
                /* 避免当打开就刷新时仍然加载问题 */
                if (closeIndex >= lis.length) {
                    closeIndex = lis.length - 1;
                }
                this.set(closeIndex);
            }
        }
    },

    //获取Tab Iframe的框架,如果不包括则返回null
    getWindow: function (t) {
        if (typeof (t) == 'string') {
            var frameIndex = -1;
            var list = jr.dom.getsByClass(this.tabs, 'tab-title');
            for (var i = 0; i < list.length; i++) {
                if (t == list[i].innerHTML.replace(/<[^>]+>/g, '')) {
                    frameIndex = i;
                    break;
                }
            }
            //没有框架或超出数量
            if (frameIndex == -1) return null;
            var frameDivs = this.frames.getElementsByTagName('DIV');
            if (frameIndex >= frameDivs.length) return null;

            //获取Iframe
            var iframes = frameDivs[frameIndex].getElementsByTagName('IFRAME');
            //不包含iframe
            if (iframes.length == 0) return null;
            return iframes[0].contentWindow;
        }
        return null;
    }
};

(function (r) {
    var obj = {
        init: function (opt) {
            return new tabControl(opt).init();
        }
    };
    if (r) {
        r(function () {
            return obj;
        });
    } else {
        jr.extend({tab: obj});
    }
})(window.define);
