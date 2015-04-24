Ext.onReady(function () {

    Ext.define("Ext.locale.ru.form.Template", {
        override: "IIG.form.Template",
        nameLabelText: 'Наименование',
        globalLabelText: 'Общий',
        authorLabelText: 'Автор',
        changedByLabelText: 'Изменил',
        changeDateLabelText: 'Дата изменения',
    });

    Ext.define("Ext.locale.ru.window.SaveConfiguration", {
        override: "IIG.window.SaveConfiguration",
        msgSystemMessageText: 'Сообщение системы',
        msgEnterTemplateNameText: 'Введите наименование шаблона',
        saveBtnText: 'Сохранить',
        cancelBtnText: 'Отмена',
    });

    Ext.define("IIG.form.field.TemplateComboBox", {
        override: "IIG.window.SaveConfiguration",
        emptyText: 'Выберите шаблон',
        fieldLabel: 'Шаблон',
    });

    Ext.define('Ext.locale.ru.IIG.Texts', {
        override: 'IIG.Texts',

        systemMessage: "Сообщение системы",
        loadData: "Загрузить данные",
        templateOperations: "Операции с шаблонами",
        waitLoading: "Подождите, идёт загрузка",
        selectFieldsToProcessReport: "Укажите колонки для обработки отчёта",
        doYouRealyWantDelete: "Вы точно хотите удалить шаблон",
        selectTemplate: "Выберите шаблон",
        generateReport: "Сформировать отчёт",
        createTemplate: "Создать шаблон",
        editTemplate: "Изменить шаблон",
        deleteTemplate: "Удалить шаблон",
        selectVersions: 'Версии бюджета',
        resetReportGenerationStatus: 'Сбросить статус формирования отчета',
        export: "Экспорт",
    });

    Ext.define("Ext.locale.ru.window.SelectBudgetVersions", {
        override: "IIG.window.SelectBudgetVersions",

        title: 'Выбор версий бюджета',
    });
    

    Ext.define("Ext.locale.ru.form.BudgetVersions", {
        override: "IIG.form.BudgetVersions",

        budgetText: 'Бюджет',
        budgetVersion1Text: 'Версия 1',
        budgetVersion2Text: 'Версия 2',
        msgSameBudgetVersions: 'Выбраны одинаковые версии бюджетов. Выберите другую версию',
        msgBudgetVersionRequired: 'Поле не может быть пустым'
    });

    Ext.define("Ext.locale.ru.pivot.plugin.Configurator", {
        override: "IIG.pivot.plugin.Configurator",

        title: 'Конфигурация Отчета',
    });

    Ext.define('Ext.locale.ru.dimension.Item', {
        override: 'Mz.aggregate.dimension.Item',

        blankText: '(пусто)'
    });

    Ext.define('Ext.locale.ru.plugin.DrillDown', {
        override: 'Mz.pivot.plugin.DrillDown',

        textWindow: 'Детализация данных'
    });

    Ext.define('Ext.locale.ru.pivot.plugin.configurator.Column', {
        override: 'Mz.pivot.plugin.configurator.Column',

        diffText: 'Показать разницу'
    });

    Ext.define('Ext.locale.ru.aggregate.matrix.Abstract', {
        override: 'Mz.aggregate.matrix.Abstract',

        diffText: 'Разница'
    });

    Ext.define('IIG.ru.PivotGrid', {
        override: 'IIG.PivotGrid',

        dataIsNotRelevantMessageText: 'Данные не актуальны. Вы можете продолжить настройку полей или перзагрузите данные',
        loadButtonText: 'Обновить'
    });
});