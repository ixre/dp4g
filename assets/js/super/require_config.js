var URL_ARGS = '200606001';
require.config({
        //By default load any module IDs from scripts/serve
        baseUrl: (baseJsUrl ||'') + '/assets/js/',
        urlArgs:function(id,url){ //防止缓存
           return (url.indexOf('?') == -1?'?':'&')+URL_ARGS;
        },
        waitSeconds: 15,
        //except, if the module ID starts with "lib"
        paths: {
            shop: 'touch/shop', //以shop开头的前缀,从那个路径找文件
            'mui':'../mui',
            'jquery':'../easyui/jquery.min',
            'jquery.easyui':'../easyui/jquery.easyui.min',
            'jquery.easyui.zh':'../easyui/locale/easyui-lang-zh_CN',
            'base':'super/base',
        },
        // load backbone as a shim
        shim: { //依赖关系
            'base': {
                //The underscore script dependency should be loaded before loading backbone.js
                deps: ['jr/core'],
                // use the global 'Backbone' as the module name.
                exports: 'Main'
            },
            'jquery.easyui.zh':{
                deps:['jquery','jquery.easyui']
            },
            'jquery.easyui':{
                deps:['jquery']
            },
            'extra/export':{
                deps:['jr/core']
            },
            'mui/component':{
                deps:['jr/core']
            }
        }
    }
);