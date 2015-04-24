/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/


/**
* Portuguese (Brasil) translation by Rivaldo C Carvalho.
* 
*/

Ext.define('Mz.locale.pt_br.pivot.Grid', {
    override: 'Mz.pivot.Grid',
    
    textTotalTpl:       'Total ({name})',
    textGrandTotalTpl:  'Total Geral'
});

Ext.define('Mz.locale.pt_br.pivot.plugin.configurator.Panel', {
    override: 'Mz.pivot.plugin.configurator.Panel',
    
    panelAllFieldsText:     'Deixe aqui os Campos não utilizados',
    panelTopFieldsText:     'Deixe aqui os Campos das Colunas',
    panelLeftFieldsText:    'Deixe aqui os Campos das Linhas',
    panelAggFieldsText:     'Deixe aqui os Campos de Valores'

});

Ext.define('Mz.locale.pt_br.pivot.plugin.configurator.Column', {
    override: 'Mz.pivot.plugin.configurator.Column',
    
    sumText:                    'Soma',
    avgText:                    'Média',
    countText:                  'Contagem',
    minText:                    'Min',
    maxText:                    'Max',
    groupSumPercentageText:     'Grupo percentual Soma',
    groupCountPercentageText:   'Grupo percentual Contagem',
    
    sortAscText:                'Classificar A to Z',
    sortDescText:               'Classificar Z to A',
    sortClearText:              'Desabilita Classificação',
    clearFilterText:            'Limpar Filtro de "{0}"',
    labelFiltersText:           'Filtra Rótulo',
    valueFiltersText:           'Filtra Valor',
    equalsText:                 'Igual...',
    doesNotEqualText:           'Não é Igual...',
    beginsWithText:             'Começa com...',
    doesNotBeginWithText:       'Não começa com...',
    endsWithText:               'Termina com...',
    doesNotEndWithText:         'Não termina com...',
    containsText:               'Contém...',
    doesNotContainText:         'Não Contém...',
    greaterThanText:            'Maior que...',
    greaterThanOrEqualToText:   'Maior ou igual a...',
    lessThanText:               'Menor que...',
    lessThanOrEqualToText:      'Menor ou igual a...',
    betweenText:                'Entre...',
    notBetweenText:             'Não entre...',
    top10Text:                  'Top 10...',

    equalsLText:                'igual',
    doesNotEqualLText:          'não é igual',
    beginsWithLText:            'começa com',
    doesNotBeginWithLText:      'não começa com',
    endsWithLText:              'termina com',
    doesNotEndWithLText:        'não termina com',
    containsLText:              'contém',
    doesNotContainLText:        'não contem',
    greaterThanLText:           'é maior que',
    greaterThanOrEqualToLText:  'é maior ou igual a',
    lessThanLText:              'é menor que',
    lessThanOrEqualToLText:     'é menor ou igual a',
    betweenLText:               'está entre',
    notBetweenLText:            'não esta entre',
    top10LText:                 'Top 10...',
    topOrderTopText:            'Para cima',
    topOrderBottomText:         'Para baixo',
    topTypeItemsText:           'Items',
    topTypePercentText:         'Percentual',
    topTypeSumText:             'Soma'

});

Ext.define('Mz.locale.pt_br.pivot.plugin.configurator.FilterTopWindow',{
    override:       'Mz.pivot.plugin.configurator.FilterTopWindow',
    titleText:      'Filtra top 10 ({0})',
    fieldText:      'Mostrar',
    sortResultsText:'Ordenar os resultados'
});

Ext.define('Mz.locale.pt_br.pivot.plugin.configurator.FilterLabelWindow',{
    override:           'Mz.pivot.plugin.configurator.FilterLabelWindow',
    titleText:          'Filtra Rótulo ({0})',
    fieldText:          'Mostrar itens para os quais o rótulo é',
    caseSensitiveText:  'Maíúscula e minúscula'
});

Ext.define('Mz.locale.pt_br.pivot.plugin.configurator.FilterValueWindow',{
    override:       'Mz.pivot.plugin.configurator.FilterValueWindow',
    titleText:      'Filtra valor ({0})',
    fieldText:      'Mostrar itens para os quais o valor é'
});

Ext.define('Mz.locale.pt_br.pivot.plugin.RangeEditor', {
    override: 'Mz.pivot.plugin.RangeEditor',
    
    textWindowTitle:    'Range editor',
    textFieldValue:     'Valor',
    textFieldEdit:      'Campo',
    textFieldType:      'Tipo',
    textButtonOk:       'Ok',
    textButtonCancel:   'Cancela',
    textTypePercentage: 'Percentual',
    textTypeIncrement:  'Incrementar',
    textTypeOverwrite:  'Sobrescrever',
    textTypeUniformly:  'Uniformemente'
    
});
