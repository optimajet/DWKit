/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* @private
* 
* This class is used for managing all fields for an axis.
* 
*/
Ext.define('Mz.pivot.plugin.configurator.Container', {
    extend: 'Ext.container.Container',

    requires: [
        'Mz.pivot.plugin.configurator.Column',
        'Mz.pivot.plugin.configurator.DragZone',
        'Mz.pivot.plugin.configurator.DropZone'
    ],
    
    alias: 'widget.mzconfigcontainer',
    
    style:          'overflow:hidden',
    childEls:       ['innerCt', 'targetEl'],
    layout:         'column',
    handleSorting:  false,
    handleFiltering:false,
    isAgg:          false,
    height:         'auto',

    dragDropText:   'Drop Column Fields Here',
    baseCls:        Ext.baseCSSPrefix + 'config-panel-ct',

    destroy: function(){
        var me = this;
        
        Ext.destroy(me.dragZone, me.dropZone, me.relayers, me.targetEl);
        
        me.callParent();
    },
    
    enable: function(){
        var me = this;
        
        if(me.dragZone){
            me.dragZone.enable();
        }
        if(me.dropZone){
            me.dropZone.enable();
        }
    },
    
    disable: function(){
        var me = this;
        
        if(me.dragZone){
            me.dragZone.disable();
        }
        if(me.dropZone){
            me.dropZone.disable();
        }
    },

    afterRender: function(){
        var me = this;
        
        me.callParent();

        me.dragZone = new Mz.pivot.plugin.configurator.DragZone(me);
        me.dropZone = new Mz.pivot.plugin.configurator.DropZone(me);

        me.mon(me, 'afterlayout', me.showGroupByText, me);
    },
    
    /**
    * This is used for adding a new config field to this container.
    * 
    */
    addColumn: function(config, pos, notify){
        var me = this, newCol, cfg = {},
            itemFound = me.items.findIndex('dimensionId', new RegExp('^' + config.id + '$', 'i')) >= 0;
        
        if(!me.isAgg){
            // if column found then don't do anything
            if(itemFound){
                if (notify === true) {
                    me.notifyGroupChange();
                }
                return;
            }
        }else{
            if(itemFound){
                config.id = Ext.id();
            }
        }

        if(me.items.getCount() == 0){
            me.hideGroupByText();
        }
        
        Ext.apply(cfg, {
            dimension:      config,
            dimensionId:    config.id,
            header:         config.header,
            isCustomizable: me.isCustomizable,
            isAgg:          me.isAgg
        });
        
        if(me.isAgg){
            config.aggregator = config.aggregator || 'sum';
        }
        
        newCol = Ext.create('Mz.pivot.plugin.configurator.Column', cfg);
        
        if(pos != -1){
            me.insert(pos, newCol);
        }else{
            me.add(newCol);
        }
        me.updateColumnIndexes();
        newCol.relayers = me.relayEvents(newCol, ['sortchange', 'filterchange', 'configchange']);

        if(notify === true){
            me.notifyGroupChange();
        }
    },
    
    /**
    * This is used for calculating column position in this container.
    * 
    */
    getColumnPosition: function(column, position){
        var me = this, pos;
        
        if(column instanceof Mz.pivot.plugin.configurator.Column){
            //we have to insert before or after this column
            pos = me.items.findIndex('id', column.id);
            pos = (position === 'before') ? pos : pos + 1;
        }else{
            pos = -1;
        }
        return pos;
    },
    
    /**
    * This is used for moving a column inside this container.
    * 
    */
    moveColumn: function(idFrom, idTo, position){
        var me = this,
            pos = me.items.findIndex('id', idFrom),
            newPos = me.items.findIndex('id', idTo);
        
        if(pos != newPos){
            if(newPos > pos){
                newPos = (position === 'before') ? Math.max(newPos - 1, 0) : newPos;                        
            }else{
                newPos = (position === 'before') ? newPos : newPos + 1;
            }
            
            me.move(pos, newPos);
            me.updateColumnIndexes();
            me.notifyGroupChange();
        }
    },
    
    /**
    * @private
    * After a column is moved the indexes has to be updated.
    * 
    */
    updateColumnIndexes: function(){
        var me = this;
        
        me.items.each(function(item, index, all){
            item.index = index;
        });
    },
    
    /**
    * This is used for firing the 'configchange' event
    * 
    */
    notifyGroupChange: function(){
        var me = this;
        me.fireEvent('configchange');
    },
    
    /**
    * The container has an info text displayed inside. This function makes it visible.
    * 
    */
    showGroupByText: function(){
        var me = this,
            method;
        
        if(me.items.getCount() === 0){
            me.innerCt.setHeight(me.minHeight);
            if(me.targetEl){
                method = me.targetEl.setHtml ? 'setHtml' : 'setHTML';
                me.targetEl[method]('<div class="' + Ext.baseCSSPrefix + 'config-panel-text">' + me.dragDropText + '</div>');
            }else{
                me.targetEl = me.innerCt.createChild();
            }
        }
    },
    
    /**
    * The container has an info text displayed inside. This function hides it.
    * 
    */
    hideGroupByText: function(){
        var me = this,
            method;
        
        if(me.targetEl){
            method = me.targetEl.setHtml ? 'setHtml' : 'setHTML';
            me.targetEl[method]('');
        }
    }
    
    
});