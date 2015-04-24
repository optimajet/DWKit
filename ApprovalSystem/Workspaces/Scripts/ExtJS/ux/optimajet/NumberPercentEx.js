Ext.define('Ext.ux.optimajet.NumberPercentEx', {
    extend: 'Ext.grid.column.Number',
    alias: 'widget.numberpercentcolumnex',
    align: 'right',
    decimalSeparator: Ext.util.Format.decimalSeparator
    //renderer: function (v) {
    //    return (parseFloat(v) * 100.0) + '%';
    //}
});
