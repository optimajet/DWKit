/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
*   Class used to create an Excel cell
*/
Ext.define('Mz.pivot.dataexport.excel.Cell', {
    constructor: function (config) {
        Ext.applyIf(config, {
            type:   "String",
            style:  'Default'
        });

        Ext.apply(this, config);
    },

    render: function () {
        return this.tpl.apply(this);
    },

    tpl: new Ext.XTemplate(
        '<ss:Cell ss:MergeAcross="{merge}" <tpl if="style">ss:StyleID="{style}"</tpl>>',
            '<ss:Data ss:Type="{type}">',
                '<tpl switch="type">',
                    '<tpl case="String">',
                        '{[this.formatString(values.value)]}',
                    '<tpl default>',
                        '{value}',
                '</tpl>',
            '</ss:Data>',
        '</ss:Cell>', {
            formatString: Ext.String.htmlEncode
        }
    )
});