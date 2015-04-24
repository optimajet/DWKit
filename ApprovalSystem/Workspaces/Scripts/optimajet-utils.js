var optimajet = {
    ArrayContains: function (value, array) {
        var res = false;
        for (var i = 0; i < array.length; i++) {
            if (value == array) {
                res = true;
                break;
            }
        }
        return res;
    },
    FormatDecimal: function (value) {
        return Ext.util.Format.number(value, '0,000.00');
    },
    FormatNumber: function (value) {
        return Ext.util.Format.number(value, '0,000');
    },
    defaultLoader: new ViewForSelectLoader('optimajet.formBindHandler'),
    insertjs: function (script) {
        var fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.innerHTML = script;
        document.getElementsByTagName("head")[0].appendChild(fileref);
    },
    loadjs: function (filename) {
        //$.getScript(filename);
        var fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", filename);
        document.getElementsByTagName("head")[0].appendChild(fileref);
    },
    loadcss: function (filename) {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
        document.getElementsByTagName("head")[0].appendChild(fileref);
    },
    formBindHandler: function (grid, record, item, index, e, eOpts) {
        optimajet.defaultLoader.formBind(grid, record);
    },
    htmlEncode: function (value) {
        if (value) {
            return jQuery('<div />').text(value).html();
        } else {
            return '';
        }
    },
    htmlDecode: function (value) {
        if (value) {
            return $('<div />').html(value).text();
        } else {
            return '';
        }
    },
    loadInDiv: function (divBlock, url, data) {
        divBlock.innerHTML = "";
        divBlock.load(url, data,
            function () {
                //Добавить прогресс бар
            });
    },
    isFunction: function (functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
    },

    eventController: new EventController(),
    containerOnAvailable: function (name, listener) {

        if (optimajet.container[name] == undefined) {
            optimajet.eventController.addListener('container_' + name, listener);
        }
        else {
            listener(optimajet.container[name]);
        }
    },
    containerStoreOnLoad: function (name, listener) {
        optimajet.containerOnAvailable(name, function () {
            optimajet.container[name].on('load', listener);
        });
    },
    containerAddEventFireAndRemove: function (name, value) {
        optimajet.eventController.typeFireAndRemove('container_' + name, value);
    },
    container: {
        get: function (name) {
            return this[name];
        },
        add: function (name, value) {
            this[name] = value;
            optimajet.containerAddEventFireAndRemove(name, value);
        }
    },

    registerInContainer: function (name, value) {
        this.container.add(name, value);
    },
    showInfo: function (title, text) {
        if (text.length > 256) {
            Ext.create('Ext.window.Window', {
                title: title,
                height: 400,
                minWidth: 500,
                layout: 'fit',
                resizable: true,
                modal: true,
                html: text,
                overflowY: 'auto'
            }).show();
        }
        else {
            Ext.Msg.show({
                title: title,
                msg: text,
                minWidth: 200,
                modal: true,
                icon: Ext.Msg.INFO,
                buttons: Ext.Msg.OK
            });
        }
    },
    showError: function (title, text) {
        Ext.Msg.show({
            title: title,
            msg: text,
            minWidth: 200,
            modal: true,
            icon: Ext.Msg.INFO,
            buttons: Ext.MessageBox.OK
        });
    },
    showQuestion: function (title, text, func) {
        Ext.Msg.show({
            title: title,
            msg: text,
            minWidth: 200,
            modal: true,
            icon: Ext.Msg.QUESTION,
            buttons: Ext.MessageBox.OKCANCEL,
            fn: func
        });
    },
    showWarning: function(title, text) {
        Ext.Msg.show({
            title: title,
            msg: text,
            minWidth: 200,
            modal: true,
            icon: Ext.Msg.WARNING,
            buttons: Ext.MessageBox.OK
        });
    },
    ShowErrorFromResponse: function (response) {
        var messageIcon = Ext.MessageBox.ERROR;
        var responseData = Ext.decode(response.responseText);

        var msg;
        if (responseData && responseData.message)
            msg = responseData.message;
        else
            msg = responseData;

        if (msg == undefined) {
            msg = optimajet.localization.get('UnknownError');
            console.log(responseData);
        } else if (msg.length > 500) {
            console.log(msg);
            msg = msg.substring(0, 500) + '...';
        }

        Ext.MessageBox.show({
            title: optimajet.localization.get('Error'),
            msg: msg,
            buttons: Ext.MessageBox.OK,
            icon: messageIcon
        });
    },
    WaitSaveDialogShow: function (message) {
        if (message == undefined)
            message = optimajet.localization.get('SaveDataPleaseWait') + '...';

        var mask = Ext.getBody().mask(message);
        mask.setStyle('z-index', Ext.WindowMgr.zseed + 1000);
    },
    WaitSaveDialogHide: function () {
        Ext.getBody().unmask();
    },

    FormCheckPermission: function (formName, permission) {
        return optimajet.CheckPermissionObject('Form', formName, permission);
    },
    ViewCheckPermission: function (viewName, permission) {
        return optimajet.CheckPermissionObject('View', viewName, permission);
    },
    CheckCommonPermission: function (permission) {
        return optimajet.CheckPermission('Common', permission);
    },
    PermissionCache: new Array(),
    CheckPermissionObjectInCache: function (type, name, permission) {
        for (var i = 0; i < optimajet.PermissionCache.length ; i++) {
            var item = optimajet.PermissionCache[i];
            if (item.type == type && item.name == name && item.permission == permission)
                return item.check;
        }
    },
    AddPermissionObjectInCache: function (type, name, permission, check) {
        optimajet.PermissionCache.push({ type: type, name: name, permission: permission, check: check });
    },
    CheckPermissionInCache: function (group, permission) {
        for (var i = 0; i < optimajet.PermissionCache.length ; i++) {
            var item = optimajet.PermissionCache[i];
            if (item.group == group && item.permission == permission)
                return item.check;
        }
    },
    AddPermissionInCache: function (group, permission, check) {
        optimajet.PermissionCache.push({ group: group, permission: permission, check: check });
    },
    CheckPermissionObject: function (type, name, permission, ignoreCache) {
        if (ignoreCache == undefined || ignoreCache == false) {
            var item = optimajet.CheckPermissionObjectInCache(type, name, permission);
            if (item != undefined) {
                return item;
            }
        }

        var data = new Array();
        data.push({ name: 'name', value: name });
        data.push({ name: 'permission', value: permission });
        var url = 'Permission/' + type + 'Can';
        var res = $.ajax({
            url: optimajet.CorrectUrl(url),
            data: data,
            async: false
        }).responseText;
        var check = res == 'True';

        optimajet.AddPermissionObjectInCache(type, name, permission, check);

        return check;
    },

    CheckPermission: function (group, permission, ignoreCache) {
        if (ignoreCache == undefined || ignoreCache == false) {
            var item = optimajet.CheckPermissionInCache(group, permission);
            if (item != undefined) {
                return item;
            }
        }

        var data = new Array();
        data.push({ name: 'group', value: group });
        data.push({ name: 'permission', value: permission });
        var res = $.ajax({
            url: optimajet.CorrectUrl('Permission/Can'),
            data: data,
            async: false
        }).responseText;
        var check = res == 'True';

        optimajet.AddPermissionInCache(group, permission, check);

        return check;
    },

    GlobalMask: undefined,
    LoadForm: function (formName) {
        var divName = 'startPage';
        var url = window.location.hash.replace("#", "");
        if (url.length == 0) {
            url = optimajet.CorrectUrl('WS/' + formName + '/GetContent');
        }
        WorkspaceControls.MainPanelControl.AddTabUrl(url, divName, undefined, undefined, false);
    },

    IsHistoryEnabled: true,
    HistoryCurrentLocation: undefined,
    AddHistoryLocation: function (url) {
        optimajet.HistoryCurrentLocation = url;
        Ext.History.add(url);
    },
    HistoryChangeLocation: function (url) {
        if (optimajet.HistoryCurrentLocation == url) {
            return;
        }

        if (url.length > 0) {
            var divName = 'workspace_history';
            WorkspaceControls.MainPanelControl.AddTabUrl(url, divName, undefined, undefined, false);
        }
    },
    BackUrlReplaceArray: new Array(),
    AddBackUrlReplace: function (sourceUrl, targerUrl) {
        for (var i = 0; i < optimajet.BackUrlReplaceArray.length ; i++) {
            if (optimajet.BackUrlReplaceArray[i].key == sourceUrl) {
                optimajet.BackUrlReplaceArray[i].value = targerUrl;
                return;
            }
        }

        optimajet.BackUrlReplaceArray.push({ key: sourceUrl, value: targerUrl });
    },
    CorrectUrlForBack: function (sourceUrl) {
        var res = sourceUrl

        for (var i = 0; i < optimajet.BackUrlReplaceArray.length ; i++) {
            if (optimajet.BackUrlReplaceArray[i].key == sourceUrl) {
                res = optimajet.BackUrlReplaceArray[i].value;
                break;
            }
        }

        return optimajet.CorrectUrl(res);
    },
    UrlPrefix: '',
    UrlAddParams: new Array(),
    UrlAddParamsAddOrUpdateParam: function (key, value) {
        var isFind = false;
        if (value != undefined && value != "") {
            for (var i = 0; i < optimajet.UrlAddParams.length ; i++) {
                if (optimajet.UrlAddParams[i].key == key) {
                    optimajet.UrlAddParams[i].value = value;
                    isFind = true;
                    break;
                }
            }

            if (!isFind) {
                optimajet.UrlAddParams.push({ key: key, value: value });

            }
        }
    },
    CustomFunctions: {},
    CorrectUrl: function (url) {
        for (var i = 0; i < optimajet.UrlAddParams.length ; i++) {
            var key = optimajet.UrlAddParams[i].key + "=";
            var index = url.indexOf("&" + key);
            if (index < 0)
                index = url.indexOf("?" + key);

            if (index < 0) {
                var separator = url.indexOf("?") < 0 ? "?" : "&";
                url = url + separator + key + optimajet.UrlAddParams[i].value;
            }
            else {
                index++;
                var indexEnd = url.indexOf("&", index + key.length);
                if (indexEnd < 0)
                    indexEnd = url.length;
                url = url.replace(url.substring(index, indexEnd), key + optimajet.UrlAddParams[i].value);
            }
        }

        if (url.substring(0, optimajet.UrlPrefix.length) == optimajet.UrlPrefix)
            return url;
        return optimajet.UrlPrefix + url;
    },
    CorrectAndLoadJS: function (filename) {
        optimajet.loadjs(optimajet.CorrectUrl(filename));
    },
    CorrectAndLoadCSS: function (filename) {
        optimajet.loadcss(optimajet.CorrectUrl(filename));
    },

    CloseWindowByEl: function (ctrl) {
        var popupId = ctrl.el.parent('.popup-edit').id;
        Ext.getCmp(popupId).close();
    },
    FormsTokensStack: new Array(),
    RegisterNewToken: function (token) {
        optimajet.FormsTokensStack.push(token);
    },
    CurrentFormToken: function () {
        return optimajet.FormsTokensStack[optimajet.FormsTokensStack.length - 1];
    },
    ClearLastFormData: function () {
        var token = optimajet.FormsTokensStack.pop();
        if (token == undefined)
            return;
        Ext.ComponentManager.each(function (key, item) {
            if (item.ownerformtoken != undefined && item.ownerformtoken == token)
                try {
                    Ext.ComponentManager.unregister(item);
                    item.destroy();

                } catch (e) {

                }

        });
    },
    ClearAllFormData: function () {
        for (var i = optimajet.FormsTokensStack.length - 1; i >= 0; i--) {
            optimajet.ClearLastFormData();
        }
    },
    IgnoreFormToken: true,
    StopUseFormToken: function () {
        optimajet.IgnoreFormToken = true;
    },
    StartUseFormToken: function () {
        optimajet.IgnoreFormToken = false;
    },
    getParameterInHashByName: function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.hash);
        if (results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    BlockLazyLoader: {
        blockByForms: new Array(),
        CurrentForm: undefined,
        SetCurrentForm: function (form) {
            this.CurrentForm = form;
        },
        AddNewBlock: function (form, name, placeholder, value) {
            var exform = this.findForm(form);

            if (exform == undefined) {
                exform = { form: form, blocks: new Array() };
            }

            var exblock = this.findBlock(exform, name);

            if (exblock == undefined) {
                exblock = { name: name };
                exform.blocks.push(exblock);
            }
            exblock.placeholder = placeholder;
            exblock.value = value;

            this.blockByForms.push(exform);

            this.CurrentForm = form;
        },
        Clear: function (form) {
            if (form == undefined)
                form = this.CurrentForm;
            this.deleteForm(form);

        },
        ClearAll: function () {
            var res = new Array();
            this.blockByForms = res;
        },
        Show: function (name, form) {
            if (form == undefined)
                form = this.CurrentForm;
            var exform = this.findForm(form);

            if (exform == undefined)
                return;

            var exblock = this.findBlock(exform, name);

            if (exblock == undefined)
                return;

            $('#' + exblock.placeholder).html(exblock.value);
        },
        findForm: function (form) {
            for (var i = 0; i < this.blockByForms.length; i++) {
                if (this.blockByForms[i].form == form) {
                    return this.blockByForms[i];
                }
            }

            return undefined;
        },
        findBlock: function (exform, name) {
            for (var i = 0; i < exform.blocks.length; i++) {
                if (exform.blocks[i].name == name) {
                    return exform.blocks[i];
                }
            }

            return undefined;
        },
        deleteForm: function (form) {
            var res = new Array();
            var last = undefined;
            for (var i = 0; i < this.blockByForms.length; i++) {
                if (this.blockByForms[i].form != form) {
                    res.push(this.blockByForms[i]);
                    last = this.blockByForms[i];
                }
            }

            if (last != undefined) {
                this.CurrentForm = last.form;
            } else {
                this.CurrentForm = undefined;
            }

            this.blockByForms = res;
        }

    },
    FormSave: function (formPrefix, viewName, stores, visibility, isReload, resFunc) {
        var prefix = formPrefix + '_' + viewName;

        var that = this;
        var exec = new BulkSaveExecutorOld(
            optimajet.container[prefix + '_store'],
            stores,
            optimajet.container[prefix + '_collect_save'], optimajet.container[prefix + '_collect']);

        exec.visibility = visibility;
        exec.successfn = function (respData) {
            var recordId = respData.processed[0];

            if (isReload)
                optimajet.container[prefix + '_reload'].call(this, recordId);

            if (resFunc != undefined)
                resFunc(respData, true);
        };
        exec.failurefn = function (respData) {
            if (respData.message)
                optimajet.showError(optimajet.localization.get('Error'), respData.message);
            else
                optimajet.showError(optimajet.localization.get('Error'), respData);
            if (resFunc != undefined)
                resFunc(respData, false);
        };

        exec.sync('serializable');
    },

    StoresSave: function (mainStore, stores, visibility, isReload, resFunc, validationFunc, nothingchangesignore) {
        var that = this;
        var exec = new BulkSaveExecutor(mainStore, stores);
        exec.nothingChangesIgnore = nothingchangesignore;
        exec.visibility = visibility;
        exec.successfn = function (respData) {
            var recordId = respData.processed[0];

            if (isReload && mainStore.ExtensionLoad != undefined)
                mainStore.ExtensionLoad(this, recordId);

            if (resFunc != undefined)
                resFunc(respData, true);
        };
        exec.failurefn = function (respData) {
            optimajet.showError(optimajet.localization.get('Error'), respData.message);
            if (resFunc != undefined)
                resFunc(respData, false);
        };

        exec.validfn = validationFunc;

        var res = exec.sync('serializable');

        if (res == 2) //Значит, что сохранение не произошло, но все валидно
        {
            resFunc(null, true);
        }

    },

    WindowStateCache: new Array(),
    LoadWindowState: function (window, key) {
        for (var i = 0; i < optimajet.WindowStateCache.length ; i++) {
            if (optimajet.WindowStateCache[i].key == key) {
                var item = optimajet.WindowStateCache[i];
                //window.setPosition(item.position);
                window.setSize(item.size);
                return;
            }
        }
    },
    SaveWindowState: function (window, key) {
        var position = window.getPosition();

        if (position[0] < 0)
            position[0] = 0;

        if (position[1] < 0)
            position[1] = 0;

        var size = window.getSize();
        optimajet.WindowStateCache.push({ key: key, position: position, size: size });
    },
    PopupDefaultWidth: 400,
    PopupDefaultHeight: 400,
    Settings: new Array(),
    setTitle: function (title) {
        var index = document.title.lastIndexOf(' - ');
        document.title = title + document.title.substring(index, document.title.length);
    },
    ReloadPage: function () {
        var pageUrl = optimajet.HistoryCurrentLocation;
        optimajet.HistoryCurrentLocation = undefined;
        optimajet.HistoryChangeLocation(pageUrl);
    },
    getParameterByNameInHash: function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.hash);
        if (results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    GetBusinessObject: function (type, data) {
        var url = '/Business/' + type;
        var res = $.ajax({
            url: optimajet.CorrectUrl(url),
            data: data,
            async: false
        }).responseText;
        return $.parseJSON(res);
    },
    GetBusinessObjectAsync: function (type, data, successFunc) {
        var url = '/Business/' + type;
        var res = $.ajax({
            url: optimajet.CorrectUrl(url),
            data: data,
            async: true,
            success: successFunc
        });
    },
    PostBusinessObjectAsync: function (type, data, successFunc) {
        var url = '/Business/' + type;
        var res = $.ajax({
            url: optimajet.CorrectUrl(url),
            data: data,
            async: true,
            type: "post",
            success: successFunc
        });
    },
    NewGuid: function () {
        var generator = Ext.create('Ext.data.UuidGenerator');
        return generator.generate().replace(new RegExp('-', 'g'), '');
    },
    getExtraFromUrl: function (p) {
        var extra = optimajet.getParameterInHashByName('extra');
        if (extra == undefined || extra == '')
            return undefined;
        return JSON.parse(extra)[p];
    }
};

optimajet.GridType = {
    Grid: 1,
    Tree: 2
};

function EventController() {
    this.timer = 0;
    this._listeners = {};
    this._timers = {};

    this.addListener = function (type, listener) {
        if (typeof this._listeners[type] == "undefined") {
            this._listeners[type] = [];
        }
        if (typeof this._timers[type] == "undefined") {
            this._timers[type] = 0;
        }

        this._listeners[type].push(listener);
    };

    this.fire = function (event, p) {

        //var ticks = (new Date()).getTime();        
        event = this.getevent(event);
        if (this._listeners[event.type] instanceof Array) {
            var listeners = this._listeners[event.type];
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i] != undefined)
                    listeners[i].call(this, p, event);
            }
        }

        //console.log('resize:' + ((new Date()).getTime() - ticks));
    };

    this.getevent = function (event) {
        if (typeof event == "string") {
            event = { type: event };
        }
        if (!event.target) {
            event.target = this;
        }

        if (!event.type) {
            throw new Error("Event object missing 'type' property.");
        }

        return event;
    };

    this.removeListener = function (type, listener) {
        if (this._listeners[type] instanceof Array) {
            var listeners = this._listeners[type];
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    };

    this.fireWithDelay = function (event, delay, p) {
        event = this.getevent(event);
        var me = this;
        if (me._timers[event.type] == undefined)
            return;
        if (me._timers[event.type])
            clearTimeout(me._timers[event.type]);
        me._timers[event.type] = setTimeout(function () {
            me.fire(event, p);
        }, delay);
    };

    this.destroy = function () {
        this._listeners = undefined;
        this._timers = undefined;
    };

    this.typeFireAndRemove = function (type) {
        if (this._listeners[type] instanceof Array) {
            var listeners = this._listeners[type];
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i] != undefined) {
                    listeners[i].call(this, type);
                    listeners.splice(i, 1);
                }
            }
        }
    };
};

var gridUtils = new GridUtils();

function GridUtils() {
    this.getSelection = function (dataGrid) {
        var sm = dataGrid.getSelectionModel();
        if (sm == undefined)
            return;
        var selection = sm.getSelection();
        if (selection == undefined || (selection.length != undefined && selection.length < 1))
            return;
        return selection;
    }
    this.getSelectedEntities = function (selection) {
        var entities = [];
        if (typeof selection != 'undefined') {
            for (var index in selection) {
                entities[index] = selection[index].data;
            }
        }
        return entities;
    }
    this.getSelectedIdsByEntities = function (entities) {
        var entitiesIds = [];
        for (var index in entities) {
            entitiesIds[index] = entities[index].id;
        }
        return entitiesIds;
    }
    this.getSelectedIds = function (selection) {
        return this.getSelectedIdsByEntities(this.getSelectedEntities(selection));
    }

}

var WorkspaceControls = {

    EventController: new EventController(),

    MainPanelControl: undefined,

    CloseWindowByEl: function (ctrl) {
        optimajet.CloseWindowByEl(ctrl);
    },

    ShowWindowByUrl: function (url, newDivName, windowid, height, width, caption, data) {
        var myMask = new Ext.LoadMask(Ext.getBody(), { msg: optimajet.localization.get('Loading') + '...' });
        myMask.show();

        optimajet.StopUseFormToken();

        var me = this;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: "border",
            id: newDivName
        });

        var w = getSizeParameter(width, Ext.getBody().getViewSize().width);
        if (w == 0)
            w = Ext.getBody().getViewSize().width - 50;
        var h = getSizeParameter(height, Ext.getBody().getViewSize().height);
        if (h == 0)
            h = Ext.getBody().getViewSize().height - 50;

        var popupSettings = getPopupConfig(w, h, windowid, "popup-edit", me, caption);
        popupSettings.items = [panel];

        var popup = Ext.create('Ext.window.Window',
            popupSettings
        );

        popup.on('close', function () {
            optimajet.SaveWindowState(popup, newDivName);
            optimajet.ClearLastFormData();
            optimajet.BlockLazyLoader.Clear();
        });

        optimajet.StartUseFormToken();

        optimajet.RegisterNewToken(newDivName);

        url = optimajet.CorrectUrl(url);
        $.get(url, data, function (response) {
            panel.update(response, true, function () {
                popup.doLayout();
                optimajet.LoadWindowState(popup, newDivName);
                popup.show();
                myMask.hide();
                panel.body.addCls("popupscrollable");
            });
        });

        popup.on('resize', function () {
            me.FireGlobalResize();
        });
    },

    AddOnResizeListener: function (listener) {
        this.EventController.addListener('globalresize', listener);
    },

    RemoveOnResizeListener: function (listener) {
        this.EventController.removeListener('globalresize', listener);
    },


    FireGlobalResize: function (p, delay) {
        this.EventController.fireWithDelay('globalresize', delay, p);
    },

    ShowWindow: function (windowid, width, height, caption, context) {

        var w = getSizeParameter(width, Ext.getBody().getViewSize().width);
        if (w == 0)
            w = Ext.getBody().getViewSize().width - 50;
        var h = getSizeParameter(height, Ext.getBody().getViewSize().height);
        if (h == 0)
            h = Ext.getBody().getViewSize().height - 50;

        var me = this;
        var popupSettings = getPopupConfig(w, h, windowid, "popup-edit", me, caption);
        popupSettings.html = context;

        var popup = Ext.create('Ext.window.Window',
            popupSettings
        );

        popup.show();
    },
    ListenerGlobalResize: function (control) {
        var resizeFunc = function () {
            control.setSize(undefined, undefined);
        };
        WorkspaceControls.AddOnResizeListener(resizeFunc);
        control.on('destroy', function () { WorkspaceControls.RemoveOnResizeListener(resizeFunc); });
    }
};

function getPopupConfig(width, height, id, cls, component, caption) {
    var minHeight = 300;
    if (minHeight > height) {
        minHeight = height;
    }

    var minWidth = 300;
    if (minWidth > width) {
        minWidth = width;
    }

    return {
        id: id,
        cls: cls,
        header: true,
        border: false,
        renderTo: Ext.getBody(),
        title: caption,
        width: width,
        height: height,
        modal: true,
        layout: 'fit',
        resizable: true,
        minHeight: minHeight,
        minWidth: minWidth
    };
}
function getSizeParameter(sizeParameter, maxSizeParameter) {
    if (sizeParameter.lastIndexOf('px') != -1)
        return parseInt(sizeParameter.slice(0, -2));
    if (sizeParameter.lastIndexOf('%') != -1)
        return parseFloat(sizeParameter.slice(0, -1)) * maxSizeParameter / 100;
    return parseInt(sizeParameter);
}

function SinglePanelControl(maindivselector) {
    this.MainDivSelector = maindivselector;

    this.AddTabUrl = function (url, newDivName, caption, data, closable, urlForNewWindow) {

        $('html, body').animate({ scrollTop: 0 }, 'slow')
        if (optimajet.GlobalMask == undefined)
            optimajet.GlobalMask = new Ext.LoadMask(Ext.getBody(), { hideMode: "display", msg: optimajet.localization.get('Loading') + '...' });
        optimajet.GlobalMask.show();

        optimajet.StopUseFormToken();
        optimajet.ClearAllFormData();
        optimajet.BlockLazyLoader.ClearAll();

        // this.MainPanel.removeAll(true);
        $(this.MainDivSelector).empty();

        url = optimajet.CorrectUrl(url);

        if (optimajet.IsHistoryEnabled) {
            optimajet.AddHistoryLocation(url);
        }

        optimajet.RegisterNewToken(newDivName);
        optimajet.StartUseFormToken();

        var currentDivSelector = this.MainDivSelector;
        $(currentDivSelector).load(url, data, function (response) {
            if (typeof LastWSFormCaption != 'undefined') {
                optimajet.setTitle(LastWSFormCaption);
            }

            optimajet.localization.block(currentDivSelector);
            optimajet.GlobalMask.hide();
            // WorkspaceControls.FireGlobalResize(0);
        });

        // $.get(url, data, function (response) {

        //  panel.update(response, true, function () {
        //        if (/*caption == undefined &&*/ typeof LastWSFormCaption != 'undefined') {
        //            optimajet.setTitle(LastWSFormCaption);
        //        }
        //        panel.doLayout();
        //        optimajet.GlobalMask.hide();
        //    });
        //});
    },


    this.AddTabDiv = function (divName, caption, closable) {
        this.MainPanel.removeAll();
        this.MainPanel.add({
            title: caption,
            iconCls: 'tabs',
            contentEl: divName,
            closable: !!closable
        });
    };
}
/*
function TabPanelControl(mainLeftPanelControl) {

    this.MainLeftPanelControl = mainLeftPanelControl;
    this.MainPanelControl = undefined;
    this.MainTabsControl = undefined;
    this.ClickDiv = undefined;
    this.ClickTabTime = undefined;
    this.ShowLeftPanel = false;
    this.DivsToUrl = {};

    Ext.define('Ext.ux.tab.Tab', {
        extend: 'Ext.tab.Tab',
        alias: 'widget.ux.menutab',
        requires: ['Ext.button.Split'],
        menuAlign: 'tl-bl?',

        constructor: function () {
            this.callParent(arguments);

            this.onClick = Ext.button.Split.prototype.onClick;
        },
        onRender: function () {
            this.callParent(arguments);
            //We change the button wrap class here! (HACK!)
            this.btnWrap.replaceCls('x-tab-arrow x-tab-arrow-right',
                'x-btn-split x-btn-split-right')
                .setStyle('padding-right', '20px !important');
        }
    });


    this.OnReady = function () {
        this.MainTabsControl = Ext.widget('tabpanel', {
            resizeTabs: true,
            enableTabScroll: true,
            width: '100%',
            region: 'center',
            defaults: {
                autoScroll: true
                //,bodyPadding: 10
            },
            listeners: { beforetabchange: WorkspaceControls.MainPanelControl.TabChanged }
        });

        var items = [];

        if (this.ShowLeftPanel) {
            items = [
                this.MainLeftPanelControl,
                this.MainTabsControl
            ];
        } else {
            items = [
             this.MainTabsControl
            ];
        }

        this.MainPanelControl = Ext.create('Ext.panel.Panel', {
            width: "100%",
            height: screen.height - 240,
            layout: 'border',
            items: items,
            renderTo: 'MainWorkspacePanel'
        });
    };

    this.GetItemByContentEl = function (contentEl) {
        if (this.MainTabsControl != undefined && this.MainTabsControl.items != undefined) {
            for (var i = 0; i < this.MainTabsControl.items.items.length; i++) {
                var item = this.MainTabsControl.items.items[i];
                if (item.contentEl == contentEl) {
                    return item;
                }
            }
        }
        return undefined;
    };

    this.AddTabUrl = function (url, newDivName, caption, data, closable, urlForNewWindow) {

        this.MainTabsControl.removeListener('beforetabchange', WorkspaceControls.MainPanelControl.TabChanged);

        var item = this.GetItemByContentEl(newDivName);
        if (item != undefined) {
            this.SwitchPanels(null, newDivName, url, data);
            item.show();
            this.MainTabsControl.addListener('beforetabchange', WorkspaceControls.MainPanelControl.TabChanged);
            return;
        }
        var contentDiv = "<div style='height: 100%' class='workspace' id='" + newDivName + "'></div>";
        var divBlock = $(contentDiv).appendTo("body");

        var tab = this.MainTabsControl.add({
            title: caption,
            iconCls: 'tabs',
            contentEl: newDivName,
            closable: false,
            tabConfig: {
                xtype: 'ux.menutab',
                listeners: {
                    click: function () {
                        var m = new Date();
                        if (WorkspaceControls.MainPanelControl.ClickDiv == divBlock && (m.getTime() - WorkspaceControls.MainPanelControl.ClickTabTime) < 500) {
                            WorkspaceControls.MainPanelControl.ClickDiv = undefined;
                            WorkspaceControls.MainPanelControl.ClickTabTime = undefined;
                            window.open('Workspace/Popup?title=' + caption + '&url=' + url);
                        } else {
                            WorkspaceControls.MainPanelControl.ClickDiv = divBlock;
                            WorkspaceControls.MainPanelControl.ClickTabTime = m.getTime();
                        }
                    }
                },
                menu: [
                    {
                        text: 'Открыть в новом окне',
                        listeners: {
                            click: function () {
                                if (urlForNewWindow != undefined)
                                    window.open(urlForNewWindow);
                                else {
                                    window.open(url);
                                }
                            }
                        }
                    },
                    {
                        text: 'Обновить',
                        listeners: {
                            click: function () {
                                optimajet.loadInDiv(divBlock, url, data);
                            }
                        }
                    }, {
                        text: 'Закрыть',
                        listeners: {
                            click: function () {
                                WorkspaceControls.MainPanelControl.RemoveTab(newDivName);
                            }
                        }
                    }, {
                        text: 'Закрыть все',
                        listeners: {
                            click: function () {
                                WorkspaceControls.MainPanelControl.RemoveAllTab();
                            }
                        }
                    }]
            }
        });
        this.SwitchPanels(null, newDivName, url, data);
        tab.show();
        this.MainTabsControl.addListener('beforetabchange', WorkspaceControls.MainPanelControl.TabChanged);
        this.DivsToUrl[newDivName] = url;

    };

    this.RemoveTab = function (divName) {
        var item = this.GetItemByContentEl(divName);
        if (item != null) {
            this.MainTabsControl.remove(item);
        }
    };

    this.RemoveAllTab = function () {
        if (this.MainTabsControl != undefined && this.MainTabsControl.items != undefined) {
            for (var i = 0; i < this.MainTabsControl.items.items.length; i++) {
                this.MainTabsControl.removeAll(this.MainTabsControl.items.items[i]);
            }
        }
    };

    this.AddTabDiv = function (divName, caption, closable) {
        var item = this.GetItemByContentEl(divName);
        if (item != undefined) {
            item.show();
            return;
        }

        this.MainTabsControl.add({
            title: caption,
            iconCls: 'tabs',
            contentEl: divName,
            closable: !!closable
        }).show();
    };


    this.TabChanged = function (tabPanel, newCard, oldCard, eOpts) {
        var oldDivId = oldCard.contentEl;
        var newDivId = newCard.contentEl;
        var divsToUrl = WorkspaceControls.MainPanelControl.DivsToUrl;
        if (divsToUrl[newDivId] == 'undefined')
            return;

        WorkspaceControls.MainPanelControl.SwitchPanels(oldDivId, newDivId, divsToUrl[newDivId], null);
    };

    this.GetTabChangedRequest = function (currentDivId, newDivId) {
        var requestParameters = new Array();
        requestParameters.push({ name: 'currentDivId', value: currentDivId });
        requestParameters.push({ name: 'newDivId', value: newDivId });
        requestParameters.push({ name: 'content', value: optimajet.htmlEncode($('#' + currentDivId).html()) });
        return requestParameters;
    };

    this.SwitchPanels = function (oldDivId, newDivId, url, data) {

        if (oldDivId == null) {
            oldDivId = this.MainTabsControl.getActiveTab().contentEl;
        }

        var request = this.GetTabChangedRequest(oldDivId, newDivId);

        if (data instanceof Array) {
            for (var dataItem in data) {
                request.push(dataItem);
            }
        }

        var oldDivBlock = $('#' + oldDivId);
        var newDivBlock = $('#' + newDivId);
        oldDivBlock.empty();
        newDivBlock.load(url, request,
            function () {
                //Добавить прогресс бар
            });
    };



}
*/

function ViewForSelectLoader(formBindFunctionName) {

    this.eventController = new EventController();

    this.addBindComplete = function (listener) {
        this.eventController.addListener('bindcomplete', listener);
    };

    this.removeBindComplete = function (listener) {
        this.eventController.removeListener('bindcomplete', listener);
    };

    this.fireBindComplete = function (delay) {
        this.eventController.fireWithDelay('bindcomplete', delay);
    };

    this.formBindFunctionName = formBindFunctionName;

    this.loadGridArr = [];

    this.controlsToBindArrArr = [];

    this.formBind = function (grid, record) {
        var parent = grid.findParentByType('gridpanel');
        if (parent == undefined) {
            parent = grid.findParentByType('treepanel');
        }
        if (parent == undefined)
            parent = grid;

        var uid = parent.id.replace(new RegExp('grid', 'g'), '');

        var controls;
        for (i = 0; i < this.controlsToBindArrArr.length; i++) {

            if (this.controlsToBindArrArr[i].name == uid) {
                controls = this.controlsToBindArrArr[i].value;
            }
        }

        if (typeof (controls) == 'undefined')
            return;

        for (i = 0; i < controls.length; i++) {
            if (typeof (controls[i]) != 'undefined') {
                if (typeof (controls[i].fieldNameToBind) != 'undefined') {
                    var valueToSet = record.get(controls[i].fieldNameToBind);
                    if (typeof (valueToSet) == 'undefined') {
                        controls[i].setValue('');
                    }
                    else {
                        controls[i].setValue(record.get(controls[i].fieldNameToBind));
                    }
                    if (controls[i].waschangedmanually != undefined) {
                        controls[i].waschangedmanually = false;
                        controls[i].isValid();
                    }
                }
            }
        }

        var viewid = this.getWindowId(uid);
        var view = Ext.getCmp(viewid);
        view.close();

        this.fireBindComplete(0);

    };

    this.loadGrid = function (formName, viewName, caption, controlsToBind, gridType, getIdFunc, show) {
        if (show == undefined) {
            show = true;
        }

        if (gridType == undefined) {
            gridType = optimajet.GridType.Grid;
        }

        optimajet.StopUseFormToken();

        var keyName = formName + '_' + viewName;
        var view;
        for (i = 0; i < this.loadGridArr.length; i++) {
            if (this.loadGridArr[i].name == keyName) {
                view = this.loadGridArr[i].value;
            }
        }

        if (typeof (view) != 'undefined') {
            if (getIdFunc != undefined) {
                getIdFunc('grid' + view.id.replace(new RegExp('view', 'g'), ''));
            }
        };


        if (typeof (view) == 'undefined') {

            var generator = Ext.create('Ext.data.UuidGenerator');
            var newid = generator.generate().replace(new RegExp('-', 'g'), '');

            var gridid = 'grid' + newid;

            if (getIdFunc != undefined) {
                getIdFunc(gridid);
            }

            var toolbarId = gridid + '_' + viewName + '_grid_toolbar';
            var toolbarplaceholderid = toolbarId + '_placeholder';
            var viewid = this.getWindowId(newid);

            var panel = Ext.create('Ext.panel.Panel',
                {
                    layout: "border",
                    items: [
                        {
                            xtype: "panel",
                            region: "north",
                            html: "<div id='" + toolbarplaceholderid + "' style='width:100%'></div>"
                        },
                        {
                            xtype: "panel",
                            id: newid,
                            cls: "custom-grid",
                            layout: "fit"
                        }
                    ]
                });

            view = Ext.create('Ext.window.Window', {
                modal: true,
                renderTo: Ext.getBody(),
                title: caption,
                id: viewid,
                height: optimajet.PopupDefaultHeight,
                width: optimajet.PopupDefaultWidth,
                minHeight: 300,
                minWidth: 300,
                layout: 'fit',
                stateId: keyName,
                stateful: true,
                items: [panel],
                listeners: {
                    beforedestroy: {
                        fn: function (panel, opts) { return false; }
                    },
                    resize: {
                        fn: function (window, width, height, oldWidth, oldHeight, eOpts) {
                            var a = Ext.getCmp(gridid);
                            if (a == undefined)
                                return;
                            a.setHeight(height - 85);
                            a.setWidth(width - 10);
                            var b = Ext.getCmp(toolbarId);
                            b.setWidth(width - 10);

                            var c = Ext.getCmp(gridid + '_' + viewName + '_grid_toolbar_search_field');
                            c.setWidth(b.getWidth() - 105);
                        }
                    }
                }
            });

            var toolbar = Ext.create('Ext.toolbar.Toolbar', {
                id: toolbarId,
                cls: 'custom-toolbar',
                renderTo: toolbarplaceholderid
            });


            var textfield = Ext.create('Ext.form.field.Text', {
                id: gridid + '_' + viewName + '_grid_toolbar_search_field',
                enableKeyEvents: true
            });

            toolbar.add(textfield);

            toolbar.add({
                id: gridid + '_' + viewName + '_grid_toolbar_search',
                height: 37,
                width: 37,
                iconCls: 'toolbar-search'
            });

            toolbar.add({
                id: gridid + '_' + viewName + '_grid_toolbar_showall',
                height: 37,
                width: 37,
                iconCls: 'toolbar-showall'
            });

            toolbar.setWidth(view.width);

            textfield.setWidth(toolbar.getWidth() - 115);

            var sgName = gridType == optimajet.GridType.Grid ? 'Grid' : 'AJAXTreeGrid';

            var scriptName = optimajet.CorrectUrl('SG/' + sgName + '/' + viewName + '_' + newid + '_0' + '.js?onrowdblclick=' + this.formBindFunctionName + '&customgridid=' + gridid + '&gridname=' + gridid);

            optimajet.loadjs(scriptName);

            view.showallfunctionname = gridid + '_' + viewName + '_grid_toolbar_showall_function';

            this.loadGridArr.push({ name: keyName, value: view });

        }
        else {
            view.center();
            if (view.showallfunctionname != undefined && show)
                optimajet.container[view.showallfunctionname]();
        }

        var uid = view.id.replace(new RegExp('view', 'g'), '');
        var controls;
        for (i = 0; i < this.controlsToBindArrArr.length; i++) {
            if (this.controlsToBindArrArr[i].name == uid) {
                controls = this.controlsToBindArrArr[i];
            }
        }

        if (typeof (controls) == 'undefined') {
            this.controlsToBindArrArr.push({ name: uid, value: controlsToBind });
        }
        else {
            controls.value = controlsToBind;
        }

        Ext.ComponentManager.register(view);

        if (show)
            view.show();


    };

    this.getWindowId = function (uid) {
        return 'view' + uid;
    };
}

function BulkSaveExecutor(mainstore, stores) {

    this.mainStore = mainstore;
    this.stores = stores;
    this.successfn = undefined;
    this.failurefn = undefined;
    this.validfn = undefined;
    this.visibility = '';
    //Не показывать сообщение о том, что записи не изменены
    this.nothingChangesIgnore = false;
    this.sendUncahgedRecords = true;
    this.ignoreNotConfirmedChilds = true;
    this.sync = function (isolationlevel) {

        if (isolationlevel == undefined)
            isolationlevel = 'readcomitted';

        var me = this;
        var ms = me.mainStore;
        var mp = ms.getProxy();
        var mw = mp.getWriter();

        if (ms.getCount() > 1)
            return false;
        if (ms.getCount() == 0) {
            var model = ms.model;
            ms.insert(0, model.create());
        }

        var mainrecord = ms.getAt(0);
        mainrecord.dirty = false;
        var data = me.mainStore.ExtensionCollectSave();
        var dataAll = me.mainStore.ExtensionCollect();
        //валидируем все контролы формы
        var validationError = false;
        for (var i = 0; i < dataAll.length; i++) {
            var editor = dataAll[i].editor;
            if (typeof (editor) == 'undefined')
                continue;

            if (!editor.isValid())
                validationError = true;
        }
        if (validationError)
            return 0;

        //Обновляем данные в основной записи
        var usedFields = new Array();

        for (var j = 0; j < data.length; j++) {
            var editor = data[j].editor;
            if (typeof (editor) == 'undefined')
                continue;
            usedFields.push(editor.fieldName);

            //if (!editor.isDirty() && mainrecord.get(editor.fieldName) == editor.getValue())
            if (editor.isEqual(editor.getValue(), editor.originalValue)) {
                mainrecord.set(editor.fieldName, editor.getValue()); //Восстановление начального значения
                continue;
            }
            mainrecord.set(editor.fieldName, editor.getValue());
            mainrecord.setDirty();
        }

        for (var m = 0; m < mainrecord.fields.keys.length; m++) {
            var fieldName = mainrecord.fields.keys[m];
            if (jQuery.inArray(fieldName, usedFields) == -1) {
                //if (mainrecord.data[fieldName] instanceof Date) {
                //    if (mainrecord.data[fieldName] != (new Date(mainrecord.raw[fieldName])).toString())
                //        mainrecord.setDirty();
                //} else {
                //    if (mainrecord.data[fieldName] != mainrecord.raw[fieldName])
                //        mainrecord.setDirty();
                //}
                if (mainrecord.modified[fieldName] != undefined) {
                    mainrecord.setDirty();
                    break;
                }
           
            }
        }


        var jsondata = {
            isolationlevel: isolationlevel,
            mainrecorddirty: false,
            mainrecord: {},
            baseentityidname: '',
            baseentityidvalue: '',
            dependentrecords: new Array()
        };

        if (mp.extraParams.beidname != undefined) {
            jsondata.baseentityidname = mp.extraParams.beidname;
        }

        if (mp.extraParams.beidvalue != undefined) {
            jsondata.baseentityidvalue = mp.extraParams.beidvalue;
        }

        var needsend = false;
        jsondata.mainrecord = mw.getRecordData(mainrecord);

        if (mainrecord.dirty) {
            needsend = true;
            jsondata.mainrecorddirty = true;
        }

        for (var i = 0; i < me.stores.length; i++) {
            var ds = me.stores[i];
            if (ds == undefined)
                continue;
            var dp = ds.getProxy();
            var dw = dp.getWriter();
            var changeddata = new Array();
            var dep = { viewname: ds.viewName, baseentityidname: '', baseentityidvalue: '', data: changeddata };

            if (dp.extraParams.beidname != undefined) {
                dep.baseentityidname = dp.extraParams.beidname;
            }

            if (dp.extraParams.beidvalue != undefined) {
                dep.baseentityidvalue = dp.extraParams.beidvalue;
            }

            for (var j = 0; j < ds.getCount() ; j++) {
                var dr = ds.getAt(j);

                if (ds.ExtensionCollectSave != undefined && ds.ExtensionCollect != undefined) {
                    var childData = ds.ExtensionCollectSave();
                    var childDataAll = ds.ExtensionCollect();
                    //валидируем все контролы формы
                    var validationError = false;
                    for (var k = 0; k < childDataAll.length; k++) {
                        var editor = childDataAll[k].editor;
                        if (typeof (editor) == 'undefined')
                            continue;

                        if (!editor.isValid())
                            validationError = true;
                    }
                    if (validationError)
                        return 0;
                    //Обновляем данные в основной записи
                    for (var l = 0; l < childData.length; l++) {
                        var editor = childData[l].editor;
                        if (typeof (editor) == 'undefined')
                            continue;
                        //if (!editor.isDirty() && dr.get(editor.fieldName) == editor.getValue())
                        if (editor.isEqual(editor.getValue(), editor.originalValue))
                            continue;

                        dr.set(editor.fieldName, editor.getValue());
                        dr.setDirty();
                    }
                }

                if ((dr.dirty || dr.phantom) && !dr.isnotconfirmed)
                    needsend = true;
                if (dr.isnotconfirmed) //Если запись неподтверждена в editor'е 
                    if (me.ignoreNotConfirmedChilds) {
                        continue;
                    } else {
                        return 0;
                    }
                if (dr.dirty || dr.phantom || me.sendUncahgedRecords) {
                    if (dr.phantom) {
                        changeddata.push({ type: 'I', record: dw.getRecordData(dr) });
                    } else {
                        changeddata.push({ type: 'U', record: dw.getRecordData(dr) });
                    }
                }
            }

            var deleted = ds.getRemovedRecords();

            for (var j = 0; j < deleted.length; j++) {
                var dr = deleted[j];
                if (!dr.phantom) {
                    needsend = true;
                    changeddata.push({ type: 'D', record: dw.getRecordData(dr) });
                }
            }

            if (changeddata.length > 0) {
                jsondata.dependentrecords.push(dep);
            }
        }

        if (optimajet.isFunction(me.validfn)) {
            if (!me.validfn(jsondata))
                return 0;
        }

        if (!needsend) {
            if (this.nothingChangesIgnore) {
                return 2;
            }
            optimajet.showInfo(optimajet.localization.get('Saving'), optimajet.localization.get('NeedChangeBeforeSave'));
            return 0;
        }

        jsondata.visibility = me.visibility;

        var optype = mp.extraParams.selectquerytype;

        var method = 'PUT';
        var url = optimajet.CorrectUrl('DDS/Bulk/' + ms.viewName + '.dds?selectquerytype=' + optype);
        if (mainrecord.phantom)
            method = 'POST';

        optimajet.WaitSaveDialogShow();

        Ext.Ajax.request({
            url: url,
            method: method,
            jsonData: jsondata,
            timeout: 0,
            success: function (response) {
                var responseData = Ext.decode(response.responseText);
                optimajet.WaitSaveDialogHide();
                if (responseData.success && optimajet.isFunction(me.successfn))
                    me.successfn(responseData);
                if (!responseData.success && optimajet.isFunction(me.failurefn))
                    me.failurefn(responseData);
            },
            failure: function (response) {
                var responseData = Ext.decode(response.responseText);
                optimajet.WaitSaveDialogHide();
                if (optimajet.isFunction(me.failurefn))
                    me.failurefn(responseData);
            },
        });

        return 1;
    };


    this.setData = function (data) {
        var me = this;
        var ms = me.mainStore;
        var mp = ms.getProxy();

        var dataAll = me.getDataFunction();
        var mainRecord = data[ms.viewName];

        for (var i = 0; i < dataAll.length; i++) {
            var editor = dataAll[i].editor;
            if (typeof (editor) == 'undefined')
                continue;
            var value = mainRecord[dataAll[i].name];
            editor.setValue(value);
        }

        for (var i = 0; i < me.stores.length; i++) {
            var ds = me.stores[i];
            var records = data[ds.viewName];

            for (var j = 0; j < records.length; j++) {
                var changedRecord = records[j];

                if (changedRecord.ISDELETED)
                    continue;

                var recordToChange = ds.getAt(changedRecord.INDEX);

                for (var k = 0; k < recordToChange.fields.getCount() ; k++) {
                    var field = recordToChange.fields.getAt(k);
                    var newValue = changedRecord[field.name];
                    var oldValue = recordToChange.get(field.name);
                    if (newValue != oldValue)
                        recordToChange.set(field.name, newValue);
                }
            }
        }
    };

    this.getData = function () {
        var me = this;
        var ms = me.mainStore;
        var mp = ms.getProxy();
        var mw = mp.getWriter();

        if (ms.getCount() > 1)
            return false;
        if (ms.getCount() == 0) {
            var model = ms.model;
            ms.insert(0, model.create());
        }

        var mainrecord = ms.getAt(0);
        var data = me.getDataFunction();

        //Обновляем данные в основной записи
        for (var j = 0; j < data.length; j++) {
            var editor = data[j].editor;
            if (typeof (editor) == 'undefined')
                continue;
            if (!editor.isDirty())
                continue;
            mainrecord.set(editor.fieldName, editor.getValue());
            mainrecord.setDirty();
        }


        var jsondata = {};

        jsondata[ms.viewName] = mw.getRecordData(mainrecord);


        for (var i = 0; i < me.stores.length; i++) {
            var ds = me.stores[i];
            if (ds == undefined)
                continue;
            var dp = ds.getProxy();
            var dw = dp.getWriter();
            var changeddata = new Array();
            jsondata[ds.viewName] = changeddata;

            for (var j = 0; j < ds.getCount() ; j++) {
                var dr = ds.getAt(j);
                var rec = dw.getRecordData(dr);
                rec["ISDELETED"] = false;
                rec["INDEX"] = j;
                changeddata.push(rec);
            }

            var deleted = ds.getRemovedRecords();

            for (var j = 0; j < deleted.length; j++) {
                var dr = deleted[j];
                if (!dr.phantom) {
                    var rec = dw.getRecordData(dr);
                    rec["ISDELETED"] = true;
                    changeddata.push(rec);
                }
            }
        }

        return jsondata;
    };
}

var ojControls = {
    LoadDDS: function (viewName, func) {
        var url = optimajet.CorrectUrl('DDS/Get/' + viewName + '.dds');

        $.getJSON(url, function (data) {
            if (data.success) {
                func(data.data);
            }
            else {
                optimajet.showError(optimajet.localization.get('ErrorRequestingData') + viewName, data.message);
            }
        });
    },
    InitCombobox: function (control, viewName, keyField, nameField, otherfield) {
        control.displayField = nameField;
        control.valueField = keyField;

        var addFields = new Array();
        addFields.push({ name: keyField, type: 'string' });
        addFields.push({ name: nameField, type: 'string' });

        if (otherfield != undefined) {
            addFields.push({ name: otherfield, type: 'string' });

            if (Array.isArray(otherfield)) {
                for (var i = 0; i < otherfield.length; i++) {
                    addFields.push({ name: otherfield[i], type: 'string' });
                }
            }
        }

        var modelName = viewName + 'CBModel';
        control.model = Ext.define(modelName, {
            extend: 'Ext.data.Model',
            fields: addFields
        });



        control.store = Ext.create('Ext.data.Store', {
            autoDestroy: true,
            model: modelName,
            data: []
        });

        ojControls.LoadDDS(viewName, function (data) {
            for (var i = 0; i < data.length; i++)
                control.store.add(data[i]);
        });
    },
    CreateCombobox: function (id, labelName, viewName, keyField, nameField, otherfield) {
        var control = {
            xtype: 'combobox',
            id: id,
            fieldLabel: labelName,
            width: 400,
            labelWidth: 200,
            queryMode: 'local',
            typeAhead: true,
            forceSelection: true,
            transform: 'stateSelect'
        };

        ojControls.InitCombobox(control, viewName, keyField, nameField, otherfield);
        return control;
    },
    ToolsCollapse: function (control, p) {
        var el = jQuery(control).parents(".grid").children(".grid-body");
        if (jQuery(control).hasClass("expand")) {
            jQuery(control).removeClass("expand").addClass("collapse");
            el.slideDown(200, 'linear', function () {
                WorkspaceControls.FireGlobalResize("#" + el[0].id);
            });
        } else {
            jQuery(control).removeClass("collapse").addClass("expand");
            el.slideUp(200);
        }
    },
    GridSetReadOnly: function (gridName) {

    },

    ExtSetAllowBlank: function (controls, value) {
        for (var i = 0; i < controls.length; i++) {
            Ext.getCmp(controls[i]).allowBlank = value;
            if (value) {
                $('label[for=' + controls[i] + ']>span').detach();
            }
            else if ($('label[for=' + controls[i] + ']>span').length == 0) {
                $('label[for=' + controls[i] + ']').append('<span style="color: red;">*</span>');
            }
        }
    },

    GenerateErrorBlock: function (msg) {
        return $('<div class="alert alert-error"><button class="close" data-dismiss="alert"></button>' + msg + '</button>');
    },

    GenerateSuccessBlock: function (msg) {
        return $('<div class="alert alert-success"><button class="close" data-dismiss="alert"></button>' + msg + '</button>');
    },
    GenerateInfoBlock: function (msg) {
        return $('<div class="alert alert-info"><button class="close" data-dismiss="alert"></button>' + msg + '</button>');
    },
    //GenerateNotificationBlock type - info, danger, success
    GenerateNotificationBlock: function (title, body, date, image, link, type) {
        if (type == undefined)
            type = 'info';
        return $('<a href="' + link + '"><div class="notification-messages ' + type + '"><div class="message-wrapper"><div class="heading">' + title + '</div><div class="description">' + body + '</div></div><div class="date pull-right">' + date + '</div></div></a>');
    },
    GenerateImportExportButton: function (viewname, name, isAvailableForImportExport, ignorePermission) {
        if ((ignorePermission || (optimajet.FormCheckPermission(viewname, 'Add') && optimajet.FormCheckPermission(viewname, 'Edit')))
            && isAvailableForImportExport) {
            optimajet.container[name + '_grid_toolbar'].insert(5, {
                id: name + '_grid_toolbar_importexcel',
                text: optimajet.localization.get('Import'),
                iconCls: 'toolbar-import',
                height: 37,
                menu: {
                    xtype: 'menu',
                    items: [{
                        text: optimajet.localization.get('DownloadTemplate'),
                        id: name + '_grid_toolbar_importexcel_gettemplate',
                        handler: function () {
                            window.location = optimajet.CorrectUrl('IE/GetTemplate?name=' + viewname);
                        }
                    }, {
                        text: optimajet.localization.get('UploadTemplate'),
                        id: name + '_grid_toolbar_importexcel_uploadtemplate',
                        handler: function () {
                            var uploader = new Ext.window.Window({
                                resizable: false,
                                modal: true,
                                width: 400,
                                title: optimajet.localization.get('Upload'),
                                items: [{
                                    xtype: 'form',
                                    border: false,
                                    layout: 'fit',
                                    items: [{
                                        xtype: 'filefield',
                                        name: optimajet.localization.get('File'),
                                        msgTarget: 'side',
                                        margin: '10 5',
                                        allowBlank: false,
                                        anchor: '100%',
                                        buttonText: optimajet.localization.get('SelectFile') + '...',
                                        listeners: {
                                            change: function (fld, value) {
                                                var newValue = value.replace(/C:\\fakepath\\/g, '');
                                                fld.setRawValue(newValue);
                                            }
                                        }
                                    }],

                                    buttons: [{
                                        text: optimajet.localization.get('Upload'),
                                        handler: function () {
                                            var form = this.up('form').getForm();
                                            if (form.isValid()) {
                                                form.submit({
                                                    url: optimajet.CorrectUrl('IE/UploadExcel?name=' + viewname),
                                                    waitMsg: optimajet.localization.get('UploadingFile') + '...',
                                                    success: function (form, action) {
                                                        uploader.close();
                                                        optimajet.showInfo(optimajet.localization.get('Upload'), optimajet.localization.get('FileHasBeenUploaded') + '. </br> ' + optimajet.localization.get('Report') + ': ' + action.result.message)
                                                        optimajet.container[name + "_store"].reload();
                                                    },
                                                    failure: function (form, action) {
                                                        uploader.close();
                                                        optimajet.ShowErrorFromResponse(action.response);
                                                    }
                                                });
                                            }
                                        }
                                    }]
                                }]
                            });

                            uploader.show();
                        }
                    }]
                }
            });
        }
    },
    GenerateImportExportButtonClient: function (formname, name, importCallback) {
        optimajet.container[name + '_grid_toolbar'].add({
            id: name + '_grid_toolbar_importexcel',
            text: optimajet.localization.get('Import'),
            iconCls: 'toolbar-import',
            height: 37,
            menu: {
                xtype: 'menu',
                items: [{
                    text: optimajet.localization.get('DownloadTemplate'),
                    id: name + '_grid_toolbar_importexcel_gettemplate',
                    handler: function () {
                        window.location = optimajet.CorrectUrl('IE/GetTemplate?name=' + formname);
                    }
                }, {
                    text: optimajet.localization.get('UploadTemplate'),
                    id: name + '_grid_toolbar_importexcel_uploadtemplate',
                    handler: function () {
                        var uploader = new Ext.window.Window({
                            resizable: false,
                            modal: true,
                            width: 400,
                            title: optimajet.localization.get('Upload'),
                            items: [{
                                xtype: 'form',
                                border: false,
                                layout: 'fit',
                                items: [{
                                    xtype: 'filefield',
                                    name: optimajet.localization.get('File'),
                                    msgTarget: 'side',
                                    margin: '10 5',
                                    allowBlank: false,
                                    anchor: '100%',
                                    buttonText: optimajet.localization.get('SelectFile') + '...',
                                    listeners: {
                                        change: function (fld, value) {
                                            var newValue = value.replace(/C:\\fakepath\\/g, '');
                                            fld.setRawValue(newValue);
                                        }
                                    }
                                }],

                                buttons: [{
                                    text: optimajet.localization.get('Upload'),
                                    handler: function () {
                                        var form = this.up('form').getForm();
                                        if (form.isValid()) {
                                            form.submit({
                                                url: optimajet.CorrectUrl('IE/UploadExcelForClient?name=' + formname),
                                                waitMsg: optimajet.localization.get('UploadingFile') + '...',
                                                success: function (form, action) {
                                                    uploader.close();
                                                    importCallback(formname, name, action.response);
                                                },
                                                failure: function (form, action) {
                                                    uploader.close();
                                                    optimajet.ShowErrorFromResponse(action.response);
                                                }
                                            });
                                        }
                                    }
                                }]
                            }]
                        });

                        uploader.show();
                    }
                }]
            }
        });

    },
    InitGridWithToolbar: function (prefix, viewname, config) {
        if (config == undefined) {
            config = {
                usePanel: false,
                autoResizeForWindow: false,
                disableSearchField: true,
            };
        }

        var name = prefix + '_' + viewname;

        var grid_toolbar = Ext.create('Ext.toolbar.Toolbar', { id: name + '_grid_toolbar', cls: 'custom-toolbar' });
        optimajet.registerInContainer(name + '_grid_toolbar', grid_toolbar);

        grid_toolbar.render(name + 'ToolBar');

        if (config.ignorePermission || optimajet.FormCheckPermission(viewname, 'Add')) {
            grid_toolbar.add({
                id: name + '_grid_toolbar_add',
                text: optimajet.localization.get('Create'),
                iconCls: 'toolbar-create',
                height: 37
            });

            grid_toolbar.add({
                id: name + '_grid_toolbar_copy',
                text: optimajet.localization.get('Copy'),
                iconCls: 'toolbar-copy',
                height: 37
            });
        }

        if (config.ignorePermission || optimajet.FormCheckPermission(viewname, 'Delete')) {
            grid_toolbar.add({
                id: name + '_grid_toolbar_delete',
                text: optimajet.localization.get('Delete'),
                iconCls: 'toolbar-delete',
                height: 37
            });
        }

        grid_toolbar.add({
            id: name + '_grid_toolbar_exportexcel',
            text: optimajet.localization.get('Excel'),
            iconCls: 'toolbar-excel',
            height: 37
        });

        if (config.ignorePermission || optimajet.FormCheckPermission(viewname, 'Delete')) {
            grid_toolbar.add({
                id: name + '_grid_toolbar_showdeleted',
                text: optimajet.localization.get('ShowDeleted'),
                iconCls: 'toolbar-showdeleted',
                height: 37,
                hidden: true
            });
        }

        if (config.ignorePermission || optimajet.FormCheckPermission(viewname, 'Add')) {
            grid_toolbar.add({
                id: name + '_grid_toolbar_recover',
                text: optimajet.localization.get('Recover'),
                iconCls: 'toolbar-recover',
                height: 37,
                hidden: true
            });
        }

        Ext.Ajax.request({
            url: optimajet.CorrectUrl('IE/GetImportExportProperties?formName=' + viewname),
            success: function (response, options) {
                var isAvailableForImportExport = Ext.decode(response.responseText).IsAvailableForImportExport;
                ojControls.GenerateImportExportButton(viewname, name, isAvailableForImportExport, config.ignorePermission);
            }
        });

        var stateProvider = Ext.create('Ext.state.optimajet.ServerProvider');
        var searchValue = stateProvider.get(name + "_search_value", "");
        if (config.disableSearchField != true) {
            grid_toolbar.add({ xtype: 'tbspacer' });
            grid_toolbar.add('->');
            var textfield = Ext.create('Ext.form.field.Text', {
                id: name + '_grid_toolbar_search_field',
                width: '200',
                enableKeyEvents: true,
                value: searchValue
            });
            textfield.on('blur', function (item) {
                stateProvider.set(name + "_search_value", item.getValue());
            });
            grid_toolbar.add(textfield);

            grid_toolbar.add({
                id: name + '_grid_toolbar_search',
                iconCls: 'toolbar-search',
                height: 37,
                width: 37
            });
            grid_toolbar.add({
                id: name + '_grid_toolbar_showall',
                iconCls: 'toolbar-showall',
                height: 37,
                width: 37
            });
        }

        if (config.usePanel) {

            var panelcfg = {
                id: "customGridPanel",
                renderTo: 'maindiv',
                layout: "fit",
                items: [
                    {
                        xtype: "panel",
                        id: name + 'Div',
                        region: "center",
                        cls: "custom-grid",
                        layout: "fit"
                    }
                ]
            };

            if (config.autoResizeForWindow) {
                panelcfg.height = $(window).height() - 190;
            }

            var gridPanel = Ext.create('Ext.panel.Panel', panelcfg);
            gridPanel.doLayout();
        }

        Ext.ComponentManager.onAvailable(name + '_grid', function (item) {
            var resizeFunc = function (p) {
                if (config.usePanel) {
                    var customGridPanel = Ext.getCmp('customGridPanel');
                    if (customGridPanel != undefined) {
                        if (config.autoResizeForWindow) {
                            customGridPanel.setSize(undefined, $(window).height() - 190);
                        }
                        else {
                            customGridPanel.doLayout();
                        }
                    }
                }

                var grid = Ext.getCmp(name + '_grid');
                if (typeof (grid) == "undefined")
                    return;

                if (p != undefined &&
                    $('#' + grid.body.dom.id).parents(p).length == 0) {
                    return;
                }

                if (!config.usePanel && config.autoResizeForWindow) {
                    var h = $(window).height() - 190;
                    if (h < 410)
                        h = 410;
                    grid.setSize(undefined, h);
                }
                else {
                    grid.setSize(undefined, undefined);
                }

                grid_toolbar.setSize(undefined, undefined);
            };

            WorkspaceControls.AddOnResizeListener(resizeFunc);

            var grid = Ext.getCmp(name + '_grid');
            grid.on('destroy', function () { WorkspaceControls.RemoveOnResizeListener(resizeFunc); });

            if (!config.usePanel && config.autoResizeForWindow) {
                var h = $(window).height() - 190;
                if (h < 410)
                    h = 410;
                grid.setSize(undefined, h);
            }

            var captionActionPanel = $('#' + config.captionActionPanelName);
            if (captionActionPanel.length > 0) {
                grid.on('filterupdate', function (sender, filter) {
                    var isEnabled = false;
                    sender.filters.items.forEach(function (item) {
                        if (item.active) {
                            isEnabled = true;
                            return;
                        }
                    });
                    
                    var clearFilterDivId = grid.id + '_resetfilters';
                    var clearFilterDivs = $('#' + clearFilterDivId);

                    if (isEnabled) {
                        
                        if(clearFilterDivs.length == 0)
                        {
                            var clearFilterOnclick = "Ext.getCmp('" + grid.id + "').filters.clearFilters()";
                            var clearFilterContent = '<span id="' + clearFilterDivId + '" onclick=' + clearFilterOnclick + ' style="cursor: pointer;" class="label label-important">' + optimajet.localization.get('RESET FILTERS') + '</span>';
                            $(clearFilterContent).appendTo('#' + config.captionActionPanelName);
                        }
                    }
                    else
                    {
                        clearFilterDivs.remove();
                    }
                });
            }

            if (config.disableSearchField != true) {
                optimajet.container[name + '_store'].getProxy().extraParams.search_term = searchValue;
            }
        });
    },
    InitGridWithDropZone: function (name, tableName) {

        var deleteButtonId = name + '_grid_toolbar_delete';
        var toolBarId = name + '_grid_toolbar';
        var addButtonId = name + '_grid_toolbar_add';

        Ext.onReady(function () {
            var grid_toolbar = Ext.create('Ext.toolbar.Toolbar', { cls: 'custom-toolbar' });
            optimajet.registerInContainer(toolBarId, grid_toolbar);

            grid_toolbar.render(name + 'ToolBar');

            grid_toolbar.add({
                id: addButtonId,
                text: optimajet.localization.get('Create'),
                iconCls: 'toolbar-create',
                height: 37
            });

            grid_toolbar.add({
                id: deleteButtonId,
                text: optimajet.localization.get('Delete'),
                iconCls: 'toolbar-delete',
                height: 37
            });

            Ext.ComponentManager.onAvailable(name + '_grid', function (item) {

                if (grid_toolbar.items.items.length > 0) {
                    var myDropzone = new Dropzone("div#" + name + '_Drop', { url: optimajet.CorrectUrl("FU/Upload/?tablename=" + tableName), uploadMultiple: true });
                    if (myDropzone.on != undefined) {
                        myDropzone.on('successmultiple', function (files, resp) {
                            resp = JSON.parse(resp);
                            if (resp.success) {
                                var data = optimajet.container[name + '_store'].add(resp.result);

                                for (i = 0; i < data.length; i++) {
                                    data[i].setDirty();
                                }

                                for (i = 0; i < files.length; i++) {
                                    myDropzone.removeFile(files[i]);
                                }
                            }
                        });
                    }
                    else {
                        $("div#" + name + "_Drop").hide();
                    }
                } else {
                    $("div#" + name + "_Drop").hide();
                }

                if (typeof (WorkspaceControls.MainPanelControl) == "undefined")
                    return;

                var resizeFunc = function (p) {
                    var grid = Ext.getCmp(name + '_grid');
                    if (typeof (grid) == "undefined")
                        return;

                    if (p != undefined &&
                        $('#' + grid.body.dom.id).parents(p).length == 0) {
                        return;
                    }

                    grid.setSize(undefined, undefined);
                    grid_toolbar.setSize(undefined, undefined);
                };

                WorkspaceControls.AddOnResizeListener(resizeFunc);

                var grid = Ext.getCmp(name + '_grid');
                grid.on('destroy', function () { WorkspaceControls.RemoveOnResizeListener(resizeFunc); });

            });
        });
    },
    SyncStore: function (source, target, propertyId, properties, propertyParent, parentValue) {
        for (var i = target.data.items.length - 1; i >= 0; i--) {
            var tItem = target.data.items[i];
            if (tItem.get(propertyParent) == parentValue) {
                var isFind = false;
                source.data.items.forEach(function (sItem) {
                    if (sItem.get(propertyId) == tItem.get(propertyId)) {
                        properties.forEach(function (prop) {
                            tItem.set(prop, sItem.get(prop));
                        });
                        isFind = true;
                    }
                });

                if (!isFind) {
                    target.remove(tItem);
                }
            }
        }
        source.data.items.forEach(function (sItem) {
            if (sItem.get(propertyParent) == parentValue) {
                var findIndex = target.find(propertyId, sItem.get(propertyId));

                if (findIndex < 0) {
                    var records = target.add(sItem);
                    records.forEach(function (r) {
                        r.phantom = true;
                    });
                }
            }
        });
    }
}


var DateDiff = {

    inDays: function (d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();

        return parseInt((t2 - t1) / (24 * 3600 * 1000));
    },

    inWeeks: function (d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();

        return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
    },

    inMonths: function (d1, d2) {
        var d1Y = d1.getFullYear();
        var d2Y = d2.getFullYear();
        var d1M = d1.getMonth();
        var d2M = d2.getMonth();

        return (d2M + 12 * d2Y) - (d1M + 12 * d1Y);
    },

    inYears: function (d1, d2) {
        return d2.getFullYear() - d1.getFullYear();
    }
}