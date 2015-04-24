Ext.define('Ext.ux.optimajet.NumberPercentFieldEx', {
    extend: 'Ext.ux.optimajet.NumberFieldEx',
    alias: 'widget.numberpercentfieldex',
    currencySymbol: '%',
    currencySymbolPos: 'right',
    useThousandSeparator: false,
    alwaysDisplayDecimals: false,
    fieldStyle: 'text-align: right;',
    hideTrigger: true,
    keyNavEnabled: false,
    mouseWheelEnabled: false,
    maxValue: 100,
    minValue: 0,
    decimalSeparator: Ext.util.Format.decimalSeparator
});