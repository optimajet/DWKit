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
* This class is used for managing the drop zone for each container.
* 
*/
Ext.define('Mz.pivot.plugin.configurator.DropZone', {
    extend: 'Ext.dd.DropZone',
    
    proxyOffsets: [-4, -9],
    configPanelCls:     Ext.baseCSSPrefix + 'config-panel-ct',
    configColumnCls:    Ext.baseCSSPrefix + 'config-column',

    constructor: function(panel){
        this.panel = panel;
        this.ddGroup = this.getDDGroup();
        this.callParent([panel.id]);
    },

    disable: function() {
        this.disabled = true;
    },
    
    enable: function() {
        this.disabled = false;
    },

    getDDGroup: function() {
        // return the column header dd group so we can allow column droping inside the grouping panel
        return 'configurator-' + this.panel.up('gridpanel').id;
    },

    getTargetFromEvent : function(e){
        return e.getTarget('.' + this.configColumnCls) || e.getTarget('.' + this.configPanelCls);
    },

    getTopIndicator: function() {
        if (!this.topIndicator) {
            this.self.prototype.topIndicator = Ext.DomHelper.append(Ext.getBody(), {
                cls: 'col-move-top ' + Ext.baseCSSPrefix + 'col-move-top',
                html: "&#160;"
            }, true);
            this.self.prototype.indicatorXOffset = Math.floor((this.topIndicator.dom.offsetWidth + 1) / 2);
        }
        return this.topIndicator;
    },

    getBottomIndicator: function() {
        if (!this.bottomIndicator) {
            this.self.prototype.bottomIndicator = Ext.DomHelper.append(Ext.getBody(), {
                cls: 'col-move-bottom ' + Ext.baseCSSPrefix + 'col-move-bottom',
                html: "&#160;"
            }, true);
        }
        return this.bottomIndicator;
    },

    getLocation: function(e, t) {
        var x      = e.getXY()[0],
            target = Ext.getCmp(t.id),
            region,
            pos;
            
        if(target instanceof Mz.pivot.plugin.configurator.Container){
            // that means that the column is dragged above the grouping panel so find out if there are any columns already
            if(target.items.getCount() > 0){
                // now fetch the position of the last item
                region = Ext.fly(target.items.last().el).getRegion();
            }else{
                region = new Ext.util.Region(0, 1000000, 0, 0);
            }
        }else{
            region = Ext.fly(t).getRegion();
        }
        
        if ((region.right - x) <= (region.right - region.left) / 2) {
            pos = "after";
        } else {
            pos = "before";
        }
        return {
            pos: pos,
            header: Ext.getCmp(t.id),
            node: t
        };
    },

    positionIndicator: function(data, node, e){
        var me = this,
            dragHeader   = data.header,
            dropLocation = me.getLocation(e, node),
            targetHeader = dropLocation.header,
            pos          = dropLocation.pos,
            nextHd,
            prevHd,
            topIndicator, bottomIndicator, topAnchor, bottomAnchor,
            topXY, bottomXY, headerCtEl, minX, maxX,
            allDropZones, ln, i, dropZone,
            extjs41 = Ext.getVersion('extjs').match('4.1');

        // Avoid expensive CQ lookups and DOM calculations if dropPosition has not changed
        if (targetHeader === me.lastTargetHeader && pos === me.lastDropPos) {
            return;
        }
        nextHd       = dragHeader.nextSibling('gridcolumn:not([hidden])');
        prevHd       = dragHeader.previousSibling('gridcolumn:not([hidden])');
        me.lastTargetHeader = targetHeader;
        me.lastDropPos = pos;

        // Cannot drag to before non-draggable start column
        /*if (!targetHeader.draggable && pos === 'before' && targetHeader.getIndex() === 0) {
            return false;
        }*/

        data.dropLocation = dropLocation;

        if ((dragHeader !== targetHeader) &&
            ((pos === "before" && nextHd !== targetHeader) ||
            (pos === "after" && prevHd !== targetHeader)) &&
            !targetHeader.isDescendantOf(dragHeader)) {

            // As we move in between different DropZones that are in the same
            // group (such as the case when in a locked grid), invalidateDrop
            // on the other dropZones.
            allDropZones = Ext.dd.DragDropManager.getRelated(me);
            ln = allDropZones.length;
            i  = 0;

            for (; i < ln; i++) {
                dropZone = allDropZones[i];
                if (dropZone !== me && dropZone.invalidateDrop) {
                    dropZone.invalidateDrop();
                }
            }

            me.valid = true;
            topIndicator = me.getTopIndicator();
            bottomIndicator = me.getBottomIndicator();
            if (pos === 'before') {
                topAnchor = (!extjs41 ? 'b' : '') + 'c-tl';
                bottomAnchor = (!extjs41 ? 't' : '') + 'c-bl';
            } else {
                topAnchor = (!extjs41 ? 'b' : '') + 'c-tr';
                bottomAnchor = (!extjs41 ? 't' : '') + 'c-br';
            }
            
            // Calculate arrow positions. Offset them to align exactly with column border line
            if(targetHeader instanceof Mz.pivot.plugin.configurator.Container && targetHeader.items.getCount() > 0){
                // if dropping zone is the container then align the rows to the last column item
                topXY = topIndicator.getAlignToXY(targetHeader.items.last().el, topAnchor);
                bottomXY = bottomIndicator.getAlignToXY(targetHeader.items.last().el, bottomAnchor);
            }else{
                topXY = topIndicator.getAlignToXY(targetHeader.el, topAnchor);
                bottomXY = bottomIndicator.getAlignToXY(targetHeader.el, bottomAnchor);
            }

            // constrain the indicators to the viewable section
            headerCtEl = me.panel.el;
            minX = headerCtEl.getX() - me.indicatorXOffset;
            maxX = headerCtEl.getX() + headerCtEl.getWidth();

            topXY[0] = Ext.Number.constrain(topXY[0], minX, maxX);
            bottomXY[0] = Ext.Number.constrain(bottomXY[0], minX, maxX);

            // position and show indicators
            topIndicator.setXY(topXY);
            bottomIndicator.setXY(bottomXY);
            topIndicator.show();
            bottomIndicator.show();

        // invalidate drop operation and hide indicators
        } else {
            me.invalidateDrop();
        }
    },

    invalidateDrop: function() {
        this.valid = false;
        this.hideIndicators();
    },

    onNodeOver: function(node, dragZone, e, data) {
        var me = this,
            from = data.header,
            doPosition,
            to,
            fromPanel,
            toPanel;

        doPosition = true;
        if (data.header.el.dom === node) {
            doPosition = false;
        }
        
        if (doPosition) {
            me.positionIndicator(data, node, e);
        } else {
            me.valid = false;
        }
        return me.valid ? me.dropAllowed : me.dropNotAllowed;
    },

    hideIndicators: function() {
        var me = this;
        
        me.getTopIndicator().hide();
        me.getBottomIndicator().hide();
        me.lastTargetHeader = me.lastDropPos = null;

    },

    onNodeOut: function() {
        this.hideIndicators();
    },

    onNodeDrop: function(node, dragZone, e, data) {
        //debugger;
        var me = this,
            dragColumn = data.header,
            dropLocation = data.dropLocation,
            newCol, pos, newPos;
        
        if (me.valid && dropLocation){
            /* 
                there are 2 possibilities here:
                1. a new grid column should be added to the grouping panel
                2. an existing group column changes its position
            */
            
            if(dragZone.id != me.panel.id){
                pos = me.panel.getColumnPosition(dropLocation.header, dropLocation.pos);
                newCol = dragColumn.serialize();
                
                // the field has to be removed from the dragZone
                if(!me.panel.isAgg){
                    dragZone.panel.remove(dragColumn);
                }
                
                me.panel.addColumn(newCol.dimension, pos, true);
            }else{
                // 2nd possibility
                me.panel.moveColumn(dragColumn.id, dropLocation.header instanceof Mz.pivot.plugin.configurator.Container ? dropLocation.header.items.last().id : dropLocation.header.id, dropLocation.pos);
            }
            
        }
        
    }
});