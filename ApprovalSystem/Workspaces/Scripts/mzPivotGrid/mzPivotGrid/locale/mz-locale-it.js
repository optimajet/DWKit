/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/


/**
* Italian translation by Federico Anzini
* 
*/

Ext.define('Mz.locale.it.pivot.Grid', {
    override: 'Mz.pivot.Grid',
    
    textTotalTpl:       'Totale ({name})',
    textGrandTotalTpl:  'Totale globale'
});

Ext.define('Mz.locale.it.pivot.plugin.configurator.Panel', {
    override: 'Mz.pivot.plugin.configurator.Panel',
    
    panelAllFieldsText:     'Inserisci i campi inutilizzati qui',
    panelTopFieldsText:     'Inserisci i campi colonna qui',
    panelLeftFieldsText:    'Inserisci i campi riga qui',
    panelAggFieldsText:     'Inserisci i campi aggregati qui'

});

Ext.define('Mz.locale.it.pivot.plugin.configurator.Column', {
    override: 'Mz.pivot.plugin.configurator.Column',
    
    sumText:                    'Somma',
    avgText:                    'Media',
    countText:                  'Conteggio',
    minText:                    'Minimo',
    maxText:                    'Massimo',
    groupSumPercentageText:     'Gruppo somma percentuale',
    groupCountPercentageText:   'Gruppo conteggio percentuale',
    
    sortAscText:                'Ordinamento A to Z',
    sortDescText:               'Ordinamento Z to A',
    sortClearText:              'Ordinamento disabilitato',
    clearFilterText:            'Cancella filtro da "{0}"',
    labelFiltersText:           'Etichetta filtro',
    valueFiltersText:           'Valore filtro',
    equalsText:                 'Uguale...',
    doesNotEqualText:           'Non uquale...',
    beginsWithText:             'Inizia con...',
    doesNotBeginWithText:       'Non inizia con...',
    endsWithText:               'Termina con...',
    doesNotEndWithText:         'Non termina con...',
    containsText:               'Contiene...',
    doesNotContainText:         'Non contiene...',
    greaterThanText:            'Più grande di...',
    greaterThanOrEqualToText:   'Più grande o uguale a...',
    lessThanText:               'Più piccolo di...',
    lessThanOrEqualToText:      'Più piccolo o uguale a...',
    betweenText:                'Compreso tra...',
    notBetweenText:             'Non compreso tra...',
    top10Text:                  'Top 10...',

    equalsLText:                'uguale a',
    doesNotEqualLText:          'non uguale a',
    beginsWithLText:            'inizia con',
    doesNotBeginWithLText:      'non inizia con',
    endsWithLText:              'termina con',
    doesNotEndWithLText:        'non termina con',
    containsLText:              'contiene',
    doesNotContainLText:        'non contiene',
    greaterThanLText:           'è più grande di',
    greaterThanOrEqualToLText:  'è più grande o uguale a',
    lessThanLText:              'è più piccolo di',
    lessThanOrEqualToLText:     'è più piccolo o uguale a',
    betweenLText:               'è compreso tra',
    notBetweenLText:            'non è compreso tra',
    top10LText:                 'Top 10...',
    topOrderTopText:            'Sopra',
    topOrderBottomText:         'Sotto',
    topTypeItemsText:           'Elementi',
    topTypePercentText:         'Percentuale',
    topTypeSumText:             'Somma'

});

Ext.define('Mz.locale.it.pivot.plugin.configurator.FilterTopWindow',{
    titleText:      'Filtro Top 10 ({0})',
    fieldText:      'Visualizza',
    sortResultsText:'Ordina i risultati'
});

Ext.define('Mz.locale.it.pivot.plugin.configurator.FilterLabelWindow',{
    titleText:          'Etichetta filtro ({0})',
    fieldText:          'Visualizza elementi per i quali l\'etichetta',
    caseSensitiveText:  'Sensibile alle maiuscole'
});

Ext.define('Mz.locale.it.pivot.plugin.configurator.FilterValueWindow',{
    titleText:      'Valore filtro ({0})',
    fieldText:      'Visualizza elementi per i quali'
});

Ext.define('Mz.locale.it.pivot.plugin.RangeEditor', {
    override: 'Mz.pivot.plugin.RangeEditor',
    
    textWindowTitle:    'Modifica intervallo',
    textFieldValue:     'Valore',
    textFieldEdit:      'Campo',
    textFieldType:      'Tipo',
    textButtonOk:       'Ok',
    textButtonCancel:   'Cancella',
    textTypePercentage: 'Percentuale',
    textTypeIncrement:  'Incremento',
    textTypeOverwrite:  'Sovrascrivere',
    textTypeUniformly:  'Uniformare'
    
});
