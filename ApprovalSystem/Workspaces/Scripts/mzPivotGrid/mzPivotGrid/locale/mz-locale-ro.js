/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/


Ext.define('Mz.locale.ro.pivot.Grid', {
    override: 'Mz.pivot.Grid',
    
    textTotalTpl:       'Subtotal ({name})',
    textGrandTotalTpl:  'Total general'
});

Ext.define('Mz.locale.ro.pivot.plugin.configurator.Panel', {
    override: 'Mz.pivot.plugin.configurator.Panel',
    
    panelAllFieldsText:     'Trage aici campurile nefolosite',
    panelTopFieldsText:     'Trage aici campurile pt coloane',
    panelLeftFieldsText:    'Trage aici campurile pt linii',
    panelAggFieldsText:     'Trage aici campurile de calculat'

});

Ext.define('Mz.locale.ro.pivot.plugin.configurator.Column', {
    override: 'Mz.pivot.plugin.configurator.Column',
    
    sumText:                    'Suma',
    avgText:                    'Media',
    countText:                  'Nr. de inregistrari',
    minText:                    'Minim',
    maxText:                    'Maxim',
    groupSumPercentageText:     '% din suma grupului',
    groupCountPercentageText:   '% din nr. de inregistrari al grupului',

    sortAscText:                'Sorteaza alfabetic',
    sortDescText:               'Sorteaza invers alfabetic',
    sortClearText:              'Dezactiveaza sortarea',
    clearFilterText:            'Sterge filtrul pentru "{0}"',
    labelFiltersText:           'Filtre pentru etichete',
    valueFiltersText:           'Filtre pentru valori',
    equalsText:                 'Egal cu...',
    doesNotEqualText:           'Nu este egal cu...',
    beginsWithText:             'Incepe cu...',
    doesNotBeginWithText:       'Nu incepe cu...',
    endsWithText:               'Se termina in...',
    doesNotEndWithText:         'Nu se termina in...',
    containsText:               'Contine...',
    doesNotContainText:         'Nu contine...',
    greaterThanText:            'Mai mare ca...',
    greaterThanOrEqualToText:   'Mai mare sau egal cu...',
    lessThanText:               'Mai mic ca...',
    lessThanOrEqualToText:      'Mai mic sau egal cu...',
    betweenText:                'In intervalul...',
    notBetweenText:             'In afara intervalului...',
    top10Text:                  'Top 10...',

    equalsLText:                'egal cu',
    doesNotEqualLText:          'nu este egal cu',
    beginsWithLText:            'incepe cu',
    doesNotBeginWithLText:      'nu incepe cu',
    endsWithLText:              'se termina in',
    doesNotEndWithLText:        'nu se termina in',
    containsLText:              'contine',
    doesNotContainLText:        'nu contine',
    greaterThanLText:           'este mai mare ca',
    greaterThanOrEqualToLText:  'este mai mare sau egal cu',
    lessThanLText:              'este mai mic',
    lessThanOrEqualToLText:     'este mai mic sau egal cu',
    betweenLText:               'este in intervalul',
    notBetweenLText:            'nu este in intervalul',
    top10LText:                 'Top 10...',
    topOrderTopText:            'La inceput',
    topOrderBottomText:         'La sfarsit',
    topTypeItemsText:           'Inregistrari',
    topTypePercentText:         'Procent',
    topTypeSumText:             'Suma'

});

Ext.define('Mz.locale.ro.pivot.plugin.configurator.FilterTopWindow',{
    titleText:      'Filtru Top 10 ({0})',
    fieldText:      'Arata',
    sortResultsText:'Sorteaza rezultatele'
});

Ext.define('Mz.locale.ro.pivot.plugin.configurator.FilterLabelWindow',{
    titleText:          'Filtreaza etichetele ({0})',
    fieldText:          'Arata inregistrarile pt care eticheta',
    caseSensitiveText:  'Cautare exacta'
});

Ext.define('Mz.locale.ro.pivot.plugin.configurator.FilterValueWindow',{
    titleText:      'Filtreaza valorile ({0})',
    fieldText:      'Arata inregistrarile pt care'
});

Ext.define('Mz.locale.ro.pivot.plugin.RangeEditor', {
    override: 'Mz.pivot.plugin.RangeEditor',
    
    textWindowTitle:    'Modifica inregistrarile',
    textFieldValue:     'Valoare',
    textFieldEdit:      'Campul editat',
    textFieldType:      'Tip de editare',
    textButtonOk:       'Ok',
    textButtonCancel:   'Anuleaza',
    textTypePercentage: 'Procent',
    textTypeIncrement:  'Incrementeaza',
    textTypeOverwrite:  'Suprascrie',
    textTypeUniformly:  'Uniform'
});
