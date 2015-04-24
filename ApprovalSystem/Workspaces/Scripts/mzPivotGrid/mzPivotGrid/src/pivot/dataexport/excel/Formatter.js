/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
*   The excel formatter is a modified version of Ext.ux.Formatter (https://github.com/edspencer/Ext.ux.Exporter).
*/
Ext.define('Mz.pivot.dataexport.excel.Formatter', {
    extend: 'Mz.pivot.dataexport.Formatter',

    requires: [
        'Mz.pivot.dataexport.excel.Workbook'
    ],

    format: function () {
        var me = this,
            workbook = Ext.create('Mz.pivot.dataexport.excel.Workbook', me.config || {});
            
        workbook.addWorksheet(me.data, me.config || {});

        return workbook.render();
    }
});