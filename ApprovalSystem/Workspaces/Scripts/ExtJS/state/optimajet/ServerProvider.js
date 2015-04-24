Ext.define('Ext.state.optimajet.ServerProvider', {
    /* Begin Definitions */
    extend: 'Ext.state.Provider',
    alias: 'state.optimajet.server',

    getUrl: optimajet.CorrectUrl('AC/GetControlsState'),
    setUrl: optimajet.CorrectUrl('AC/SetControlsState'),
    savetimeout: 500,

    store: new Ext.util.HashMap(),
    timers: new Ext.util.HashMap(),


    ExcludeParams: new Array(),

    constructor: function() {
        var me = this;

        me.callParent(arguments);

    },

    get: function(name, defaultValue) {
        var me = this;

        var urlkey = me.geturlkey();


        if (me.store.containsKey(urlkey)) {
            return me.getvaluefromstore(name, urlkey, defaultValue);
        } else {

            var data = {
                urlkey: urlkey
            };

            var respData = $.ajax({
                type: "GET",
                url: me.getUrl,
                async: false,
                data: data
            }).responseText;
            var resp = JSON.parse(respData);
            if (resp.state != undefined) {
                me.store.add(urlkey, JSON.parse(resp.state));
            } else {
                me.store.add(urlkey, new Object());
            }
            me.timers.add(urlkey, { timer: new Date, timeout: false });
            return me.getvaluefromstore(name, urlkey, defaultValue);

        }

    },

    getvaluefromstore: function(name, urlkey, defaultValue) {
        var me = this;
        var value = me.store.get(urlkey)[name];

        if (value != undefined)
            return value;
        return defaultValue;
    },

    geturlkey: function() {
        var me = this;
        var urlkey = optimajet.HistoryCurrentLocation;
        var firstreg = new RegExp(".*/#", "i");
        urlkey = urlkey.replace(firstreg, "");
        var secondtreg = new RegExp("^/", "i");
        urlkey = urlkey.replace(secondtreg, "");
        for (var i = 0; i < me.ExcludeParams.length; i++) {
            var reg = new RegExp(me.ExcludeParams[i] + "=.*?(&|$)", "i");
            urlkey = urlkey.replace(reg, "");
        }
        var lastreg = new RegExp("&$", "i");
        urlkey = urlkey.replace(lastreg, "");
        return urlkey;
    },


    set: function(name, value) {

        var me = this;
        var urlkey = me.geturlkey();

        me.clear(name);

        var timer;

        if (value == null)
            return;

        if (!me.store.containsKey(urlkey)) {
            me.store.add(urlkey, new Object());
            me.timers.add(urlkey, { timer: new Date, timeout: false });
        }

        me.store.get(urlkey)[name] = value;
        timer = me.timers.get(urlkey);


        //Save on server
        timer.timer = new Date();
        if (timer.timeout == false) {
            timer.timeout = true;
            var timeout = function() {
                me.saveonserver(urlkey, timer);
            }
            setTimeout(timeout, me.delta);
        }


    },

    saveonserver: function(urlkey, timer) {
        var me = this;
        if (new Date() - timer.timer < me.delta) {
            var timeout = function () {
                me.saveonserver(urlkey, timer);
            }
            setTimeout(timeout, delta);
        } else {
            timer.timeout = false;
            var data = {
                urlkey: urlkey,
                state: JSON.stringify(me.store.get(urlkey))
            };
            $.ajax({
                type: "POST",
                url: me.setUrl,
                async: true,
                data: data
            });
        }

     
    },


    // private
    clear: function (name) {
        var me = this;

        var urlkey = me.geturlkey();

        if (me.store.containsKey(urlkey)) {
            me.store.get(urlkey)[name] = undefined;
        }
    }

  
});