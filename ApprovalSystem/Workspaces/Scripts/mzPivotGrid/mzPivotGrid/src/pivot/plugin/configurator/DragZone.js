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
* This class is used for managing the drag zone for each container.
* 
*/
Ext.define('Mz.pivot.plugin.configurator.DragZone', {
    extend: 'Ext.dd.DragZone',

    configColumnSelector:       '.' + Ext.baseCSSPrefix + 'config-column',
    configColumnInnerSelector:  '.' + Ext.baseCSSPrefix + 'config-column-inner',
    maxProxyWidth:              120,
    dragging:                   false,
    
    constructor: function(panel) {
        this.panel = panel;
        this.ddGroup =  this.getDDGroup();
        this.callParent([panel.el]);
    },

    getDDGroup: function() {
        // return the column header dd group so we can allow column droping inside the grouping panel
        return 'configurator-' + this.panel.up('gridpanel').id;
    },
    
    getDragData: function(e) {
        if (e.getTarget(this.configColumnInnerSelector)) {
            var header = e.getTarget(this.configColumnSelector),
                headerCmp,
                ddel;

            if (header) {
                headerCmp = Ext.getCmp(header.id);
                
                if (!this.panel.dragging) {
                    ddel = document.createElement('div');
                    ddel.innerHTML = headerCmp.header;
                    return {
                        ddel: ddel,
                        header: headerCmp
                    };
                }
            }
        }
        return false;
    },

    onBeforeDrag: function() {
        return !(this.panel.dragging || this.disabled);
    },

    onInitDrag: function() {
        this.panel.dragging = true;
        this.callParent(arguments);
    },
    
    onDragDrop: function() {
        if(!this.dragData.dropLocation){
            this.panel.dragging = false;
            this.callParent(arguments);
            return;
        }
        
        /*
            when a column is dragged out from the grouping panel we have to do the following:
            1. remove the column from grouping panel
            2. adjust the grid groupers
        */
        var dropCol = this.dragData.dropLocation.header, 
            dragCol = this.dragData.header,
            pos = -1;
        
        if(dropCol instanceof Ext.grid.column.Column){
            dropCol.show();
            pos = this.panel.items.findIndex('idColumn', dragCol.id);
            this.panel.remove(this.panel.items.getAt(pos));
            this.panel.notifyGroupChange();
        }

        this.panel.dragging = false;
        this.callParent(arguments);
    },

    afterRepair: function() {
        this.callParent();
        this.panel.dragging = false;
    },

    getRepairXY: function() {
        return this.dragData.header.el.getXY();
    },
    
    disable: function() {
        this.disabled = true;
    },
    
    enable: function() {
        this.disabled = false;
    }

});