/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This matrix allows you to do all the calculations on the backend.
* This is handy when you have large datasets.
* 
* Basically this class sends to the specified URL the configurations for
* leftAxis, topAxis and aggregate and expects back a JSON with the following format:
* 
* - success = true/false
* 
* - leftAxis = array of items that were generated for the left axis. Each item is an 
* object with keys for: key, value, name, dimensionId
* 
* - topAxis = array of items that were generated for the top axis.
* 
* - results = array of results for all left/top axis items. Each result is an object
* with keys for: leftKey, topKey, values. The 'values' object has keys for each
* aggregate id that was sent to the backend.
* 
* It is very important to use the dimension IDs that were sent to the backend
* instead of creating new ones.
* 
* This class can also serve as an example for implementing various types of
* remote matrix.
* 
*/
Ext.define('Mz.aggregate.matrix.Remote', {
    extend: 'Mz.aggregate.matrix.Abstract',
    
    alias:  'pivotmatrix.remote',
    mztype: 'remote',
    
    /**
    * URL on the backend where the calculations are performed.
    * 
    * @cfg
    * @type String
    */
    url:    '',
    
    onInitialize: function(){
        var me = this;
        
        me.remoteDelayedTask = new Ext.util.DelayedTask(me.delayedProcess, me);
        
        me.callParent(arguments);
    },
    
    startProcess: function(){
        var me = this;
        
        if(Ext.isEmpty(me.url)){
            // nothing to do
            return;
        }
        
        me.clearData();
        
        // let's start the process
        me.fireEvent('start', me);

        me.statusInProgress = false;
        
        me.remoteDelayedTask.delay(5);
    },
    
    delayedProcess: function(){
        var me = this,
            leftAxis = [],
            topAxis = [],
            aggregate = [];
        
        me.leftAxis.dimensions.each(function(item){
            leftAxis.push(item.serialize());
        });
        
        me.topAxis.dimensions.each(function(item){
            topAxis.push(item.serialize());
        });
        
        me.aggregate.each(function(item){
            aggregate.push(item.serialize());
        });
        
        // do an Ajax call to the configured URL and fetch the results
        Ext.Ajax.request({
            url:        me.url,
            jsonData: {
                leftAxis:   leftAxis,
                topAxis:    topAxis,
                aggregate:  aggregate
            },
            success:    me.processRemoteResults,
            failure:    me.processFailed,
            scope:      me
        });
        
    },
    
    processRemoteResults: function(response, opts){
        var me = this,
            data = Ext.JSON.decode(response.responseText, true);
            
        if(!data || !data['success']){
            me.endProcess();
            return;
        }
        
        Ext.Array.each(Ext.Array.from(data.leftAxis || []), function(item){
            if(Ext.isObject(item)){
                me.leftAxis.addItem(item);
            }
        });
        
        Ext.Array.each(Ext.Array.from(data.topAxis || []), function(item){
            if(Ext.isObject(item)){
                me.topAxis.addItem(item);
            }
        });
        
        Ext.Array.each(Ext.Array.from(data.results || []), function(item){
            if(Ext.isObject(item)){
                var result = me.results.add(item.leftKey || '', item.topKey || '');
                Ext.Object.each(item.values || {}, result.addValue, result);
            }
        });
        
        me.endProcess();
    },
    
    processFailed: function(){
        this.endProcess();        
    }
    
});