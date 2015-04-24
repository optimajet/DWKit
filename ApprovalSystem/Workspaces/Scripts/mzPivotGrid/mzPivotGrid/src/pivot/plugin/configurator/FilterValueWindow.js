/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This is the window that allows configuring a value filter
* 
*/
Ext.define('Mz.pivot.plugin.configurator.FilterValueWindow',{
    extend: 'Mz.pivot.plugin.configurator.FilterLabelWindow',
    
    width:          500,
    height:         150,
    
    titleText:      'Value filter ({0})',
    fieldText:      'Show items for which',

    initComponent: function(){
        var me = this;
        
        me.filterFields = [{
            xtype:          'combo',
            editable:       false,
            queryMode:      'local',
            valueField:     'value',
            store:          me.storeAgg,
            name:           'dimensionId'
        }];
        
        me.callParent(arguments);
    }
});