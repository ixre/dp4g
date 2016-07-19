/*
 * DQLoader.js 地区加载
 * Copyright 2010 OPS,All rights reseved!
 * author : newmin  http://b.ops.cc
 * date   : 2010/11/25
 */

/*
 new AreaLoader({
 ele: [document.getElementById("p"), //省select
 document.getElementById("c"),   //市select
 document.getElementById("d")//区select
 ],
 data:[350000,350600,350623],
 data1: [entity.Province,
 entity.City,
 entity.District],        //默认值
 defaultText: '一请选择一',    //未选择的文字说明:如:请选择
 callback: function (x) {     //回执函数,x为返回的结果
 var name = x.name.join(',');
 var id = x.code.join(',');
 //选取之后隐藏
 alert('获取的地区为:' + name + '\r\n获取的地区ID:' + id);
 }
 }).init();
 */

function AreaLoader(opt) {
    this.drP = opt.ele[0];
    this.drC = opt.ele[1];
    this.drD = opt.ele[2];
    this.apiUrl = opt.apiUrl || '/area/child';
    this.data = opt.data;
    this.callback = opt.callback;
}
AreaLoader.prototype = {
    attachEvent: function () {
        this.drP.onchange = (function (t) {
            return function () {
                t.fill(t.drC, this.value, t.drC,{type:2});
            };
        })(this);

        this.drC.onchange = (function (t) {
            return function () {
                t.fill(t.drD, this.value, t.drD,{type:3});
            };
        })(this);

        this.drD.onchange = (function (t) {
            return function () {
                if (t.callback != null && t.callback instanceof Function) {
                    /* 获取选择的结果 */
                    var result = {
                        code: [t.drP.value, t.drC.value, t.drD.value],
                        name: [
                            t.drP.options[t.drP.selectedIndex].innerHTML,
                            t.drC.options[t.drC.selectedIndex].innerHTML,
                            t.drD.options[t.drD.selectedIndex].innerHTML
                        ]
                    };
                    t.callback(result);
                }
            };
        })(this);
    },
    appendOption: function (ele, value, text) {
        var opt = document.createElement("OPTION");
        opt.setAttribute("value", value);
        opt.innerHTML = text;
        ele.appendChild(opt);
        return opt;
    },
    fill: function (ele, code, target,params) {
        var t = this;
        var opts = ele.options;
        for (var i = opts.length - 1; i >= 0; i--) {
            //如果第一个option为默认(0或空),则不删除
            // if (ele == this.drP && i == 0 &&
            //     (opts[i].value.length == 0 || opts[i].value == '0')) {
            //     continue;
            // }
            ele.options.remove(i);
        }

        //相关的下拉选框不为空时,且选中值为默认。则不加载数据
        if (target != ele && ele.value.length > 0 && ele.value.length != '0') {
            target.onchange();
            return;
        }
        params = params || {};
        params.code = code;
        jr.xhr.jsonPost(this.apiUrl,params, function (d) {
            for (var i in d)t.appendOption(ele, d[i].code, d[i].name.trim());
            if (ele.childNodes.length == 0)t.appendOption(ele, '', '--');
            //加载默认值
            if (!t.loadDefault(ele) || target == ele) {
                if (target)target.onchange();
            }
        });
    },
    //加载默认值,只加载一次
    loadDefault: function (ele) {
        if (this.data instanceof Array) {
            switch (ele) {
                case this.drP:
                    return this.setDefault(this.drP, 0);
                case this.drC:
                    return this.setDefault(this.drC, 1);
                case this.drD:
                    return this.setDefault(this.drD, 2);
            }
        }
        return false;
    },
    // 设置默认值,并标记为已加载
    setDefault: function (ele, i) {
        if (this.data[i] > 0) {
            ele.value = this.data[i];
            this.data[i] = 0;
            return true;
        }
        return false;
    },
    init: function () {
        this.attachEvent();
        this.fill(this.drP, 0, this.drP,{type:1});
        return this;
    }
};

define(['jr/core'], function () {
    return {
        bind: function (opt) {
            return new AreaLoader(opt).init();
        }
    }
});