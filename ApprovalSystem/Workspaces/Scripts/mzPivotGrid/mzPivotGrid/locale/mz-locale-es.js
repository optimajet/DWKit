/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/


/**
* Spanish translation by Gustavo Ruiz
* The original translation was done for version 2.x.
*
*/

Ext.define('Mz.locale.es.pivot.Grid', {
    override: 'Mz.pivot.Grid',
    
    textTotalTpl:       'Total ({name})',
    textGrandTotalTpl:  'Total General'
});

Ext.define('Mz.locale.es.pivot.plugin.configurator.Panel', {
    override: 'Mz.pivot.plugin.configurator.Panel',
    
    panelAllFieldsText:     'Coloque los Campos no utilizados aquí',
    panelTopFieldsText:     'Coloque las Columnas aquí',
    panelLeftFieldsText:    'Coloque las Filas aquí',
    panelAggFieldsText:     'Coloque los Campos Acumulados aquí'

});

Ext.define('Mz.locale.es.pivot.plugin.configurator.Column', {
    override: 'Mz.pivot.plugin.configurator.Column',
    
    sumText:                    'Suma',
    avgText:                    'Prom',
    countText:                  'Cont',
    minText:                    'Min',
    maxText:                    'Max',
    groupSumPercentageText:     'Grupo % suma',
    groupCountPercentageText:   'Grupo % cont',

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
    topTypeSumText:             'Sum'
    
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterTopWindow',{
    titleText:      'Top 10 filter ({0})',
    fieldText:      'Show',
    sortResultsText:'Sort results'
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterLabelWindow',{
    titleText:          'Label filter ({0})',
    fieldText:          'Show items for which the label',
    caseSensitiveText:  'Case sensitive'
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterValueWindow',{
    titleText:      'Value filter ({0})',
    fieldText:      'Show items for which'
});

Ext.define('Mz.locale.es.pivot.plugin.RangeEditor', {
    override: 'Mz.pivot.plugin.RangeEditor',
    
    textWindowTitle:    'Range editor',
    textFieldValue:     'Valor',
    textFieldEdit:      'Campo',
    textFieldType:      'Tipo',
    textButtonOk:       'Aceptar',
    textButtonCancel:   'Cancelar',
    textTypePercentage: 'Porcentaje',
    textTypeIncrement:  'Incremento',
    textTypeOverwrite:  'Sobreescribe',
    textTypeUniformly:  'Uniformemente'
    
});
