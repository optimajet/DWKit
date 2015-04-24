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
* This class is used for creating a configuration field.
* 
*/
Ext.define('Mz.pivot.plugin.configurator.Column',{
    extend: 'Ext.Component',
    
    requires: [
        'Ext.menu.Menu',
        'Mz.pivot.plugin.configurator.FilterLabelWindow'
    ],
    
    alias: 'widget.mzconfigcolumn',
    
    childEls: ['textCol', 'filterCol', 'sortCol'],
    
    renderTpl: 
        '<div id="{id}-configCol" class="' + Ext.baseCSSPrefix + 'config-column-inner">' +
            '<tpl if="isCustomizable">' +
                '<span id={id}-customCol class="' + Ext.baseCSSPrefix + 'config-column-customize"></span>' +
            '</tpl>' +
            '<span id="{id}-textCol" class="' + Ext.baseCSSPrefix + 'config-column-text ' + Ext.baseCSSPrefix + 'column-header-text">' + 
                '{header}{aggregator}' +
            '</span>' +
            '<span id={id}-sortCol class=""></span>' +
            '<span id={id}-filterCol class=""></span>' +
        '</div>',
        
    header:         '&#160;',
    isCustomizable: false,
    dimension:      null,
    isAgg:          false,

    sumText:                    'Sum',
    avgText:                    'Avg',
    countText:                  'Count',
    minText:                    'Min',
    maxText:                    'Max',
    groupSumPercentageText:     'Group sum percentage',
    groupCountPercentageText:   'Group count percentage',

    sortAscText:                'Sort A to Z',
    sortDescText:               'Sort Z to A',
    sortClearText:              'Disable sorting',
    clearFilterText:            'Clear filter from "{0}"',
    labelFiltersText:           'Label filters',
    valueFiltersText:           'Value filters',
    equalsText:                 'Equals...',
    doesNotEqualText:           'Does not equal...',
    beginsWithText:             'Begins with...',
    doesNotBeginWithText:       'Does not begin with...',
    endsWithText:               'Ends with...',
    doesNotEndWithText:         'Does not end with...',
    containsText:               'Contains...',
    doesNotContainText:         'Does not contain...',
    greaterThanText:            'Greater than...',
    greaterThanOrEqualToText:   'Greater than or equal to...',
    lessThanText:               'Less than...',
    lessThanOrEqualToText:      'Less than or equal to...',
    betweenText:                'Between...',
    notBetweenText:             'Not between...',
    top10Text:                  'Top 10...',

    equalsLText:                'equals',
    doesNotEqualLText:          'does not equal',
    beginsWithLText:            'begins with',
    doesNotBeginWithLText:      'does not begin with',
    endsWithLText:              'ends with',
    doesNotEndWithLText:        'does not end with',
    containsLText:              'contains',
    doesNotContainLText:        'does not contain',
    greaterThanLText:           'is greater than',
    greaterThanOrEqualToLText:  'is greater than or equal to',
    lessThanLText:              'is less than',
    lessThanOrEqualToLText:     'is less than or equal to',
    betweenLText:               'is between',
    notBetweenLText:            'is not between',
    top10LText:                 'Top 10...',
    topOrderTopText:            'Top',
    topOrderBottomText:         'Bottom',
    topTypeItemsText:           'Items',
    topTypePercentText:         'Percent',
    topTypeSumText:             'Sum',

    ascSortCls:         Ext.baseCSSPrefix + 'config-column-sort-ASC',
    descSortCls:        Ext.baseCSSPrefix + 'config-column-sort-DESC',
    baseCls:            Ext.baseCSSPrefix + 'config-column',
    filteredCls:        Ext.baseCSSPrefix + 'config-column-filtered',
    clearFilterIconCls: Ext.baseCSSPrefix + 'clearFilterIcon',
    ascSortIconCls:     Ext.baseCSSPrefix + 'sortAscIcon',
    descSortIconCls:    Ext.baseCSSPrefix + 'sortDescIcon',
    disableSortIconCls: Ext.baseCSSPrefix + 'sortDisableIcon',
    
    //height:         '100%',
    height:         26,
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        if (!Ext.getVersion('extjs').match(5.0)) {
            me.addEvents(
                /**
                * @event sortchange
                * @param {Mz.pivot.plugin.configurator.Column} col
                * @param String direction
                */
                'sortchange',
                
                'filterchange'
                
            );
        }
    },
    
    destroy: function(){
        var me = this;
        
        delete(me.dimension);
        Ext.destroy(me.relayers, me.menu);
        me.callParent(arguments);
    },
    
    show: function(){
        var me = this;
        
        me.callParent();
    },
    
    initRenderData: function() {
        var me = this;

        return Ext.apply(me.callParent(arguments), {
            header:         me.dimension.header,
            aggregator:     me.isAgg ? ' (' + me.dimension.aggregator + ')' : '',
            dimension:      me.dimension,
            isCustomizable: me.isCustomizable
        });
    },
    
    afterRender: function(){
        var me = this;
        
        me.callParent();

        if(me.isCustomizable){
            if(me.dimension.sortable){
                me.addSortCls(me.dimension.direction);
            }
            
            if(me.dimension.filter){
                me.addFilterCls();
            }

            me.mon(me.getTargetEl(), {
                scope: me,
                click: me.handleColClick
            });
        } 
        
    },

    handleColClick: function(e, t){
        // handles grid column sorting
        var me = this;
        
        if(me.isAgg){
            me.showAggMenu();
            e.stopEvent();
        }else{
            me.showColMenu();
        }
    },
    
    handleMenuClick: function(item, e){
        var me = this,
            method;
        
        me.dimension.aggregator = item.aggregator;
        if(me.textCol){
            method = me.textCol.setHtml ? 'setHtml' : 'setHTML';
            me.textCol[method](me.header + ' (' + me.dimension.aggregator + ')');
        }
        me.ownerCt.updateLayout();
        me.fireEvent('configchange');
    },
    
    addSortCls: function(direction){
        var me = this;
        
        if(!me.sortCol){
            return;
        }
        
        if(direction === 'ASC'){
            me.sortCol.addCls(me.ascSortCls);
            me.sortCol.removeCls(me.descSortCls);
        }else{
            me.sortCol.addCls(me.descSortCls);
            me.sortCol.removeCls(me.ascSortCls);
        }

    },
    
    removeSortCls: function(direction){
        var me = this;
        
        if(!me.sortCol){
            return;
        }
        
        if(direction === 'ASC'){
            me.sortCol.removeCls(me.ascSortCls);
        }else{
            me.sortCol.removeCls(me.descSortCls);
        }

    },
    
    addFilterCls: function(){
        var me = this;
        
        if(me.filterCol && !me.filterCol.hasCls(me.filteredCls)){
            me.filterCol.addCls(me.filteredCls);
        }
    },
    
    removeFilterCls: function(){
        var me = this;
        
        if(me.filterCol){
            me.filterCol.removeCls(me.filteredCls);
        }
    },

    serialize: function(){
        var me = this;
        
        return Ext.applyIf({
            idColumn:       me.id
        }, me.initialConfig);
    },
    
    showAggMenu: function(){
        var me = this,
            aggregator = me.dimension.aggregator;
        
        //create a menu with possible aggregate functions
        Ext.destroy(me.menu);
        me.menu = Ext.create('Ext.menu.Menu', {
            floating:   true,
            defaults: {
                handler:    me.handleMenuClick,
                scope:      me,
                xtype:      'menucheckitem',
                group:      'aggregator'
            },
            items: [{
                text:       me.sumText,
                aggregator: 'sum',
                checked:    aggregator == 'sum'
            },{
                text:       me.avgText,
                aggregator: 'avg',
                checked:    aggregator == 'avg'
            },{
                text:       me.countText,
                aggregator: 'count',
                checked:    aggregator == 'count'
            },{
                text:       me.maxText,
                aggregator: 'max',
                checked:    aggregator == 'max'
            },{
                text:       me.minText,
                aggregator: 'min',
                checked:    aggregator == 'min'
            },{
                text:       me.groupSumPercentageText,
                aggregator: 'groupSumPercentage',
                checked:    aggregator == 'groupSumPercentage'
            },{
                text:       me.groupCountPercentageText,
                aggregator: 'groupCountPercentage',
                checked:    aggregator == 'groupCountPercentage'
            }]
        });
        me.menu.showBy(me);
    },
    
    showColMenu: function(){
        var me = this,
            items = [], 
            labelItems, valueItems, commonItems, i,
            filter = me.dimension.filter;

        Ext.destroy(me.menu);
        
        // check if the dimension is sortable
        items.push({
            text:       me.sortAscText,
            direction:  'ASC',
            iconCls:    me.ascSortIconCls,
            handler:    me.sortMe
        }, {
            text:       me.sortDescText,
            direction:  'DESC',
            iconCls:    me.descSortIconCls,
            handler:    me.sortMe
        }, {
            text:       me.sortClearText,
            direction:  '',
            disabled:   !me.dimension.sortable,
            iconCls:    me.disableSortIconCls,
            handler:    me.sortMe
        },{
            xtype:  'menuseparator'
        });
        
        commonItems = [{
            text:       me.equalsText,
            filterType: Mz.aggregate.filter.Label.TypeEquals
        },{
            text:       me.doesNotEqualText,
            filterType: Mz.aggregate.filter.Label.TypeDoesNotEqual
        },{
            xtype:  'menuseparator'
        },{
            text:       me.greaterThanText,
            filterType: Mz.aggregate.filter.Label.TypeGreaterThan
        },{
            text:       me.greaterThanOrEqualToText,
            filterType: Mz.aggregate.filter.Label.TypeGreaterThanOrEqualTo
        },{
            text:       me.lessThanText,
            filterType: Mz.aggregate.filter.Label.TypeLessThan
        },{
            text:       me.lessThanOrEqualToText,
            filterType: Mz.aggregate.filter.Label.TypeLessThanOrEqualTo
        },{
            xtype:  'menuseparator'
        },{
            text:       me.betweenText,
            filterType: Mz.aggregate.filter.Label.TypeBetween
        },{
            text:       me.notBetweenText,
            filterType: Mz.aggregate.filter.Label.TypeNotBetween
        }];

        labelItems = Ext.clone(commonItems);
        Ext.Array.insert(labelItems, 3, [{
            text:       me.beginsWithText,
            filterType: Mz.aggregate.filter.Label.TypeBeginsWith
        },{
            text:       me.doesNotBeginWithText,
            filterType: Mz.aggregate.filter.Label.TypeDoesNotBeginWith
        },{
            text:       me.endsWithText,
            filterType: Mz.aggregate.filter.Label.TypeEndsWith
        },{
            text:       me.doesNotEndWithText,
            filterType: Mz.aggregate.filter.Label.TypeDoesNotEndWith
        },{
            xtype:  'menuseparator'
        },{
            text:       me.containsText,
            filterType: Mz.aggregate.filter.Label.TypeContains
        },{
            text:       me.doesNotContainText,
            filterType: Mz.aggregate.filter.Label.TypeDoesNotContain
        },{
            xtype:  'menuseparator'
        }]);

        for(i = 0; i < labelItems.length; i++){
            labelItems[i]['checked'] = (filter && filter.mztype == 'label' && filter.type == labelItems[i].filterType);
        }
        
        valueItems = Ext.clone(commonItems);
        valueItems.push({
            xtype:  'menuseparator'
        },{
            text:       me.top10Text,
            filterType: Mz.aggregate.filter.Value.TypeTop10
        });

        for(i = 0; i < valueItems.length; i++){
            valueItems[i]['checked'] = (filter && filter.mztype == 'value' && filter.type == valueItems[i].filterType);
        }
        
        items.push({
            text:       Ext.String.format(me.clearFilterText, me.header),
            iconCls:    me.clearFilterIconCls,
            disabled:   !filter,
            handler:    me.onRemoveFilter
        },{
            text:   me.labelFiltersText,
            menu: {
                defaults: {
                    handler:    me.onShowFilter,
                    scope:      me,
                    xtype:      'menucheckitem',
                    group:      'filterlabel',
                    mztype:     'label'
                },
                items: labelItems
            }
        },{
            text:   me.valueFiltersText,
            menu: {
                defaults: {
                    handler:    me.onShowFilter,
                    scope:      me,
                    xtype:      'menucheckitem',
                    group:      'filtervalue',
                    mztype:     'value'
                },
                items: valueItems
            }
        });
        
        me.menu = Ext.create('Ext.menu.Menu', {
            floating:   true,
            defaults: {
                scope:      me
            },
            items: items
        });
        me.menu.showBy(me);
    },
    
    sortMe: function(btn){
        var me = this;
            
        if(Ext.isEmpty(btn.direction)){
            //disable sorting
            me.dimension.sortable = false;
            me.removeSortCls(me.dimension.direction);
        }else{
            me.dimension.sortable = true;
            me.addSortCls(btn.direction);
            me.dimension.direction = btn.direction;
        }
        me.fireEvent('sortchange', me, btn.direction);
    },
    
    onShowFilter: function(btn){
        var me = this,
            win, store, winClass, winCfg = {}, data, dataAgg,
            filter = me.dimension.filter,
            values = {
                mztype:         btn.mztype,
                type:           btn.filterType,
                value:          (filter ? filter.value : ''),
                from:           (filter ? filter.from : ''),
                to:             (filter ? filter.to : ''),
                caseSensitive:  (filter ? filter.caseSensitive : false),
                topSort:        (filter ? filter.topSort : false)
            };
        
        dataAgg = [];
        Ext.each(me.ownerCt.aggregateDimensions, function(field){
            dataAgg.push([field.header, field.id]);
        });

        if(btn.mztype == 'label' || (btn.mztype == 'value' && btn.filterType != Mz.aggregate.filter.Value.TypeTop10)){
            data = [
                [me.equalsLText, Mz.aggregate.filter.Label.TypeEquals],
                [me.doesNotEqualLText, Mz.aggregate.filter.Label.TypeDoesNotEqual],
                [me.greaterThanLText, Mz.aggregate.filter.Label.TypeGreaterThan],
                [me.greaterThanOrEqualToLText, Mz.aggregate.filter.Label.TypeGreaterThanOrEqualTo],
                [me.lessThanLText, Mz.aggregate.filter.Label.TypeLessThan],
                [me.lessThanOrEqualToLText, Mz.aggregate.filter.Label.TypeLessThanOrEqualTo],
                [me.betweenLText, Mz.aggregate.filter.Label.TypeBetween],
                [me.notBetweenLText, Mz.aggregate.filter.Label.TypeNotBetween]
            ];
            
            if(btn.mztype == 'label'){
                Ext.Array.insert(data, 3, [
                    [me.beginsWithLText, Mz.aggregate.filter.Label.TypeBeginsWith],
                    [me.doesNotBeginWithLText, Mz.aggregate.filter.Label.TypeDoesNotBeginWith],
                    [me.endsWithLText, Mz.aggregate.filter.Label.TypeEndsWith],
                    [me.doesNotEndWithLText, Mz.aggregate.filter.Label.TypeDoesNotEndWith],
                    [me.containsLText, Mz.aggregate.filter.Label.TypeContains],
                    [me.doesNotContainLText, Mz.aggregate.filter.Label.TypeDoesNotContain]
                ]);
                winClass = 'Mz.pivot.plugin.configurator.FilterLabelWindow';
            }else{
                winClass = 'Mz.pivot.plugin.configurator.FilterValueWindow';
                Ext.apply(values, {
                    dimensionId:    (filter ? filter.dimensionId : '')
                });
                
                winCfg.storeAgg = Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data:   dataAgg
                });
            }
            
            winCfg.store = Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data:   data
            });
        }else{
            winClass = 'Mz.pivot.plugin.configurator.FilterTopWindow';
            data = [];

            Ext.apply(winCfg, {
                storeTopOrder: Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data:[
                        [me.topOrderTopText, 'top'],
                        [me.topOrderBottomText, 'bottom']
                    ]
                }),
                storeTopType: Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data:[
                        [me.topTypeItemsText, 'items'],
                        [me.topTypePercentText, 'percent'],
                        [me.topTypeSumText, 'sum']
                    ]
                }),
                storeAgg: Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data:   dataAgg
                })
            });

            Ext.apply(values, {
                type:           Mz.aggregate.filter.Value.TypeTop10,
                dimensionId:    (filter ? filter.dimensionId : ''),
                topType:        (filter ? filter.topType : 'items'),
                topOrder:       (filter ? filter.topOrder : 'top')
            });
        }
        
        win = Ext.create(winClass, Ext.apply(winCfg || {}, {
            title:      me.header,
            listeners: {
                filter: me.onApplyFilter,
                scope:  me
            }
        }));
        
        win.down('form').getForm().setValues(values);
        win.show();
    },
    
    onApplyFilter: function(win){
        var me = this,
            filter = win.down('form').getForm().getValues();
        
        filter.caseSensitive = (filter.caseSensitive === 'on');
        filter.topSort = (filter.topSort === 'on');
        win.close();
        me.addFilterCls();
        me.dimension.filter = filter;
        me.fireEvent('filterchange', me, filter);
    },
    
    onRemoveFilter: function(){
        var me = this;
        
        me.removeFilterCls();
        me.dimension.filter = null;
        me.fireEvent('filterchange', me, null);
    }
    
    
});