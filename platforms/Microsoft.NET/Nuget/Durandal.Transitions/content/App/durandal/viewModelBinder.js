﻿define(['./system'], function (system) {
    var viewModelBinder;
    var insufficientInfoMessage = 'Insufficient Information to Bind';
    var unexpectedViewMessage = 'Unexpected View Type';

    function doBind(obj, view, action) {
        if (!view || !obj) {
            if (viewModelBinder.throwOnErrors) {
                system.error(new Error(insufficientInfoMessage));
            } else {
                system.log(insufficientInfoMessage, view, obj);
            }
            return;
        }

        if (!view.getAttribute) {
            if (viewModelBinder.throwOnErrors) {
                system.error(new Error(unexpectedViewMessage));
            } else {
                system.log(unexpectedViewMessage, view, obj);
            }
            return;
        }

        var viewName = view.getAttribute('data-view');
        
        try {
            viewModelBinder.beforeBind(obj, view);
            action(viewName);
            viewModelBinder.afterBind(obj, view);
        } catch (e) {
            if (viewModelBinder.throwOnErrors) {
                system.error(new Error(e.message + ';\nView: ' + viewName + ";\nModuleId: " + system.getModuleId(obj)));
            } else {
                system.log(e.message, viewName, obj);
            }
        }
    }

    return viewModelBinder = {
        beforeBind: system.noop,
        afterBind: system.noop,
        throwOnErrors: false,
        bindContext: function(bindingContext, view, obj) {
            if (obj) {
                bindingContext = bindingContext.createChildContext(obj);
            }

            doBind(bindingContext, view, function (viewName) {
                if (obj && obj.beforeBind) {
                    obj.beforeBind(view);
                }

                system.log('Binding', viewName, obj);
                ko.applyBindings(bindingContext, view);
                
                if (obj && obj.afterBind) {
                    obj.afterBind(view);
                }
            });
        },
        bind: function(obj, view) {
            doBind(obj, view, function (viewName) {
                if (obj.beforeBind) {
                    obj.beforeBind(view);
                }
                
                system.log('Binding', viewName, obj);
                ko.applyBindings(obj, view);
                
                if (obj.afterBind) {
                    obj.afterBind(view);
                }
            });
        }
    };
});