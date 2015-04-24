/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* 
* This plugin allows the user to configure the pivot grid using drag and drop.
*/
Ext.define('Mz.pivot.plugin.Configurator', {
    extend: 'Ext.AbstractPlugin',
    requires: [
        'Ext.util.DelayedTask',
        'Ext.menu.Menu',        
        'Ext.menu.CheckItem',        
        'Mz.pivot.plugin.configurator.Panel'
    ],

    alias: 'plugin.mzconfigurator',
    
    /**
    * @cfg {Array} fields This is the array of fields you want to be used in the configurator.
    * Each field is an object with the following properties: dataIndex, header.
    * If no fields are defined then the model fields are taken.
    * 
    */
    fields:         [],
    
    /**
    * @cfg {Number} refreshDelay Number of miliseconds to wait for pivot refreshing when a config change occured.
    */
    refreshDelay:   300,

    /**
    * @private
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
    * 
    * @type String
    */
    lockableScope:  'top',

    init: function(grid) {
        var me = this;

        if(grid.down('mzconfigpanel')){
            return;
        }
        
        me.grid = grid;
        me.fields = Ext.Array.from(me.fields);

        me.gridListeners = me.grid.on({
            beforerender:   me.onBeforeGridRendered,
            afterrender:    me.onAfterGridRendered,
            single:         true,
            scope:          me,
            destroyable:    true
        });
        
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        var me = this;

        delete me.grid;
        delete me.fields;
        if(me.gridMaster){
            delete me.gridMaster;
        }
        Ext.destroy(me.fieldsCt, me.gridListeners, me.gridStateListeners);
        me.callParent(arguments);
    },
    
    /**
    * Enable the plugin to show the configurator panel.
    * 
    */
    enable: function() {
        var me = this;

        me.disabled = false;
        
        if(me.configCt){
            me.configCt.enable();
        }
        if(me.gridMaster){
            me.gridMaster.fireEvent('showconfigpanel', me.configCt);
        }
    },
    
    /**
    * Disable the plugin to hide the configurator panel.
    * 
    */
    disable: function() {
        var me = this;

        me.disabled = true;
        
        if(me.configCt){
            me.configCt.disable();
        }
        if(me.gridMaster){
            me.gridMaster.fireEvent('hideconfigpanel', me.configCt);
        }
    },
    
    onBeforeGridRendered: function(){
        var me = this;
        
        if(me.grid instanceof Mz.pivot.Grid){
            me.gridMaster = me.grid;
        }else{
            me.gridMaster = me.grid.up('mzpivotgrid');
        }
        
        if(!me.gridMaster){
            me.destroy();
            return;
        }
        
        // if the grid is locked and ExtJS version is 4.1.1 then lockableScope doesn't work
        if(me.gridMaster.down('mzconfigpanel')){
            // do nothing; there is already a plugin instance that deals with the grid
            me.destroy();
            return;
        }
        
        me.configCt = me.gridMaster.addDocked({
            xtype:          'mzconfigpanel',
            grid:           me.gridMaster,
            fields:         me.fields,
            refreshDelay:   me.refreshDelay
        })[0];
        
        if (!Ext.getVersion('extjs').match(5.0)) {
            me.gridMaster.addEvents(
                /**
                * @event configchange
                * @param {Mz.pivot.plugin.Configurator} panel
                * @param {Object} config
                */
                'configchange',
                
                /**
                * @event fieldsort
                * @param {Mz.pivot.plugin.configurator.Column} col
                * @param String direction
                */
                'fieldsort',
                
                /**
                * @event showconfigpanel
                * @param {Mz.pivot.plugin.configurator.Panel} panel
                */
                'showconfigpanel',
                
                /**
                * @event hideconfigpanel
                * @param {Mz.pivot.plugin.configurator.Panel} panel
                */
                'hideconfigpanel'
            );
        }
    },
    
    onAfterGridRendered: function(){
        var me = this;
        
        if(me.disabled === true){
            me.disable();
        }else{
            me.enable();
        }
    }
    

});