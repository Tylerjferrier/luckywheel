//Set the require.js configuration for your application.

require.config({
    baseUrl: "./scripts"
    
    // Libraries
    ,paths: {
        jquery: 'jquery.min',
        bootstrap: 'bootstrap.min',
        'underscore': 'underscore-min',
        'backbone': 'backbone-min',
        text: 'text',
        i18n: 'i18n',
        transform: 'jquery.transform',
        buzz: 'buzz',
        parse: 'parse-1.2.0.min',
        'localStorage': 'backbone.localStorage-min',
        easing: 'jquery.easing.1.3'
    }

    ,shim: {
        "underscore": {
            "exports": "_"
        },
        
        "easing" : {
            "deps": ["jquery"],
        },

        "bootstrap" : {
            "deps": ["jquery"],  
        },

        "backbone": {
            // Depends on underscore/lodash and jQuery
            "deps": ["underscore", "jquery"],

            // Exports the global window.Backbone object
            "exports": "Backbone"
        },

        "localStorage" : {
            // Depends on underscore/lodash and jQuery
            "deps": ["backbone"]
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
            exports: 'Parse'
        } 
    }

})
// // Load our app module and pass it to our definition function
require(['app', 'transform', 'easing', 'bootstrap'], function (app) {
    app.init();
})
