/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This class is used to generate the pivot data.
* 
*/
Ext.define('Mz.aggregate.matrix.Abstract', {
    extend: 'Ext.util.Observable',
    
    alias:  'pivotmatrix.abstract',
    /**
    * Use this when you define a matrix type in the matrixConfig of the grid.
    * Same treatment as the 'xtype' config in ExtJS.
    * 
    * @cfg
    * @type String
    */
    mztype: 'abstract',
    
    requires: [
        'Ext.util.DelayedTask',
        'Ext.data.ArrayStore',
        'Ext.XTemplate',
        'Mz.aggregate.Aggregators',
        'Mz.aggregate.MixedCollection',
        'Mz.aggregate.axis.Abstract',
        'Mz.aggregate.dimension.Item',
        'Mz.aggregate.matrix.Results'
    ],
    
    /**
    * Define the type of left Axis this class uses. Specify here the pivotaxis alias.
    * 
    * @cfg
    * @type String
    */
    mztypeLeftAxis:     'abstract',

    /**
    * Define the type of top Axis this class uses. Specify here the pivotaxis alias.
    * 
    * @cfg
    * @type String
    */
    mztypeTopAxis:      'abstract',
    
    /**
    * In compact layout only one column is generated for the left axis dimensions.
    * This is value of that column header. 
    * 
    * @cfg
    * @type String
    */
    textRowLabels:      'Row labels',
    
    /**
    * @cfg {String} textTotalTpl Configure the template for the group total. (i.e. '{name} ({rows.length} items)')
    * @cfg {String}           textTotalTpl.groupField         The field name being grouped by.
    * @cfg {String}           textTotalTpl.name               Group name
    * @cfg {Ext.data.Model[]} textTotalTpl.rows               An array containing the child records for the group being rendered.
    */
    textTotalTpl:       'Total ({name})',

    /**
    * @cfg {String} textGrandTotalTpl Configure the template for the grand total.
    */
    textGrandTotalTpl:  'Grand total',

    /**
    * Do not use regexp special chars for this.
    * 
    * @type String
    */
    keysSeparator:      '#_#',
    
    /**
    * Generic key used by the grand total records.
    * 
    * @type String
    */
    grandTotalKey:      '#mzgrandtotal#',
    
    /**
    * In compact view layout mode the matrix generates only one column for all left axis dimensions.
    * This is the 'dataIndex' field name on the pivot store model.
    * 
    * @type String
    */
    compactViewKey:     '#compactview#',
    
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
    rowGrandTotalsPosition:     'first',

    /**
    * @cfg {String} colSubTotalsPosition Possible values: first, none, last
    */
    colSubTotalsPosition:       'first',

    /**
    * @cfg {String} colGrandTotalsPosition Possible values: first, none, last
    */
    colGrandTotalsPosition:     'first',

    /**
    * @cfg {Boolean} showZeroAsBlank Should 0 values be displayed as blank?
    * 
    */
    showZeroAsBlank:            false,

    /**
    * Left axis object stores all generated groups for the left axis dimensions
    * 
    * @type {Mz.aggregate.axis.Abstract}
    */
    leftAxis:       null,

    /**
    * Top axis object stores all generated groups for the top axis dimensions
    * 
    * @type {Mz.aggregate.axis.Abstract}
    */
    topAxis:        null,

    /**
    * Collection of configured aggregate dimensions
    * 
    * @type {Mz.aggregate.MixedCollection}
    */
    aggregate:      null,
    
    /**
    * Stores the calculated results
    * 
    * @type {Mz.aggregate.matrix.Results}
    */
    results:        null,
    
    /**
    * The generated pivot store
    * 
    * @type {Ext.data.ArrayStore}
    */
    pivotStore:     null,
    
    /**
    * This property is set to true when the matrix object is destroyed.
    * This is useful to check when functions are deferred.
    * 
    * @type {Boolean}
    */
    isDestroyed:    false,
    
    constructor: function(config){
        var me = this;
        
        me.callParent(arguments);

        if (!Ext.getVersion('extjs').match(5.0)) {
            me.addEvents(
                /**
                * Fires before the generated data is destroyed.
                * The components that uses the matrix should unbind this pivot store before is destroyed.
                * The grid panel will trow errors if the store is destroyed and the grid is refreshed.
                * 
                * @event cleardata
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'cleardata',
                
                /**
                * Fires when the matrix starts processing the records.
                * 
                * @event start
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'start',
                
                /**
                * Fires during records processing.
                * 
                * @event progress
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Integer} index Current index of record that is processed
                * @param {Integer} total Total number of records to process
                */
                'progress',

                /**
                * Fires when the matrix finished processing the records
                * 
                * @event done
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'done',

                /**
                * Fires after the matrix built the store model.
                * 
                * @event modelbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Model} model The built model
                */
                'modelbuilt',

                /**
                * Fires after the matrix built the columns.
                * 
                * @event columnsbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Array} columns The built columns
                */
                'columnsbuilt',

                /**
                * Fires after the matrix built a pivot store record.
                * 
                * @event recordbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Model} record The built record
                */
                'recordbuilt',

                /**
                * Fires before grand total records are created in the pivot store.
                * Push additional objects to the array if you need to create additional grand totals.
                * 
                * @event buildtotals
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Array} totals Array of objects that will be used to create grand total records in the pivot store. Each object should have:
                * @param {String} totals.title Name your grand total
                * @param {Object} totals.values Values used to generate the pivot store record
                */
                'buildtotals',

                /**
                * Fires after the matrix built the pivot store.
                * 
                * @event storebuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Store} store The built store
                */
                'storebuilt'
            );
        }
        
        me.initialize(true, config);
    },
    
    destroy: function(){
        var me = this;
        
        me.delayedTask.cancel();
        delete(me.delayedTask);
        
        if(Ext.isFunction(me.onDestroy)){
            me.onDestroy();
        }
        
        Ext.destroy(me.results, me.leftAxis, me.topAxis, me.aggregate, me.pivotStore);
        
        if(Ext.isArray(me.columns)){
            me.columns.length = 0;
        }
        delete(me.columns);
        if(Ext.isArray(me.model)){
            me.model.length = 0;
        }
        delete(me.model);
        if(Ext.isArray(me.totals)){
            me.totals.length = 0;
        }
        delete(me.totals);
        
        me.isDestroyed = true;

        me.callParent(arguments);
    },
    
    /**
    * The arguments are combined in a string and the function returns the crc32
    * for that key
    * 
    * @returns {String}
    */
    formatKeys: function(){
        var me = this,
            keys = Ext.Array.from(arguments),
            ret = [];
            
        Ext.Array.each(keys, function(key){
            if(!Ext.isEmpty(key)){
                ret.push(me.crc32(key));
            }
        });
        return ret.join(me.keysSeparator).toString();
    },
    
    /**
    * @private
    *
    * Crc32 is a JavaScript function for computing the CRC32 of a string
    * 
    * Version: 1.2 - 2006/11 - http://noteslog.com/category/javascript/
    * Copyright (c) 2006 Andrea Ercolino
    * http://www.opensource.org/licenses/mit-license.php
    * 
    * @param str
    */
    crc32: function(str, crc){
        var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D",
            n = 0, //a number between 0 and 255 
            x = 0; //an hex number 
 
        if(!Ext.isDefined(crc)){
            crc = 0;
        }
        crc = crc ^ (-1);
        str = str.toString(); 
        for( var i = 0, iTop = str.length; i < iTop; i++ ) { 
            n = ( crc ^ str.charCodeAt( i ) ) & 0xFF; 
            x = "0x" + table.substr( n * 9, 8 ); 
            crc = ( crc >>> 8 ) ^ x; 
        } 
        return crc ^ (-1);         
    },
    
    /**
    * @private
    * 
    *     Natural Sort algorithm for Javascript 
    *   Copyright (C) 2010  Sven van Bolt (http://pimpmybyte.de/services/natsort.html)
    * 
    *   Adjusted to be able to compare negative numbers too
    */
    naturalSort: function (s1, s2) {
        var n = /^(\d+|-\d+)(.*)$/;
        s1 = s1 || '';
        s2 = s2 || '';
        
        while (true) {
            if (s1 === s2) { return 0; }
            if (s1 === '') { return -1; }
            if (s2 === '') { return 1; }
            var n1 = n.exec(s1);
            var n2 = n.exec(s2);
            if ( (n1 != null) && (n2 != null) ) {
                if (n1[1] != n2[1]) { return n1[1] - n2[1]; }
                s1 = n1[2];
                s2 = n2[2];
            } else {
                n1 = s1.toString().charCodeAt(0);
                n2 = s2.toString().charCodeAt(0);
                if (n1 != n2) { return n1 - n2; }
                s1 = s1.toString().substr(1);
                s2 = s2.toString().substr(1);
            }
        }
    },

    /**
    * @private
    * 
    * Initialize the matrix with the new config object
    * 
    * @param firstTime
    * @param config
    */
    initialize: function(firstTime, config){
        var me = this,    
            props = [
                'viewLayoutType', 'rowSubTotalsPosition', 'rowGrandTotalsPosition', 
                'colSubTotalsPosition', 'colGrandTotalsPosition', 'showZeroAsBlank'
            ], i;
            
        // initialize the results object
        me.initResults();
        
        // initialize aggregates
        me.initAggregates(config.aggregate || []);
        
        // initialize dimensions and build axis tree
        me.initAxis(config.leftAxis || [], config.topAxis || []);

        for(i = 0; i < props.length; i++){
            if(config.hasOwnProperty(props[i])){
                me[props[i]] = config[props[i]];
            }
        }
        me.totals = [];
        
        if(firstTime){
            me.pivotStore = Ext.create('Ext.data.ArrayStore', {
                autoDestroy:    false,
                fields:         []
            });
            
            me.delayedTask = new Ext.util.DelayedTask(me.startProcess, me);
            
            if(Ext.isFunction(me.onInitialize)){
                me.onInitialize();
            }
        }
    },
    
    /**
    * Template method called to do your internal initialization.
    */
    onInitialize: Ext.emptyFn,
    
    /**
    * Template method called before destroying the instance.
    */
    onDestroy: Ext.emptyFn,
    
    /**
    * Call this function to reconfigure the matrix
    * 
    * @param config
    */
    reconfigure: function(config){
        var me = this,
            config = Ext.clone(config || {});
        
        me.initialize(false, config);
        
        me.clearData();
        
        if(Ext.isFunction(me.onReconfigure)){
            me.onReconfigure(config);
        }
        
        me.delayedTask.delay(5);
    },
    
    /**
    * Template function called when the matrix has to reconfigured with a new set of configs
    */
    onReconfigure: Ext.emptyFn,
    
    /**
    * Initialize the Results object
    */
    initResults: function(){
        var me = this;
        
        Ext.destroy(me.results);
        me.results = Ext.create('Mz.aggregate.matrix.Results', me);
    },
    
    /**
    * @private
    */
    initAggregates: function(aggregates){
        var me = this,
            i, item;
        
        Ext.destroy(me.aggregate);
        me.aggregate = Ext.create('Mz.aggregate.MixedCollection');
        me.aggregate.getKey = function(item){
            return item.getId();
        };
        
        if(Ext.isEmpty(aggregates)){
            return;
        }
        
        aggregates = Ext.Array.from(aggregates);
        
        for(i = 0; i < aggregates.length; i++){
            item = aggregates[i];
            Ext.applyIf(item, {
                isAggregate:        true,
                align:              'right',
                showZeroAsBlank:    me.showZeroAsBlank
            });
            me.aggregate.add(Ext.create('Mz.aggregate.dimension.Item', item));
        }
    },
    
    /**
    * @private
    */
    initAxis: function(leftAxis, topAxis){
        var me = this;
        
        leftAxis = Ext.Array.from(leftAxis || []);
        topAxis = Ext.Array.from(topAxis || []);
        
        Ext.destroy(me.leftAxis);
        me.leftAxis = Ext.createByAlias('pivotaxis.' + me.mztypeLeftAxis, {
            matrix:     me,
            dimensions: leftAxis,
            leftAxis:   true
        });
        
        Ext.destroy(me.topAxis);
        me.topAxis = Ext.createByAlias('pivotaxis.' + me.mztypeTopAxis, {
            matrix:     me,
            dimensions: topAxis,
            leftAxis:   false
        });
    },
    
    /**
    * This function clears any data that was previously calculated/generated.
    */
    clearData: function(){
        var me = this;
        
        me.fireEvent('cleardata', me);
        
        me.leftAxis.clear();
        me.topAxis.clear();
        me.results.clear();
        
        if(Ext.isArray(me.columns)){
            me.columns.length = 0;
        }
        
        if(Ext.isArray(me.model)){
            me.model.length = 0;
        }
        
        me.totals = [];
        
        if(me.pivotStore){
            me.pivotStore.removeAll(true);
        }
    },
    
    /**
    * Template function called when the calculation process is started.
    * This function needs to be implemented in the subclass.
    */
    startProcess: Ext.emptyFn,
    
    /**
    * Call this function after you finished your matrix processing.
    * This function will build up the pivot store and column headers.
    */
    endProcess: function(){
        var me = this,
            leftTree, topTree;
        
        leftTree = me.leftAxis.getTree();
        topTree = me.topAxis.getTree();
        
        // build pivot store model and column headers
        me.buildModelAndColumns();
        
        // build pivot store rows
        me.buildPivotStore();
        if(Ext.isFunction(me.onBuildStore)){
            me.onBuildStore(me.pivotStore);
        }
        me.fireEvent('storebuilt', me, me.pivotStore);
        
        me.fireEvent('done');
    },
    
    /**
    * Template function called after the pivot store model was created.
    * You could extend the model in a subclass if you implement this method.
    * 
    * @param {Array} model
    */
    onBuildModel: Ext.emptyFn,
    
    /**
    * Template function called after the pivot columns were created.
    * You could extend the columns in a subclass if you implement this method.
    * 
    * @param {Array} columns
    */
    onBuildColumns: Ext.emptyFn,
    
    /**
    * Template function called after a pivot store record was created.
    * You can use this to populate the record with your data.
    * 
    * @param {Ext.data.Model} record
    */
    onBuildRecord: Ext.emptyFn,
    
    /**
    * Template function called before building grand total records.
    * Use it to add additional grand totals to the pivot grid.
    * You have to push objects into the totals array with properties for each matrix.model fields.
    * For each object that you add a new record will be added to the pivot store
    * and will be styled as a grand total.
    * 
    * @param {Array} totals
    */
    onBuildTotals: Ext.emptyFn,
    
    /**
    * Template function called after the pivot store was created.
    * 
    * @param {Ext.data.ArrayStore} store
    */
    onBuildStore: Ext.emptyFn,
    
    /**
    * This function dynamically builds the model of the pivot records.
    */
    buildModelAndColumns: function(){
        var me = this;
            
        me.model = [
            {name: 'id', type: 'string'}
            //{name: 'info', type: 'object'}
        ];
        
        me.buildColumnHeaders(false);
    },
    
    /**
    * @private
    */
    buildColumnHeaders: function(disableChangeModel){
        var me = this;
        
        me.internalCounter = 0;
        me.columns = [];

        if(me.viewLayoutType == 'compact'){
            me.generateCompactLeftAxis(disableChangeModel);
        }else{
            me.leftAxis.dimensions.each(function(item){
                me.parseLeftAxisDimension(item, disableChangeModel);
            }, me);
        }
        
        if(me.colGrandTotalsPosition == 'first'){
            me.columns.push(me.parseAggregateForColumn(null, {
                text:       me.textGrandTotalTpl,
                grandTotal: true
            }, disableChangeModel));
        }
        Ext.Array.each(me.topAxis.getTree(), function(item){
            me.parseTopAxisItem(item, disableChangeModel);
        }, me);
        
        if(me.colGrandTotalsPosition == 'last'){
            me.columns.push(me.parseAggregateForColumn(null, {
                text:       me.textGrandTotalTpl,
                grandTotal: true
            }, disableChangeModel));
        }

        // call the hook functions
        if(!disableChangeModel){
            if(Ext.isFunction(me.onBuildModel)){
                me.onBuildModel(me.model);
            }
            me.fireEvent('modelbuilt', me, me.model);
        }
        if(Ext.isFunction(me.onBuildColumns)){
            me.onBuildColumns(me.columns);
        }
        me.fireEvent('columnsbuilt', me, me.columns);
    },
    
    /**
    * @private
    */
    parseLeftAxisDimension: function(dimension, disableChangeModel){
        var me = this;
        
        if(!disableChangeModel){
            me.model.push({
                name:   dimension.getId(), 
                type:   'string'
            });
        }
        me.columns.push({
            dataIndex:  dimension.getId(),
            text:       dimension.header,
            dimension:  dimension,
            leftAxis:   true
        });
    },
    
    /**
    * @private
    */
    generateCompactLeftAxis: function(disableChangeModel){
        var me = this;
        
        if(!disableChangeModel){
            me.model.push({
                name:   me.compactViewKey,
                type:   'string'
            });
        }
        me.columns.push({
            dataIndex:  me.compactViewKey,
            text:       me.textRowLabels,
            leftAxis:   true,
            width:      200
        });
    },
    
    /**
    * @private
    */
    parseTopAxisItem: function(item, disableChangeModel){
        var me = this,
            columns = [],
            retColumns = [],
            o1, o2, doAdd = false;
        
        if(!item.children){
            columns = me.parseAggregateForColumn(item, null, disableChangeModel);
            if(item.level === 0){
                me.columns.push(columns);
            }else{
                // we reached the deepest level so we can add to the model now
                return columns;
            }
        }else{
            if(me.colSubTotalsPosition == 'first'){
                o2 = me.addColSummary(item, disableChangeModel, true);
                if(o2){
                    retColumns.push(o2);
                }
            }
            
            // this part has to be done no matter if the column is added to the grid or not
            // the dataIndex is generated incrementally
            Ext.Array.each(item.children, function(child){
                var ret = me.parseTopAxisItem(child, disableChangeModel);
                
                if(Ext.isArray(ret)){
                    columns = Ext.Array.merge(columns, ret);
                }else{
                    columns.push(ret);
                }
            });

            if(item.expanded || !disableChangeModel){
                o1 = {
                    text:           item.name,
                    columns:        columns,
                    key:            item.key,
                    xcollapsible:   item.expanded,
                    xexpanded:      item.expanded,
                    xexpandable:    true
                };
                if(item.level === 0){
                    me.columns.push(o1);
                }
                retColumns.push(o1);
            }
            
            if(me.colSubTotalsPosition == 'last'){
                o2 = me.addColSummary(item, disableChangeModel, true);
                if(o2){
                    retColumns.push(o2);
                }
            }

            if(me.colSubTotalsPosition == 'none'){
                o2 = me.addColSummary(item, disableChangeModel, false);
                if(o2){
                    retColumns.push(o2);
                }
            }

            
            return retColumns;
        }
    },
    
    /**
    * @private
    */
    addColSummary: function(item, disableChangeModel, addColumns){
        var me = this,
            o2, doAdd = false;
            
        // add subtotal columns if required
        o2 = me.parseAggregateForColumn(item, {
            text:           item.expanded ? item.getTextTotal() : item.name,
            subTotal:       true
        }, disableChangeModel);

        if(addColumns){
            doAdd = true;
        }else{
            // this has to change since we want to show the totals 
            // when the column is collapsed but hide them when is expanded
            /*o2 = {
                text:           item.expanded ? item.getTextTotal() : item.name,
                dimension:      item.dimension,
                subTotal:       true
            };*/
            doAdd = !item.expanded;
        }
        
        if(doAdd){
            if(item.level === 0){
                me.columns.push(o2);
            }
            
            Ext.apply(o2, {
                key:            item.key,
                xcollapsible:   !item.expanded,
                xexpanded:      item.expanded,
                xexpandable:    !item.expanded
            });
            return o2;
        }
    },
    
    /**
    * @private
    */
    parseAggregateForColumn: function(item, config, disableChangeModel){
        var me = this,
            columns = [],
            column = {};
        
        me.aggregate.each(function(agg){
            me.internalCounter++;
            if(!disableChangeModel){
                me.model.push({
                    name:           'c' + me.internalCounter, 
                    type:           'auto',
                    defaultValue:   undefined,
                    useNull:        true,
                    col:            item ? item.key : me.grandTotalKey,
                    agg:            agg.getId()
                });
            }

            columns.push({
                dataIndex:  'c' + me.internalCounter,
                text:       agg.header,
                topAxis:    true,   // generated based on the top axis
                subTotal:   (config ? config.subTotal === true : false),
                grandTotal: (config ? config.grandTotal === true : false),
                dimension:  agg
            });
        });

        if(columns.length == 0 && me.aggregate.getCount() == 0){
            me.internalCounter++;
            column = Ext.apply({
                text:       item ? item.name : '',
                dataIndex:  'c' + me.internalCounter
            }, config || {});
        }else if(columns.length == 1){
            column = Ext.applyIf({
                text:   item ? item.name : ''
            }, columns[0]);
            Ext.apply(column, config || {});
            // if there is only one aggregate available then don't show the grand total text
            // use the aggregate header instead.
            if(config && config.grandTotal && me.aggregate.getCount() == 1){
                column.text = me.aggregate.getAt(0).header || config.text;
            }
        }else{
            column = Ext.apply({
                text:       item ? item.name : '',
                columns:    columns
            }, config || {});
        }
        return column;
    },
    
    /**
    * @private
    */
    buildPivotStore: function(){
        var me = this;
        
        if(Ext.isFunction(me.pivotStore.model.setFields)){
            me.pivotStore.model.setFields(me.model);
        }else{
            // ExtJS 5 has no "setFields" anymore so fallback to "replaceFields"
            me.pivotStore.model.replaceFields(me.model, true);
        }
        me.pivotStore.removeAll(true);

        Ext.Array.each(me.leftAxis.getTree(), me.addRecordToPivotStore, me);
        me.addGrandTotalsToPivotStore();
    },
    
    /**
    * @private
    */
    addGrandTotalsToPivotStore: function(){
        var me = this,
            totals = [];
            
        // first of all add the grand total
        totals.push({
            title:      me.textGrandTotalTpl,
            values:     me.preparePivotStoreRecordData({key: me.grandTotalKey})
        });
        
        // additional grand totals can be added. collect these using events or 
        if(Ext.isFunction(me.onBuildTotals)){
            me.onBuildTotals(totals);
        }
        me.fireEvent('buildtotals', me, totals);
        
        // add records to the pivot store for each grand total
        Ext.Array.forEach(totals, function(t){
            if(Ext.isObject(t) && Ext.isObject(t.values)){
                //t.values.id = '';
                me.totals.push({
                    title:      t.title || '',
                    record:     me.pivotStore.add(t.values)[0]
                });
            }
        });
    },
    
    /**
    * @private
    */
    addRecordToPivotStore: function(item){
        var me = this,
            record;
        
        if(!item.children){
            // we are on the deepest level so it's time to build the record and add it to the store
            record = me.pivotStore.add(me.preparePivotStoreRecordData(item));
            item.record = record[0];
            // this should be moved into the function "preparePivotStoreRecordData"
            if(Ext.isFunction(me.onBuildRecord)){
                me.onBuildRecord(record[0]);
            }
            me.fireEvent('recordbuilt', me, record[0]);
        }else{
            Ext.Array.each(item.children, function(child){
                me.addRecordToPivotStore(child);
            });
        }
    },
    
    /**
    * Create an object using the pivot model and data of an axis item.
    * This object is used to create a record in the pivot store.
    */
    preparePivotStoreRecordData: function(group){
        var me = this,
            data = {};
        
        data['id'] = group.key;
        Ext.apply(data, group.data || {}); // merge the left axis data
        
        Ext.Array.each(me.model, function(field){
            var result;
            
            if(field.col && field.agg){
                result = me.results.get(group.key, field.col);
                if(result){
                    data[field.name] = result.getValue(field.agg);
                }
            }
        });
        
        if(me.viewLayoutType == 'compact'){
            data[me.compactViewKey] = group.name;
        }
        
        // @TODO this function is used intensively in the pivot grid when the pivot grid store is generated
        // there is a need for a "recordbuild" event so that the developer can add
        // additional data to the record that will be added to the pivot store.
        // the matrix should fire "recordbuild" and the pivot grid should relay that event
        
        return data;
    },
    
    /**
    * Returns the generated model fields
    * 
    * @returns Array
    */
    getColumns: function(){
        return this.model;
    },
    
    /**
    * Returns all generated column headers
    * 
    * @returns Array
    */
    getColumnHeaders: function(){
        var me = this;
        
        if(!me.model){
            me.buildModelAndColumns();
        }else{
            me.buildColumnHeaders(true);
        }
        return me.columns;
    },
    
    /**
    *    Find out if the specified key belongs to a row group.
    *    Returns FALSE if the key is not found.
    *    Returns 0 if the current key doesn't belong to a group. That means that group children items will always be 0.
    *    If it'a a group then it returns the level number which is always > 0.
    * 
    * @param {String} key
    */
    isGroupRow: function(key) {
        var obj = this.leftAxis.findTreeElement('key', key);
        if(!obj) return false;
        return (obj['node']['children'] && obj['node']['children'].length == 0) ? 0 : obj['level'];
    },
    
    /**
    *    Find out if the specified key belongs to a col group.
    *    Returns FALSE if the key is not found.
    *    Returns 0 if the current key doesn't belong to a group. That means that group children items will always be 0.
    *    If it'a a group then it returns the level number which is always > 0.
    * 
    * @param {String} key
    */
    isGroupCol: function(key) {
        var obj = this.topAxis.findTreeElement('key', key);
        if(!obj) return false;
        return (obj['node']['children'] && obj['node']['children'].length == 0) ? 0 : obj['level'];
    }

    
    
    
});