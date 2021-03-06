
require.config({
        //By default load any module IDs from scripts/serve
        baseUrl: (baseJsUrl ||'') + '/assets/js/',
        //except, if the module ID starts with "lib"
        paths: {
            shop: 'touch/shop', //以shop开头的前缀,从那个路径找文件
            uc : 'touch/uc',
            'jquery':'lib/jquery.2x',
            'jquery.slides':'lib/jquery.slides',
        },
        // load backbone as a shim
        shim: { //依赖关系
            'backbone': {
                //The underscore script dependency should be loaded before loading backbone.js
                deps: ['underscore'],
                // use the global 'Backbone' as the module name.
                exports: 'Backbone'
            },
            'shop/base': {
                //The underscore script dependency should be loaded before loading backbone.js
                deps: [],
                // use the global 'Backbone' as the module name.
                exports: 'Main'
            },
            'uc/main':{
                deps :[]
            },
            'jr/scroller':{
                deps:[]
            },
            'jr/dialog':{
                deps:[]
            },
            'jquery.slides':{
                deps:['jquery']
            }
        }
    }
);