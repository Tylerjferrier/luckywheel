//Set the require.js configuration for your application.

require.config({
    baseUrl: "./scripts-0.1"
    
    // Libraries
    ,paths: {
        jquery: 'jquery.min',
        'underscore': 'underscore-min',
        'backbone': 'backbone-min',
        text: 'text',
        i18n: 'i18n',
        transform: 'jquery.transform',
        buzz: 'buzz',
        parse: '//parsecdn.com/js/parse-1.2.0.min.js'        
    }

    ,shim: {
        "underscore": {
            "exports": "_"
        },

        "backbone": {
            // Depends on underscore/lodash and jQuery
            "deps": ["underscore", "jquery"],

            // Exports the global window.Backbone object
            "exports": "Backbone"
        },

        'transform': {
            deps: [
                'jquery'
            ]
             //,"exports": "transform"
        },

        'buzz': {
            exports: 'buzz'
        }

        ,worker: {
            exports : 'worker'
        },

        'parse': {            
            exports: 'parse'
        } 
    }

})
// // Load our app module and pass it to our definition function
require(['app', 'transform'], function (app) {
    app.init();
})
