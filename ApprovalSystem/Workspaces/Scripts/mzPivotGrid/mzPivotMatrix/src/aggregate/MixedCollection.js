/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This class enhances the Ext.util.MixedCollection class by allowing the 
* children objects to be destroyed on remove.
* 
*/
Ext.define('Mz.aggregate.MixedCollection', {
    extend: 'Ext.util.MixedCollection',
    
    removeAt: function(index){
        var me = this,
            obj = me.callParent(arguments);
        
        Ext.destroy(obj);
    },
    
    clear: function(){
        var me = this;
        
        Ext.destroy(me.items);
        me.callParent(arguments);
    },
    
    removeAll: function(){
        var me = this;
        
        Ext.destroy(me.items);
        me.callParent(arguments);
    },
    
    destroy: function(){
        // destroy all objects in the items array
        this.clear();
    }
});