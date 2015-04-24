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
* This component is a pivot table implementation useful for reporting. 
* The component is compatible with Extjs 4.1.x, 4.2.x and 5.0.0.
*
*/
Ext.define('Mz.pivot.Grid', {
    extend: 'Ext.grid.Panel',

    alternateClassName: 'Mz.pivot.Table',
    alias: 'widget.mzpivotgrid',
    
    requires: [
        'Mz.aggregate.matrix.Local',
        'Mz.aggregate.matrix.Remote',
        'Mz.pivot.feature.PivotView50',
        'Mz.pivot.feature.PivotView42',
        'Mz.pivot.feature.PivotView41',
        'Ext.util.DelayedTask',
        'Ext.data.ArrayStore'
    ],
    
    subGridXType:       'gridpanel',
    debugMode:          false,
    
    /**
    * @cfg {Object} matrixConfig Define here matrix specific configuration.
    * 
    */
    matrixConfig:       null,
    
    /**
    * @cfg {Boolean} enableLoadMask Set this on false if you don't want to see the loading mask.
    */
    enableLoadMask:     true,

    /**
    * @cfg {Boolean} enableLocking Set this on false if you don't want to lock the left axis columns.
    */
    enableLocking:      false,

    /**
    * @cfg {Boolean} columnLines Set this on false if you don't want to show the column lines.
    */
    columnLines:        true,

    /**
    * @cfg {String} viewLayoutType Type of layout used to display the pivot data. 
    * Possible values: outline, compact.
    */
    viewLayoutType:             'outline',

    /**
    * @cfg {String} rowSubTotalsPosition Possible values: first, none, last
    */
    rowSubTotalsPosition:       'first',

    /**
    * @cfg {String} rowGrandTotalsPosition Possible values: first, none, last
    */
    rowGrandTotalsPosition:     'last',

    /**
    * @cfg {String} colSubTotalsPosition Possible values: first, none, last
    */
    colSubTotalsPosition:       'last',

    /**
    * @cfg {String} colGrandTotalsPosition Possible values: first, none, last
    */
    colGrandTotalsPosition:     'last',

    /**
    * @cfg {String} textTotalTpl Configure the template for the group total. (i.e. '{name} ({rows.length} items)')
    * @cfg {String}           textTotalTpl.groupField         The field name being grouped by.
    * @cfg {String}           textTotalTpl.name               Group name
    * @cfg {Ext.data.Model[]} textTotalTpl.rows               An array containing the child records for the group being rendered.
    */
    textTotalTpl:               'Total ({name})',

    /**
    * @cfg {String} textGrandTotalTpl Configure the template for the grand total.
    */
    textGrandTotalTpl:          'Grand total',

    /**
    * @cfg {Array} leftAxis Define the left axis used by the grid. Each item of the array
    * is a configuration object used to instantiate a {Mz.aggregate.dimension.Item}.
    * 
#Example usage:#

        leftAxis: [{
            width:      80,         // column width in the grid
            dataIndex:  'person',   // field used for extracting data from the store
            header:     'Persons',  // column title
            direction:  'ASC',      // sort values ascending
            renderer: function(v){
                return v;           // do your own stuff here
            }                       // grid cell renderer
        },{
            width:      90,
            dataIndex:  'quarter',
            header:     'Quarter'
        },{
            width:      90,
            dataIndex:  'product',
            header:     'Products'
        }]

    */
    leftAxis:           null,

    /**
    * @cfg {Array} topAxis Define the top axis used by the pivot grid. Each item of the array
    * is a configuration object used to instantiate a {Mz.aggregate.dimension.Item}.
    * 
#Example usage:#

        topAxis: [{
            dataIndex:  'city',     // field used for extracting data from the store
            direction:  'ASC'       // sort values ascending
            renderer: function(v){
                return v;           // do your own stuff here
            }                       // grid cell renderer
        }]
        
    * 
    */
    topAxis:            null,

    /**
    * @cfg {Array} aggregate Define the fields you want to aggregate in the pivot grid. 
    * You can have one or multiple fields. Each item of the array
    * is a configuration object used to instantiate a {Mz.aggregate.dimension.Item}.
    * 
#Example usage:#

        aggregate: [{
            dataIndex:  'value',        // what field is aggregated
            header:     'Total',        // column title
            aggregator: 'sum',          // function used for aggregating
            align:      'right',        // grid cell alignment
            width:      100,            // column width
            renderer:   '0'             // grid cell renderer
        },{
            measure:    'quantity',
            header:     'Quantity',
            aggregator: function(records, measure, matrix, rowGroupKey, colGroupKey){
                // provide your own aggregator function
                return records.length;
            },
            align:      'right',
            width:      80,
            renderer:   '0'             // grid cell renderer
        }]
        
    * 
    */
    aggregate:          null,
    
    /**
    * @cfg {String} clsGroupTotal CSS class assigned to the group totals.
    */
    clsGroupTotal:      Ext.baseCSSPrefix + 'grid-group-total',

    /**
    * @cfg {String} clsGrandTotal CSS class assigned to the grand totals.
    */
    clsGrandTotal:      Ext.baseCSSPrefix + 'grid-grand-total',
    
    /**
    * @cfg {Boolean} startRowGroupsCollapsed Should the row groups be expanded on first init?
    * 
    */
    startRowGroupsCollapsed: true,
    
    /**
    * @cfg {Boolean} startColGroupsCollapsed Should the col groups be expanded on first init?
    * 
    */
    startColGroupsCollapsed: true,
    
    /**
    * @cfg {Boolean} showZeroAsBlank Should 0 values be displayed as blank?
    * 
    */
    showZeroAsBlank: false,
    
    stateEvents: [
        'pivotgroupexpand', 'pivotgroupcollapse', 'pivotdone'
    ],
    
    /**
    * @private
    */
    initComponent : function(){
        var me = this;
        
        me.columns = [];

        me.preInitialize();
        me.callParent(arguments);
        me.postInitialize();
    },
    
    /***
    * @private
    * 
    */
    preInitialize: function(){
        var me = this,
            extjsVersion = Ext.getVersion('extjs'),
            feature = {
                id:                 'group',
                ftype:              '',
                summaryRowCls:      me.clsGroupTotal,
                grandSummaryRowCls: me.clsGrandTotal
            }, ftype;
        
        me.features = [];
        if (extjsVersion.match('4.1')) {
            ftype = 'pivotview41';
        }else if (extjsVersion.match('4.2')) {
            ftype = 'pivotview42';
        }else if (extjsVersion.isGreaterThanOrEqual && extjsVersion.isGreaterThanOrEqual(5.0)) {
            ftype = 'pivotview50';
        }
        if(ftype){
            feature.ftype = ftype;
            me.features.push(feature);
        }

        /*
            In v3 the store doesn't have to be provided to the grid directly.
            Put this inside the matrix config instead.
        */
        if(me.store){
            me.originalStore = me.store;
        }
        
        // create a grid store that will be reconfigured whenever the matrix store changes
        me.store = Ext.create('Ext.data.ArrayStore', {
            fields: []
        });
        
        me.enableColumnMove = false;
        
        me.delayedTask = new Ext.util.DelayedTask(me.refreshView, me);
    },
    
    /**
    * @private
    */
    postInitialize: function(){
        var me = this,
            matrixConfig = {},
            headerListener = {
                headerclick:    me.onHeaderClick,
                scope:          me,
                destroyable:    true
            };
        
        if(me.enableLocking){
            me.lockedHeaderCtListeners = me.getView().lockedView.getHeaderCt().on(headerListener);
            me.headerCtListeners = me.getView().normalView.getHeaderCt().on(headerListener);
        }else{
            me.headerCtListeners = me.getView().getHeaderCt().on(headerListener);
        }
        
        if (!Ext.getVersion('extjs').match(5.0)) {
            me.addEvents(
                /**
                * Fires when the matrix starts processing the records.
                * 
                * @event pivotstart
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'pivotstart',
                
                /**
                * Fires during records processing.
                * 
                * @event pivotprogress
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Integer} index Current index of record that is processed
                * @param {Integer} total Total number of records to process
                */
                'pivotprogress',

                /**
                * Fires when the matrix finished processing the records
                * 
                * @event pivotdone
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'pivotdone',

                /**
                * Fires after the matrix built the store model.
                * 
                * @event pivotmodelbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Model} model The built model
                */
                'pivotmodelbuilt',

                /**
                * Fires after the matrix built the columns.
                * 
                * @event pivotcolumnsbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Array} columns The built columns
                */
                'pivotcolumnsbuilt',

                /**
                * Fires after the matrix built a pivot store record.
                * 
                * @event pivotrecordbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Model} record The built record
                */
                'pivotrecordbuilt',

                /**
                * Fires before grand total records are created in the pivot store.
                * Push additional objects to the array if you need to create additional grand totals.
                * 
                * @event pivotbuildtotals
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Array} totals Array of objects that will be used to create grand total records in the pivot store. Each object should have:
                * @param {String} totals.title Name your grand total
                * @param {Object} totals.values Values used to generate the pivot store record
                */
                'pivotbuildtotals',

                /**
                * Fires after the matrix built the pivot store.
                * 
                * @event pivotstorebuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Store} store The built store
                */
                'pivotstorebuilt',
                
                /**
                * Fires when a pivot group is expanded. Could be a row or col pivot group.
                * @event pivotgroupexpand
                * @param {String} type  Either 'row' or 'col'
                * @param {Mz.aggregate.axis.Item} group The axis item
                */
                'pivotgroupexpand',
                
                /**
                * Fires when a pivot group is collapsed. Could be a row or col pivot group.
                * @event pivotgroupcollapse
                * @param {String} type  Either 'row' or 'col'
                * @param {Mz.aggregate.axis.Item} group The axis item
                */
                'pivotgroupcollapse',
                
                /**
                * Fires when a mouse click is detected on a pivot group element.
                * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * Return false if you want to prevent expanding/collapsing that group.
                * 
                * @event pivotgroupclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupclick',

                /**
                * Fires when a mouse double click is detected on a pivot group element.
                * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivotgroupdblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupdblclick',

                /**
                * Fires when a mouse right click is detected on a pivot group element.
                * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivotgroupcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupcontextmenu',

                /**
                * Fires when a mouse click is detected on a pivot group cell.
                * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotgroupcellclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupcellclick',

                /**
                * Fires when a mouse double click is detected on a pivot group cell.
                * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotgroupcelldblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupcelldblclick',

                /**
                * Fires when a mouse right click is detected on a pivot group cell.
                * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotgroupcellcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupcellcontextmenu',

                /**
                * Fires when a mouse click is detected on a pivot item element.
                * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivotitemclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemclick',

                /**
                * Fires when a mouse double click is detected on a pivot item element.
                * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivotitemdblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemdblclick',

                /**
                * Fires when a mouse right click is detected on a pivot item element.
                * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivotitemcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemcontextmenu',

                /**
                * Fires when a mouse click is detected on a pivot item cell.
                * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotitemcellclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemcellclick',

                /**
                * Fires when a mouse double click is detected on a pivot item cell.
                * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotitemcelldblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemcelldblclick',

                /**
                * Fires when a mouse right click is detected on a pivot item cell.
                * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotitemcellcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemcellcontextmenu',
                
                /**
                * Fires when a mouse click is detected on a pivot grand total element.
                * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivottotalclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotalclick',

                /**
                * Fires when a mouse double click is detected on a pivot grand total element.
                * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivottotaldblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotaldblclick',

                /**
                * Fires when a mouse right click is detected on a pivot grand total element.
                * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivottotalcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotalcontextmenu',

                /**
                * Fires when a mouse click is detected on a pivot grand total cell.
                * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivottotalcellclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotalcellclick',

                /**
                * Fires when a mouse double click is detected on a pivot grand total cell.
                * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivottotalcelldblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotalcelldblclick',

                /**
                * Fires when a mouse double click is detected on a pivot grand total cell.
                * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivottotalcellcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotalcellcontextmenu'
            );
        }
        
        Ext.apply(matrixConfig, {
            leftAxis:               me.leftAxis,
            topAxis:                me.topAxis,
            aggregate:              me.aggregate,
            showZeroAsBlank:        me.showZeroAsBlank,
            textTotalTpl:           me.textTotalTpl,
            textGrandTotalTpl:      me.textGrandTotalTpl,
            viewLayoutType:         me.viewLayoutType,
            rowSubTotalsPosition:   me.rowSubTotalsPosition,
            rowGrandTotalsPosition: me.rowGrandTotalsPosition,
            colSubTotalsPosition:   me.colSubTotalsPosition,
            colGrandTotalsPosition: me.colGrandTotalsPosition
        });
        
        Ext.applyIf(matrixConfig, me.matrixConfig || {});
        Ext.applyIf(matrixConfig, {
            mztype: 'local'
        });
        // just a bit of hardcoding for old version compatibility
        if(matrixConfig.mztype == 'local' && me.originalStore){
            Ext.applyIf(matrixConfig, {
                store: me.originalStore
            });
        }
        
        me.matrix = Ext.createByAlias('pivotmatrix.' + matrixConfig.mztype, matrixConfig);
        
        me.matrixListeners = me.matrix.on({
            cleardata:      me.onMatrixClearData,
            start:          me.onMatrixProcessStart,
            progress:       me.onMatrixProcessProgress,
            done:           me.onMatrixDataReady,
            beforeupdate:   me.onMatrixBeforeUpdate,
            afterupdate:    me.onMatrixAfterUpdate,
            scope:          me,
            destroyable:    true
        });
        
        me.matrixRelayedListeners = me.relayEvents(me.matrix, ['start', 'progress', 'done', 'modelbuilt', 'columnsbuilt', 'recordbuilt', 'buildtotals', 'storebuilt'], 'pivot');
    },
    
    destroy: function(){
        var me = this;

        me.delayedTask.cancel();
        Ext.destroy(me.matrixRelayedListeners, me.matrixListeners, me.headerCtListeners, me.lockedHeaderCtListeners);
        Ext.destroy(me.matrix, me.delayedTask, me.originalStore);
        
        me.callParent();
    },
    
    afterRender: function(){
        var me = this;
        
        me.reconfigurePivot();
        
        me.callParent(arguments);
    },
    
    /**
    * @private
    * Refresh the view.
    */
    refreshView: function(){
        var me = this,
            store,
            columns;
        
        if(me.scheduledReconfigure === true){
            me.scheduledReconfigure = false;
            columns = me.getMatrix().getColumnHeaders();
            me.preparePivotColumns(columns);
            me.restorePivotColumnsState(columns);
            me.reconfigure(undefined, columns);
        }
        me.store.fireEvent('pivotstoreremodel', me);
    },
    
    /**
    * @private
    * 
    */
    onMatrixClearData: function(){
        var me = this;
        
        me.store.removeAll(true);
        if(!me.expandedItemsState){
            me.lastColumnsState = null;
        }
    },
    
    /**
    * @private
    * 
    */
    onMatrixProcessStart: function(){
        var me = this;
        
        me.startTime = Ext.Date.now();
        if(me.debugMode){
            Ext.log('Matrix process started');
        }
        if (me.enableLoadMask) {
            me.setLoading(true);
        }
    },
    
    /**
    * @private
    * 
    */
    onMatrixProcessProgress: function(matrix, index, length){
        var me = this,
            pEl, percent = ((index || 0.1) * 100)/(length || 0.1);
        
        if(me.loadMask){
            if(me.loadMask.msgTextEl){
                pEl = me.loadMask.msgTextEl;
            }else if(me.loadMask.msgEl){
                pEl = me.loadMask.msgEl;
            }

            if(pEl){
                pEl.update(Ext.util.Format.number(percent, '0')  + '%');
            }
        }
    },
    
    /**
    * @private
    * 
    */
    onMatrixBeforeUpdate: function(){
        /*
        * Auto update of html elements when a record is updated doesn't work on ExtJS 5
        * because the pivot grid uses an outerTpl which add table cols to each grid row
        * and this messes up the logic in Ext.view.Table.handleUpdate function.
        * The workaround is to suspend events on the grid store before updating the matrix
        * and resume events after all store records were update.
        * As a final step the grid is refreshed.
        */
        this.store.suspendEvents();
    },
    
    /**
    * @private
    * 
    */
    onMatrixAfterUpdate: function(){
        var me = this;
        
        me.store.resumeEvents();
        me.store.fireEvent('pivotstoreremodel');
    },
    
    /**
    * @private
    * 
    */
    onMatrixDataReady: function(){
        var me = this,
            cols = me.matrix.getColumnHeaders(),
            stateApplied = false;
        
        if (me.enableLoadMask) {
            me.setLoading(false);
        }
        
        if(me.expandedItemsState){
            me.matrix.leftAxis.items.each(function(item){
                if(Ext.Array.indexOf(me.expandedItemsState['rows'], item.key) >= 0){
                    item.expanded = true;
                    stateApplied = true;
                }
            });
            
            me.matrix.topAxis.items.each(function(item){

                if(Ext.Array.indexOf(me.expandedItemsState['cols'], item.key) >= 0){
                    item.expanded = true;
                    stateApplied = true;
                }
            });
            
            if(stateApplied){
                cols = me.matrix.getColumnHeaders(),
                delete me.expandedItemsState;
            }
            
        }else{
            me.doExpandCollapseTree(me.matrix.leftAxis.getTree(), !me.startRowGroupsCollapsed);
            me.doExpandCollapseTree(me.matrix.topAxis.getTree(), !me.startColGroupsCollapsed);
            cols = me.matrix.getColumnHeaders();
        }
        
        me.preparePivotColumns(cols);
        me.restorePivotColumnsState(cols);

        me.reconfigure(undefined, cols);
        me.store.fireEvent('pivotstoreremodel', me);
                 
        if(me.debugMode){
            Ext.log('Matrix process ended in ' + (Ext.Date.now() - me.startTime) + 'ms');
        }
    },
    
    /**
    * @private
    *
    * Prepare columns delivered by the Matrix to be used inside the grid panel
    * 
    * @param columns
    */
    preparePivotColumns: function(columns){
        var me = this,
            defaultColConfig = {
                menuDisabled:   true,
                sortable:       false,
                lockable:       false
            }, 
            colCount = columns.length,
            i, column;
        
        for(i = 0; i < colCount; i++){
            column = columns[i];
            column.cls = column.cls || '';
            
            Ext.apply(column, defaultColConfig);
            
            if(column.leftAxis){
                column.locked = me.enableLocking;
            }//else leave it as it is
            
            if(column.subTotal){
                column.cls = column.tdCls = me.clsGroupTotal;
            }
            if(column.grandTotal){
                column.cls = column.tdCls = me.clsGrandTotal;
            }
            
            if(!column.xexpanded){
                column.cls += ' ' + Ext.baseCSSPrefix + 'grid-row-collapsed';
            }
            if(column.xcollapsible){
                column.text = Ext.String.format('<span class="' + Ext.baseCSSPrefix + 'grid-row-expander" style="padding-left: 13px">{0}</span>', column.text);
            }
            
            if(Ext.isEmpty(column.columns)){
                if(column.dimension){
                    column.renderer = (column.dimension && !column.leftAxis) ? column.dimension.renderer : false;
                    column.align = column.dimension.align;
                    if(column.dimension.flex > 0){
                        column.flex = column.dimension.flex;
                    }else{
                        column.width = column.dimension.width;
                    }
                }
            }else{
                me.preparePivotColumns(column.columns);
            }
        }
    },
    
    /**
    * If you want to reconfigure the pivoting parameters then use this function.
    * If you use a local matrix then send the new store here too.
    * The config object is used to reconfigure the matrix object.
    * 
    * @param config
    */
    reconfigurePivot: function(config){
        var me = this,
            props = Ext.clone(me.getStateProperties()),
            i;
        
        props.push('startRowGroupsCollapsed', 'startColGroupsCollapsed', 'showZeroAsBlank');
        
        config = config || {};
        
        for(i = 0; i < props.length; i++){
            if(!config.hasOwnProperty(props[i])){
                if(me[props[i]]){
                    config[props[i]] = me[props[i]];
                }
            }else{
                me[props[i]] = config[props[i]];
            }
        }

        me.getMatrix().reconfigure(config);
    },
    
    /**
    * Returns the matrix object that does all calculations
    * @returns {Mz.aggregate.matrix.Abstract}
    * 
    */
    getMatrix: function(){
        return this.matrix;
    },
    
    /**
    * Collapse or expand the Matrix tree items.
    */
    doExpandCollapseTree: function(tree, expanded){
        var i;
        
        for(i = 0; i < tree.length; i++){
            tree[i].expanded = expanded;
            if(tree[i].children){
                this.doExpandCollapseTree(tree[i].children, expanded);
            }
        }
    },
    
    /**
    * @private
    *
    *   Expand or collapse the specified group. 
    *   If no "state" is provided then toggle the expanded property
    */
    doExpandCollapse: function(type, groupId, state){
        var me = this,
            item;
        
        if(!me.matrix){
            // nothing to do
            return;
        }
        
        item = (type == 'row' ? me.matrix.leftAxis : me.matrix.topAxis)['findTreeElement']('key', groupId);
        if(!item){
            return;
        }
        
        item.node.expanded = Ext.isDefined(state) ? state : !item.node.expanded;
        if(type == 'col'){
            me.scheduledReconfigure = true;
        }
        me.refreshView();

        // fire the pivotgroupexpand or pivotgroupcollapse event
        me.fireEvent((item.node.expanded ? 'pivotgroupexpand' : 'pivotgroupcollapse'), me, type, item.node);
    },
    
    /**
    * Expand the specified row group
    */
    expandRow: function(groupId){
        this.doExpandCollapse('row', groupId, true);
    },
    
    /**
    * Collapse the specified row group
    */
    collapseRow: function(groupId){
        this.doExpandCollapse('row', groupId, false);
    },
    
    /**
    * Expand the specified col group
    */
    expandCol: function(groupId){
        this.doExpandCollapse('col', groupId, true);
    },
    
    /**
    * Collapse the specified col group
    */
    collapseCol: function(groupId){
        this.doExpandCollapse('col', groupId, false);
    },
    
    /**
    * Expand all groups.
    * 
    */
    expandAll: function(){
        var me = this;
        
        me.expandAllColumns();
        me.expandAllRows();
    },
    
    /**
    * Expand all row groups
    * 
    */
    expandAllRows: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().leftAxis.getTree(), true);
        me.delayedTask.delay(10);
    },
    
    /**
    * Expand all column groups
    * 
    */
    expandAllColumns: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().topAxis.getTree(), true);
        me.scheduledReconfigure = true;
        me.delayedTask.delay(10);
    },
    
    /**
    * Collapse all groups.
    * 
    */
    collapseAll: function(){
        var me = this;
        
        me.collapseAllRows();
        me.collapseAllColumns();
    },
    
    /**
    * Collapse all row groups
    * 
    */
    collapseAllRows: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().leftAxis.getTree(), false);
        me.delayedTask.delay(10);
    },
    
    /**
    * Collapse all column groups
    * 
    */
    collapseAllColumns: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().topAxis.getTree(), false);
        me.scheduledReconfigure = true;
        me.delayedTask.delay(10);
    },

    /**
    *     Returns the original store with the data to process.
    *    @returns {Ext.data.Store}
    */
    getStore: function(){
        var me = this,
            matrix = me.getMatrix();
        
        return ( (matrix instanceof Mz.aggregate.matrix.Local) ? matrix.store : me.originalStore ) || me.store;
    },
    
    /**
    *    Returns the pivot store with the aggregated values
    *    @returns {Ext.data.Store}
    */
    getPivotStore: function(){
        return this.store;
    },
    
    /**
    * @private
    */
    onHeaderClick: function(ct, column, e){
        var me = this, 
            columns, el,
            sortState = (column.sortState ? (column.sortState == 'ASC' ? 'DESC' : 'ASC') : 'ASC');
        
        if(!column.xexpandable) {
            if(e) {
                e.stopEvent();
            }

            if((column.leftAxis || column.topAxis) && !Ext.isEmpty(column.dataIndex)){
                // sort the results when a dataIndex column was clicked
                if(me.getMatrix().leftAxis.sortTreeByField(column.dataIndex, sortState )){
                    me.refreshView();

                    if (Ext.getVersion('extjs').match(5.0)) {
                        column.setSortState(new Ext.util.Sorter({direction: sortState, property: 'dummy'}));
                        column.sortState = sortState;
                    }else{
                        column.setSortState(sortState, false, true);
                    }
                }
            }

            return false;
        }

        me.doExpandCollapse('col', column.key);

        if(e) e.stopEvent();
    },

    
    getStateProperties: function(){
        return ['viewLayoutType', 'rowSubTotalsPosition', 'rowGrandTotalsPosition', 'colSubTotalsPosition', 'colGrandTotalsPosition', 'aggregate', 'leftAxis', 'topAxis'];
    },
    
    /**
    * Applies the saved state of the pivot grid
    */
    applyState: function(state){
        var me = this,
            props = me.getStateProperties(),
            i;
        
        for(i = 0; i < props.length; i++){
            if(state[props[i]]){
                me[props[i]] = state[props[i]];
            }
        }
        
        if(state['expandedItems']){
            me.expandedItemsState = state['expandedItems'];
        }
        
        me.lastColumnsState = state['pivotcolumns'] || {};
        
        if(me.rendered){
            me.reconfigurePivot();
        }
    },
    
    /**
    *    Get the current state of the pivot grid. 
    *    Be careful that the stateful feature won't work correctly in this cases:
    *    - if you provide an aggregator function to the aggregate item then this won't be serialized. 
    *        You could extend {Mz.aggregate.Aggregators} to add your own function
    *    - if you provide a renderer function then this won't be serialized. You need to provide a formatting string instead.
    */
    getState: function(){
        var me = this,
            state = {},
            props = me.getStateProperties(),
            i;
        
        for(i = 0; i < props.length; i++){
            state[props[i]] = me[props[i]];
        }
        
        // save the state of all expanded axis groups
        state['expandedItems'] = {
            cols:   [],
            rows:   []
        };
        
        me.matrix.leftAxis.items.each(function(item){
            if(item.expanded){
                state['expandedItems']['rows'].push(item.key);
            }
        });
        
        me.matrix.topAxis.items.each(function(item){
            if(item.expanded){
                state['expandedItems']['cols'].push(item.key);
            }
        });
        
        // to be able to restore the width/flex of the left axis columns we need the IDs
        me.matrix.leftAxis.dimensions.each(function(item, index){
            state['leftAxis'][index]['id'] = item.getId();
        });
        
        state['pivotcolumns'] = me.getPivotColumnsState();
        
        return state;
    },
    
    /**
    * @private
    */
    getPivotColumnsState: function(){
        var me = this,
            i, cols;
        
        if(!me.lastColumnsState){
            cols = me.getDataIndexColumns(me.getMatrix().getColumnHeaders());
            me.lastColumnsState = {};
            
            for(i = 0; i < cols.length; i++){
                if(cols[i].dataIndex){
                    me.lastColumnsState[cols[i].dataIndex] = {
                        width:  cols[i].width,
                        flex:   cols[i].flex || 0
                    };
                }
            }
        }
        
        cols = me.getView().getGridColumns();
        for(i = 0; i < cols.length; i++){
            if(cols[i].dataIndex){
                me.lastColumnsState[cols[i].dataIndex] = {
                    width:  cols[i].rendered ? cols[i].getWidth() : cols[i].width,
                    flex:   cols[i].flex || 0
                };
            }
        }
        
        return me.lastColumnsState;
    },

    /**
    * @private
    */
    getDataIndexColumns: function(columns){
        var cols = [], i;
        
        for(i = 0; i < columns.length; i++){
            if(columns[i].dataIndex){
                cols.push(columns[i].dataIndex);
            }else if (Ext.isArray(columns[i].columns)){
                cols = Ext.Array.merge(cols, this.getDataIndexColumns(columns[i].columns));
            }
        }
        
        return cols;
    },
    
    /**
    * @private
    */
    restorePivotColumnsState: function(columns){
        var me = this,
            //state = fromState ? me.lastPivotColumnsState || me.getPivotColumnsState() : me.getPivotColumnsState(),
            state = me.getPivotColumnsState(),
            parseColumns;
            
        parseColumns = function(columns){
            var item, i;
            
            if(!columns){
                return;
            }
            for(i = 0; i < columns.length; i++){
                item = state[columns[i].dataIndex];
                if(item){
                    if(item.flex){
                        columns[i].flex = item.flex;
                    }else if(item.width){
                        columns[i].width = item.width;
                    }
                }
                parseColumns(columns[i].columns);
            }
        };
        
        parseColumns(columns);
    }
    
});

