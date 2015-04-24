
function BudgetSync(budgets,currentBudgetName) {

    this.budgets = budgets;

    this.currentBudgetName = currentBudgetName,

    this.window = undefined;

    this.width = 300;

    this.form = {};

    this.sync = function(formname,ids,showresultfunc,useversions) {

        if (budgets.length < 2)
            return;

        var items = new Array();

        for (var i = 0; i < budgets.length; i++) {
            if (budgets[i].name != this.currentBudgetName)
                items.push({ boxLabel: budgets[i].name, inputValue: budgets[i].id, checked: budgets[i].name > this.currentBudgetName });
        }

            var height = Math.ceil(items.length / 3) * 100 + 50;

            var me = this;

           this.form = Ext.create('Ext.form.Panel', {
                width: this.width,
                height: height,
                collapsible: false,
                bodyPadding: '5 5 0',
                items: [
                    {
                        xtype: 'label',
                        text: optimajet.localization.get('Select budgets for synchronization'),
                    },
                    {
                        xtype: 'checkboxgroup',
                        columns: 3,
                        vertical: true,
                        items: items
                    }
                ],
                buttons: [
                    {
                        text: optimajet.localization.get('Sync'),
                        handler: function () {
                            var budgetids = new Array();
                            var cbs = me.form.items.items[1].items.items;
                            for (var j = 0; j < cbs.length; j++) {
                                if (cbs[j].checked)
                                    budgetids.push(cbs[j].inputValue);
                            }
                            if (budgetids.length < 1) {
                                me.window.close();
                                return;
                            } 
                            var res = optimajet.GetBusinessObject('BudgetSync', [{ name: 'formName', value: formname }, { name: 'ids', value: ids }, { name: 'budgetIds', value: budgetids }, { name: 'useVersions', value: useversions }]);
                            if (showresultfunc != undefined)
                                showresultfunc(res);
                            
                            me.window.close();
                        }
                    },
                     {
                         text: 'Закрыть',
                         handler: function() {
                             me.window.close();
                         }
                     }
                ]
            });

      
           var popupSettings = getPopupConfig(this.width, height, 'budgetsyncwindow', "popup-edit", null, optimajet.localization.get('Dictionary synchronization'));
            popupSettings.closeAction = 'hide';
            popupSettings.items = [this.form];

            this.window = Ext.create('Ext.window.Window',
                popupSettings
            );

        this.window.show();
        this.window.items.first().setSize();
    }
}

optimajet.original_setTitle = optimajet.setTitle;
optimajet.setTitle = function (title) {
    var extraParam = optimajet.getParameterByNameInHash('extra');
    if (extraParam != undefined && extraParam != '') {
        var extraObj = JSON.parse(extraParam);
        if (extraObj != undefined && extraObj.type != undefined) {
            if (extraObj.type == 'inbox') {
                title += " : " + optimajet.localization.get('Inbox');
            }
            else if (extraObj.type == 'processed') {
                title += " : " + optimajet.localization.get('Processed');
            }
            else if (extraObj.type == 'my') {
                title += " : " + optimajet.localization.get('My');
            }
        }
    }

    optimajet.original_setTitle(title);

    if ($('#MainPageTitleDiv').length > 0) {
        $('#MainPageTitleDiv')[0].innerHTML = title;
    }
}

if (optimajet.budget == undefined) {
    optimajet.budget = new Object();
}

optimajet.budget.getYear = function () {
    return $('#cbCurrentBudget')[0].value;
}

optimajet.budget.ExistsBudget = function (name) {
    var isFind = false;
    $('#cbCurrentBudget option').each(function () { if (this.value == name) isFind = true; });
    return isFind;
}

if (optimajet.budget.const == undefined) {
    optimajet.budget.const = new Object();
}

var workflow = {
    ShowMultiFormForCommands: function (ids, addparams, afterexec, processName) {
        var me = this;
        ids = ids.join(',');

        optimajet.WaitSaveDialogShow(optimajet.localization.get('Getting the list of available command, please wait') + '...');

        var url = optimajet.CorrectUrl('WF/MultiGetCommand');

        var data = {
            ids: ids,
            processName: processName
        };

        var success = function(data, textStatus, jqXHR) {
            optimajet.WaitSaveDialogHide();
            var resp = JSON.parse(data);
            if (resp.success)
                me.showwindow(resp.values, addparams, resp.routes, afterexec);
            else
                ojControls.GenerateErrorBlock(resp.message).appendTo('#formMainErrors');
        };


        $.ajax({
            type: "GET",
            url: url,
            data: data,
            success: success
        });
    },

    ShowMultiFormForStates: function (ids, afterexec, processName) {
        var me = this;
        ids = ids.join(',');

        optimajet.WaitSaveDialogShow(optimajet.localization.get('Getting the list of available states, please wait') + '...');

        var url = optimajet.CorrectUrl('WF/MultiGetState');

        var data = {
            ids: ids,
            processName: processName
        };

        var success = function (data, textStatus, jqXHR) {
            optimajet.WaitSaveDialogHide();
            var resp = JSON.parse(data);
            if (resp.success)
                me.showwindowforstates(resp.values, afterexec, processName);
            else
                ojControls.GenerateErrorBlock(resp.message).appendTo('#formMainErrors');
        };


        $.ajax({
            type: "GET",
            url: url,
            data: data,
            success: success
        });
    },
    showwindowforstates: function (values, afterexec, processName) {
        if (values == undefined || values.length < 1)
            return;
        var me = this;
        var window = new Ext.window.Window({
            resizable: true,
            modal: true,
            width: 500,
            height: values.length * 60 + 100,
            title: optimajet.localization.get('MultiWorkflow'),
            items: [
                {
                    html: '<table id="multiworkflowbuttons" class="table no-more-tables"><thead><tr><th style="width:40%">'
                        + optimajet.localization.get('Numbers')
                        + '</th><th style="width:40%">'
                        + optimajet.localization.get('Route')
                        + '</th><th style="width:20%">'
                        + optimajet.localization.get('States')
                        + '</th></tr></thead><tbody></tbody></table>',
                    xtype: "panel"
                }
            ]
        });
        //???
        window.on('close', function () {
            for (var j = me.commandandpopups.length - 1; j >= 0; j--) {
                me.commandandpopups[j].value.destroy();
            }
            me.commandandpopups = new Array();
        });

        window.show();

        for (var i = 0; i < values.length; i++) {
            var states = JSON.parse(values[i].states);
            var ids = values[i].ids;
            var routeId = values[i].routeid;
            var routeName = values[i].routename;
            var numbers = values[i].numbers;

            var listhtml = '<select id="' + routeId + '" class="btn btn-white " style="width:150px" ><option value="#">' + optimajet.localization.get('Select state') + '</option>';
            for (var j = 0; j < states.length; j++) {
               listhtml += '<option value="' + states[j].name + '">' + states[j].text + '</option>';
            }
            listhtml += '</select>';
           
            var tr = '<tr><td><div style="height: 50px;overflow-y: auto;">' + numbers + '</div></td><td class="v-align-middle"><div style="height: 50px;overflow-y: auto;">' + routeName + '</td><td class="v-align-middle">' + listhtml + '</td></tr>';
            var lasttr = $('table#multiworkflowbuttons>tbody>tr:last');
            if (lasttr.length > 0)
                $('table#multiworkflowbuttons>tbody>tr:last').after(tr);
            else
                $('table#multiworkflowbuttons>tbody').append(tr);

           var height = 185;

            var panel = Ext.create('Ext.form.Panel',
                {
                    layout: 'form',
                    collapsible: false,
                    id: routeId + 'form',
                    frame: false,
                    items: [
                       {
                           fieldLabel: optimajet.localization.get('Comment'),
                           name: 'Comment',
                           allowBlank: false,
                           xtype: 'textarea',
                           height: 150
                       }
                    ],
                    bodyPadding: '5 5 0',
                    buttons: [
                        {
                            text: optimajet.localization.get('Set'),
                            handler: function() {
                                var form = this.up('form').getForm();

                                if (!form.isValid())
                                    return;

                                var commandName = this.up('form').commandName;
                                var pop = me.findpopup(commandName);
                                var record = form.getFieldValues();
                                var data = {
                                    ids: this.up('form').ids,
                                    processName: processName,
                                    stateName: pop.stateName,
                                    parameters: JSON.stringify(record)
                                };

                                window.close();
                                pop.close();
                                me.sendcommandandshowresult(data, afterexec,true);
                            }

                        }, {
                            text: optimajet.localization.get('Cancel'),
                            handler: function () {
                                var p = me.findpopup(this.up('form').commandName);
                                p.close();
                            }
                        }
                    ]
                }
            );

            panel.commandName = routeId;
            panel.ids = ids;
            
            var popupSettings = getPopupConfig(500, height + 50, routeId + 'window', "popup-edit", null, routeName);
            popupSettings.closeAction = 'hide';
            popupSettings.items = [panel];

            var popup = Ext.create('Ext.window.Window',
                popupSettings
            );

            

            me.commandandpopups.push({ key: routeId, value: popup });

            var select = $('select#' + routeId);
            select.on('change', function () {
                var sv = this.options[this.selectedIndex].value;
                if (sv == '#')
                    return;
                var pop = me.findpopup(this.id);
                pop.stateName = sv;
                pop.show();
                this.selectedIndex = 0;
            });
        }

        window.setSize(500, values.length * 60 + 100);
    },

    showwindow: function (values, addparams, routes, afterexec) {
        if (values == undefined || values.length < 1)
            return;
        var me = this;
        var window = new Ext.window.Window({
            resizable: true,
            modal: true,
            width: 500,
            height : values.length * 60 + 100,
            title: optimajet.localization.get('MultiWorkflow'),
            items: [
                {
                    // html: "<div id='multiworkflowbuttons'></div>",
                    html: '<table id="multiworkflowbuttons" class="table no-more-tables"><thead><tr><th style="width:70%">' + optimajet.localization.get('Numbers') + '</th><th style="width:30%">' + optimajet.localization.get('Command') + '</th></tr></thead><tbody></tbody></table>',
                    xtype: "panel"
                }
            ]
        });
        window.on('close', function() {
            for (var j = me.commandandpopups.length - 1; j >= 0; j--) {
                me.commandandpopups[j].value.destroy();
            }
            me.commandandpopups = new Array();
        });

        window.show();

       for (var i = 0; i < values.length; i++) {
            var commandItem = JSON.parse(values[i].command);
            var ids = values[i].ids;

            var buttonhtml = '<button id="' + commandItem.name + '" type="button" class="btn ' + commandItem.style + ' btn-cons"><i class="icon-ok"></i>' + commandItem.text + '</button>';
            var tr = '<tr><td><div style="height: 40px;overflow-y: auto;">' + values[i].numbers + '</div></td><td class="v-align-middle">' + buttonhtml + '</td></tr>';
            var lasttr = $('table#multiworkflowbuttons>tbody>tr:last');
            if (lasttr.length > 0)
                $('table#multiworkflowbuttons>tbody>tr:last').after(tr);
            else
                $('table#multiworkflowbuttons>tbody').append(tr);

           if (addparams != undefined)
               addparams(commandItem, routes);

           var height = me.getheight(commandItem);
           
            var panel = Ext.create('Ext.form.Panel',
                {
                    layout: 'form',
                    collapsible: false,
                    id: commandItem.name + 'form',
                    frame: false,
                    items: commandItem.form.items,
                    bodyPadding: '5 5 0',
                    buttons: [
                        {
                            text: optimajet.localization.get('Send'),
                            handler: function () {
                                var form = this.up('form').getForm();

                                if (!form.isValid())
                                    return;

                                var commandName = this.up('form').commandName;
                                var popup = me.findpopup(commandName);
                                var record = form.getFieldValues();
                                var data = {
                                    ids: this.up('form').ids,
                                    processName: '',
                                    commandName: commandName,
                                    parameters: JSON.stringify(record)
                                };

                                window.close();
                                popup.close();
                                me.sendcommandandshowresult(data, afterexec);
                            }

                        }, {
                            text: optimajet.localization.get('Cancel'),
                            handler: function() {
                                var p = me.findpopup(this.up('form').commandName);
                                p.close();
                            }
                        }
                    ]
                }
            );

            panel.commandName = commandItem.name;
            panel.ids = ids;

            var popupSettings = getPopupConfig(500, height + 50, commandItem.name + 'window', "popup-edit", null, commandItem.text);
            popupSettings.closeAction = 'hide';
            popupSettings.items = [panel];

            var popup = Ext.create('Ext.window.Window',
                popupSettings
            );

            var btn = $('button#' + commandItem.name);

            me.commandandpopups.push({ key: commandItem.name, value: popup });

            btn.on('click', function () {
                var p = me.findpopup(this.id);
                p.show();
            });
        }

       window.setSize(500, values.length * 60 + 100);
    },
    getheight: function(commandItem) {
        var height = 0;
        if (commandItem.form.items != undefined) {
            commandItem.form.items.forEach(function(item) {
                item.labelWidth = 200;
                if (item.xtype == 'textarea') {
                    item.height = 150;
                    height += item.height;
                } else if (item.height != undefined) {
                    height += item.height;
                } else {
                    height += 40;
                }

            });
        }

        //на кнопки
        height += 40;

        return height;
    },
    findpopup: function(commandName) {
        var me = this;
        for (var i = 0; i < me.commandandpopups.length; i++)
            if (me.commandandpopups[i].key == commandName)
                return me.commandandpopups[i].value;

        return undefined;
    },
    sendcommandandshowresult: function (data, afterexec, setstate) {
        if (!setstate)
            optimajet.WaitSaveDialogShow(optimajet.localization.get('Execution of the command, please wait') + '...');
        else
            optimajet.WaitSaveDialogShow(optimajet.localization.get('Setting status, please wait') + '...');

        var url = !setstate ? optimajet.CorrectUrl('WF/MultiExecuteCommand') : optimajet.CorrectUrl('WF/MultiSetState');

        var success = function(data, textStatus, jqXHR) {
            optimajet.WaitSaveDialogHide();
            var resp = JSON.parse(data);
            if (resp.success)
                ojControls.GenerateSuccessBlock(resp.message).appendTo('#formMainErrors');
            else
                ojControls.GenerateErrorBlock(resp.message).appendTo('#formMainErrors');
            if (afterexec != undefined)
                afterexec();
        };
                                           
                      
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: success
        });
    },
    commandandpopups: new Array(),

 

}