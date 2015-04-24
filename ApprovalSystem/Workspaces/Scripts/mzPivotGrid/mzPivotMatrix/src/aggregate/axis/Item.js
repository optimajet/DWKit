/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* The axis has items that are generated when the records are processed.
* This class stores info about such an item.
* 
*/
Ext.define('Mz.aggregate.axis.Item', {
    /**
    * The tree level this item belongs to
    * 
    * @type Number
    */
    level:          0,
    
    /**
    * The key that uniquely identifies this item in the tree. The key is a string compound of
    * all parent items keys separated by the matrix keysSeparator
    * 
    * @type String
    */
    key:            '',
    
    /**
    * The item value as it appears in the store
    * 
    * @type String
    */
    value:          '',
    
    /**
    * The item sort value as it appears in the store. This value will be used when sorting results.
    * 
    * @type String
    */
    sortValue:      '',
    
    /**
    * The item name after the grouperFn was applied to the value
    * 
    * @type String
    */
    name:           '',
    
    /**
    * Id of the dimension this item refers to.
    * 
    * @type String
    */
    dimensionId:    '',
    
    /**
    * The dimension instance
    * 
    * @type {Mz.aggregate.dimension.Item}
    * 
    */
    dimension:      null,
    
    /**
    * Array of children items this item has
    * 
    * 
    * @type Array
    */
    children:       null,
    
    /**
    * When the Local matrix is used this is the pivot store record generated for this axis item
    * 
    * @type {Ext.data.Model}
    */
    record:         null,
    
    /**
    * Parent axis instance
    * 
    * @type {Mz.aggregate.axis.Abstract}
    * 
    */
    axis:           null,
    
    /**
    * Object that stores all values from all axis items parents
    * 
    * @type Object
    */
    data:           null,
    
    /**
    * Is this item expanded or collapsed?
    * 
    * @type Boolean
    */
    expanded:       false,
    
    constructor: function(config){
        var me = this;
        
        Ext.apply(me, config || {});
        
        if(Ext.isEmpty(me.sortValue)){
            me.sortValue = me.value;
        }
        
        me.callParent(arguments);
    },
    
    destroy: function(){
        var me = this;
        
        if(me.axis){
            delete me.axis;
        }
        
        if(me.data){
            delete me.data;
        }
        
        if(me.dimension){
            delete me.dimension;
        }
        
        if(me.record){
            delete me.record;
        }
        
        if(Ext.isArray(me.children)){
            me.children.length = 0;
        }
        
        me.callParent(arguments);
    },
    
    /**
    * Returns the group total text formatted according to the template defined in the matrix
    * 
    */
    getTextTotal: function(){
        var me = this,
            groupHeaderTpl;
        
        if(Ext.XTemplate.getTpl){
            groupHeaderTpl = Ext.XTemplate.getTpl(me.axis.matrix, 'textTotalTpl');
        }else{
            groupHeaderTpl = new Ext.XTemplate(me.axis.matrix['textTotalTpl']);
        }
        
        return groupHeaderTpl.apply({
            groupField: me.dimension.dataIndex,
            columnName: me.dimension.dataIndex,
            name:       me.name,
            rows:       me.children || []
        });
    }
});