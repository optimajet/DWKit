

optimajet.container.form_BillDemand_Edit_store = undefined;

function FormCustomSave(callback, nothingchangesignore){
    FormPrepareData();
	
    var stores = [
		optimajet.container.form_EntityRouteItem_store,
		optimajet.container.form_EntityRouteItemSighters_store
    ];
    optimajet.StoresSave(optimajet.container.form_EntityRoute_Edit_store , stores , '%7b%22GlobalReadOnly%22%3afalse%2c%22Settings%22%3a%7b%7d%2c%22AdditionalParameters%22%3a%7b%22gname%22%3a%22EntityRoute_Edit%22%2c%22gtype%22%3a%22form%22%7d%2c%22Hash%22%3a%227bb4efe99f1e96f3ff32280fe2c748f7%22%7d', false, callback, FormFinishValidate, nothingchangesignore);
}

function FormSave(){
    FormCustomSave(function(respData, isSuccess)	{
        if(isSuccess){
            optimajet.container.form_EntityRoute_Edit_reload(respData.processed[0]);
        }});
}

function FormSaveExit(){
    FormCustomSave(function(respData, isSuccess)	{
        if(isSuccess){
            $('#form_BackUrl')[0].click();
        }
    });
}


function FormPrepareData(){	
    $('#formMainErrors')[0].innerHTML = '';
}

function FormFinishValidate(){	
    var valid = true;	
    var error;
	
		
    if(!valid){
        ojControls.GenerateErrorBlock(error).appendTo('#formMainErrors');	
    }
    return valid;
}



$('#form_BackUrl')[0].href = optimajet.CorrectUrl('#WS/EntityRoute/GetContent');
if('' != '' ){
Ext.ComponentManager.onAvailable('', function(item) {
 	var tmp = Ext.getCmp('');
        if(tmp != null){
	        tmp.on("change", function(cntl, newValue, oldValue, eOpts){
	        	var tmp = newValue; 
	        	if(newValue.length > 22)
	        		newValue = newValue.substring(0,21) + '...';
        	 	 $('#formTitle')[0].innerHTML = newValue;
        	 	 });
        	 	 }
        	 	 });
        	 	 }


     
Ext.onReady(function () { 
var localMask = new Ext.LoadMask(Ext.get('form_EntityRoute_Edit_placeholder').parent(), { msg: 'Загрузка...' });
    localMask.show();
Ext.define('EntityRoute_Edit_model', {extend: 'Ext.data.Model', fields: [{
        name: 'securityuserid_name',
                type: 'string',
            useNull: false
            },{
            name: 'changedate',
    type: 'date',
    useNull: false
    },{
    name: 'createdate',
    type: 'date',
    useNull: false
    },{
    name: 'id',
        type: 'string',
            useNull: true
            },{
            name: 'lockversion',
                type: 'string',
                useNull: true
                },{
                name: 'name',
                type: 'string',
                    useNull: false
                    },{
                    name: 'securityuserid',
                            type: 'string',
                        useNull: false
                        }],idProperty: 'id'});var form_EntityRoute_Edit_writer = Ext.create('Ext.data.writer.Json',{ getRecordData: function(record){
                        return {'securityuserid_name': record.data.securityuserid_name,'changedate': record.data.changedate,'createdate': record.data.createdate,'id': record.data.id,'lockversion': record.data.lockversion,'name': record.data.name,'securityuserid': record.data.securityuserid};
                        }
                        }); var form_EntityRoute_Edit_store = Ext.create('Ext.data.Store', {
        viewName: 'EntityRoute_Edit',
                autoLoad: false,
            autoSync: false,
            setAllPhantomAfterLoad : false,

                listeners: {
                add: function(store, records, index, eOpts) {
                    if (optimajet.CustomFunctions.form_EntityRoute_Edit_store_onAddCallback) {
                        optimajet.CustomFunctions.form_EntityRoute_Edit_store_onAddCallback.call(store, records, index, eOpts);
                    }
                    },
                    load: function(store, records, successful, eOpts) {
                        if (optimajet.CustomFunctions.form_EntityRoute_Edit_store_onLoadCallback) {
                            optimajet.CustomFunctions.form_EntityRoute_Edit_store_onLoadCallback.call(store, records, successful, eOpts);
                        }
                        },
                    },pageSize: -1,model: 'EntityRoute_Edit_model',remoteSort: true,
            proxy: {
                type: 'rest',
                extraParams: {search_term : '',selectquerytype : 0,extra: GetExtraParams(),visibility:'%7b%22GlobalReadOnly%22%3afalse%2c%22Settings%22%3a%7b%22EntityRoute_Edit%22%3a%7b%22H%22%3afalse%2c%22RO%22%3afalse%2c%22ROP%22%3a%5b%5d%2c%22EP%22%3a%5b%5d%2c%22HP%22%3a%5b%5d%2c%22SP%22%3a%5b%5d%2c%22NP%22%3a%5b%5d%2c%22NNP%22%3a%5b%5d%2c%22ExP%22%3a%5b%5d%7d%7d%2c%22AdditionalParameters%22%3a%7b%22gname%22%3a%22EntityRoute_Edit%22%2c%22gtype%22%3a%22form%22%7d%2c%22Hash%22%3a%22995edfe9d3fcd4c3243498a02eed9e34%22%7d',showdeleted:false},
                    url: optimajet.CorrectUrl('DDS/Get/EntityRoute_Edit.dds'),
                        reader: {
                        type: 'json',
        root: 'data',
        totalProperty: 'count'
},
    writer: form_EntityRoute_Edit_writer,
                        listeners: { 
                    exception: function(proxy, response, options) {
                        form_EntityRoute_Edit_store.rejectChanges();
                        optimajet.ShowErrorFromResponse(response);            
                        }
                        }
                        },});function GetExtraParams() { if (optimajet.container.EntityRoute_Edit_extra) return optimajet.container.EntityRoute_Edit_extra; return ''; }optimajet.registerInContainer('form_EntityRoute_Edit_store',form_EntityRoute_Edit_store);Ext.DomHelper.append('form_EntityRoute_Edit_placeholder','\u003cdiv class=\"row\"\u003e\n\t\t\u003cdiv class=\"col-md-6\"\u003e\n\t\t\t\u003ctable style=\"width:100%\"\u003e\n\t\t\t\t\t\t\u003ctr class=\"one_col_middle\"\u003e\n\t\t\t\t\t\t\t\u003ctd class=\"cols_label\"\u003e\n\t\t\t\t\t\t\t\t\u003clabel class=\"form-label\"\u003e\n\t\t\t\t\t\t\t\t\t\t\u003cdiv id=\"form_Name_labelplaceholder\"\u003e\u003c/div\u003e \n\t\t\t\t\t\t\t\t\u003c/label\u003e\n\t\t\t\t\t\t\t\u003c/td\u003e\n\t\t\t\t\t\t\t\u003ctd class=\"cols_control\"\u003e\n\t\t\t\t\t\t\t\t\t\u003cspan class=\"help\"\u003e\u003c/span\u003e\t\t\t\n\t\t\t\t\t\t\t\t\t\u003cdiv class=\"controls\" id=\"form_Name_placeholder\"\u003e\u003c/div\u003e\n\t\t\t\t\t\t\t\u003c/td\u003e\n\t\t\t\t\t\t\u003c/tr\u003e\n\t\t\t\t\t\t\u003ctr class=\"one_col_middle\"\u003e\n\t\t\t\t\t\t\t\u003ctd class=\"cols_label\"\u003e\n\t\t\t\t\t\t\t\t\u003clabel class=\"form-label\"\u003e\n\t\t\t\t\t\t\t\t\t\t\u003cdiv id=\"form_SecurityUserId_Name_labelplaceholder\"\u003e\u003c/div\u003e \n\t\t\t\t\t\t\t\t\u003c/label\u003e\n\t\t\t\t\t\t\t\u003c/td\u003e\n\t\t\t\t\t\t\t\u003ctd class=\"cols_control\"\u003e\n\t\t\t\t\t\t\t\t\t\u003cspan class=\"help\"\u003e\u003c/span\u003e\t\t\t\n\t\t\t\t\t\t\t\t\t\u003cdiv class=\"controls\" id=\"form_SecurityUserId_Name_placeholder\"\u003e\u003c/div\u003e\n\t\t\t\t\t\t\t\u003c/td\u003e\n\t\t\t\t\t\t\u003c/tr\u003e\n\t\t\t\t\t\t\u003ctr class=\"one_col_middle\"\u003e\n\t\t\t\t\t\t\t\u003ctd class=\"cols_label\"\u003e\n\t\t\t\t\t\t\t\t\u003clabel class=\"form-label\"\u003e\n\t\t\t\t\t\t\t\t\t\t\u003cdiv id=\"form_CreateDate_labelplaceholder\"\u003e\u003c/div\u003e \n\t\t\t\t\t\t\t\t\u003c/label\u003e\n\t\t\t\t\t\t\t\u003c/td\u003e\n\t\t\t\t\t\t\t\u003ctd class=\"cols_control\"\u003e\n\t\t\t\t\t\t\t\t\t\u003cspan class=\"help\"\u003e\u003c/span\u003e\t\t\t\n\t\t\t\t\t\t\t\t\t\u003cdiv class=\"controls\" id=\"form_CreateDate_placeholder\"\u003e\u003c/div\u003e\n\t\t\t\t\t\t\t\u003c/td\u003e\n\t\t\t\t\t\t\u003c/tr\u003e\n\t\t\t\t\t\t\u003ctr class=\"one_col_middle\"\u003e\n\t\t\t\t\t\t\t\u003ctd class=\"cols_label\"\u003e\n\t\t\t\t\t\t\t\t\u003clabel class=\"form-label\"\u003e\n\t\t\t\t\t\t\t\t\t\t\u003cdiv id=\"form_ChangeDate_labelplaceholder\"\u003e\u003c/div\u003e \n\t\t\t\t\t\t\t\t\u003c/label\u003e\n\t\t\t\t\t\t\t\u003c/td\u003e\n\t\t\t\t\t\t\t\u003ctd class=\"cols_control\"\u003e\n\t\t\t\t\t\t\t\t\t\u003cspan class=\"help\"\u003e\u003c/span\u003e\t\t\t\n\t\t\t\t\t\t\t\t\t\u003cdiv class=\"controls\" id=\"form_ChangeDate_placeholder\"\u003e\u003c/div\u003e\n\t\t\t\t\t\t\t\u003c/td\u003e\n\t\t\t\t\t\t\u003c/tr\u003e\n\t\t\t\u003c/table\u003e\n\t\t\u003c/div\u003e\n\u003c/div\u003e\n\n\n');
                        var form_load_elements = new Array();
                        var form_save_elements = new Array();var form_Name_control = Ext.create('Ext.form.field.Text',{id: 'form_Name_control', allowBlank:false, readOnly:false, fieldName:'name',renderTo:'form_Name_placeholder', width:'100%',maxLength : 1024});Ext.create('Ext.form.Label',{forId: 'form_Name_control', html: 'Name<span style="color: red;">*</span>', renderTo: 'form_Name_labelplaceholder', width:'100%'});var form_SecurityUserId_Name_control = Ext.create('Ext.form.field.Text',{id: 'form_SecurityUserId_Name_control', allowBlank:false, readOnly:true, fieldName:'securityuserid_name',renderTo:'form_SecurityUserId_Name_placeholder', width:'100%',maxLength : 256,parentAttributeId: '0efa06bf64f6465fbcc70596c0bd9872', fieldNameToBind : 'name'});Ext.create('Ext.form.Label',{forId: 'form_SecurityUserId_Name_control', html: 'User<span style="color: red;">*</span>', renderTo: 'form_SecurityUserId_Name_labelplaceholder', width:'100%'});var form_CreateDate_control = Ext.create('Ext.form.field.Date',{id: 'form_CreateDate_control', fieldName:'createdate',renderTo:'form_CreateDate_placeholder', allowBlank:false, readOnly:true, width:'100%' , format : 'd.m.Y'});Ext.create('Ext.form.Label',{forId: 'form_CreateDate_control', html: 'Create date<span style="color: red;">*</span>', renderTo: 'form_CreateDate_labelplaceholder', width:'100%'});var form_ChangeDate_control = Ext.create('Ext.form.field.Date',{id: 'form_ChangeDate_control', fieldName:'changedate',renderTo:'form_ChangeDate_placeholder', allowBlank:false, readOnly:true, width:'100%' , format : 'd.m.Y'});Ext.create('Ext.form.Label',{forId: 'form_ChangeDate_control', html: 'Change date<span style="color: red;">*</span>', renderTo: 'form_ChangeDate_labelplaceholder', width:'100%'});var form_SecurityUserId_control = Ext.create('Ext.form.field.Hidden',{id: 'form_SecurityUserId_control', fieldName: 'securityuserid',renderTo: 'form_EntityRoute_Edit_placeholder' ,parentAttributeId: '0efa06bf64f6465fbcc70596c0bd9872', fieldNameToBind : 'id'});form_load_elements.push(form_Name_control);
                        form_load_elements.push(form_SecurityUserId_Name_control);
                        form_load_elements.push(form_CreateDate_control);
                        form_load_elements.push(form_ChangeDate_control);
                        form_load_elements.push(form_SecurityUserId_control);
                        form_save_elements.push(form_Name_control);
                        form_save_elements.push(form_SecurityUserId_Name_control);
                        form_save_elements.push(form_CreateDate_control);
                        form_save_elements.push(form_ChangeDate_control);
                        form_save_elements.push(form_SecurityUserId_control);

                        var form_EntityRoute_Edit_resize = function(p) {
                                    for (var i = 0; i < form_load_elements.length; i++)
                                        {
                                        if(p != undefined &&
			        $('#' + form_load_elements[i].bodyEl.id).parents(p).length == 0){						
			        return;
			        }  

                if (form_load_elements[i].needResizeToContainer)
                                        {
                    form_load_elements[i].resizeToContainer();
                    }
                }

                };


                        if (form_load_elements.length > 0)
    {
                        WorkspaceControls.AddOnResizeListener(form_EntityRoute_Edit_resize);
                        form_load_elements[0].on('destroy',function(){ WorkspaceControls.RemoveOnResizeListener(form_EntityRoute_Edit_resize); });
                        form_EntityRoute_Edit_resize();
                        }


                        function form_EntityRoute_Edit_reload (recordId) {
                        WorkspaceControls.MainPanelControl.AddTabUrl('WS/EntityRoute_Edit/GetContent?editform=EntityRoute_Edit&selectquerytype=0&needredirect=false&id=' + recordId, 'EntityRoute_Edit', 'Редактировать: Route',  null, true, 'WS/EntityRoute_Edit/GetContent??editform=EntityRoute_Edit&selectquerytype=0&needredirect=false&id=' + recordId);
                        }optimajet.registerInContainer('form_EntityRoute_Edit_reload',form_EntityRoute_Edit_reload);form_EntityRoute_Edit_store.ExtensionReload = form_EntityRoute_Edit_reload;function form_EntityRoute_Edit_exit () {
                        WorkspaceControls.MainPanelControl.AddTabUrl('WS//GetContent/', '', '',  null, true, '/WS/form_EntityRoute_Edit_exit/GetContent/');
                        };
                        optimajet.registerInContainer('form_EntityRoute_Edit_exit',form_EntityRoute_Edit_exit);
                        function form_EntityRoute_Edit_load (id,querytype) {
                        var prepareRecordAfterload = function(records) {{}};
                        var copyDataToControls = function(records,filledfields){
                             for(i = 0; i < form_load_elements.length; i++) {
                                if (typeof(form_load_elements[i]) != 'undefined')
                                 {
                                        var fieldName = form_load_elements[i].fieldName;
                                        if (filledfields != undefined)
                                    {
                                            var wasfound = false;
                                            for(j = 0; j < filledfields.length;j++)
                                            {
                                                if (filledfields[j] == fieldName)
                                                {
                                                    wasfound = true; break;
                                                }
                                                }
                                            if (!wasfound)
                        continue;
                }
                                        var loadedValue = records[0].get(fieldName);
                                        if (loadedValue != undefined)
                                    {
                                            form_load_elements[i].setValue(loadedValue);
                                            if (!isCopy)
                      form_load_elements[i].originalValue = form_load_elements[i].getValue();
                      }
                                        }
                                        }
                                };
                        var processDataFromClient = function() {{}};var isCopy = querytype == 1;;form_EntityRoute_Edit_store.filters.clear();form_EntityRoute_Edit_store.filter([{property: 'Id',value :id}]);
                        if(form_EntityRoute_Edit_store.getProxy().extraParams == undefined){
                            form_EntityRoute_Edit_store.getProxy().extraParams = new Object();
                            }

                        form_EntityRoute_Edit_store.getProxy().extraParams.selectquerytype = querytype;
                        form_EntityRoute_Edit_store.load({
                                callback : function(records, operation, success) {
                                    if (records.length != 1) {return;}
                                    if (querytype == 2 || querytype == 1) {
                                        records[0].setDirty();
        records[0].phantom = true;
        records[0].setId(undefined);
        }
                                    prepareRecordAfterload(records);
                                    var responseData = Ext.decode(operation.response.responseText);
                                    copyDataToControls(records,responseData.filledfields);
                                    form_EntityRoute_Edit_store.removeAll();
                                    form_EntityRoute_Edit_store.add(records);
                                    if(typeof(form_EntityRoute_Edit_store_LoadComplete) == 'function')
                                        form_EntityRoute_Edit_store_LoadComplete(records[0]);
                                        }
                                        });};optimajet.registerInContainer('form_EntityRoute_Edit_load',form_EntityRoute_Edit_load);form_EntityRoute_Edit_store.ExtensionLoad = form_EntityRoute_Edit_load;function form_EntityRoute_Edit_reload_internal (record, res, fn) { 
                                                var id = record.getId();
                                                if (res != undefined)
                                            {
                                                var responseData = Ext.decode(res.operations[0].response.responseText);
                                                if (responseData.processed != undefined && responseData.processed.length == 1)
                                                {
                                                   fn(responseData.processed[0],false);  
                                                   }
                                                else if (id != undefined && id != null)
                                                    {
                                                    fn(id,false); 
            }
                                                }
                                            else
                                            {
                                                 fn(id,false); 
        }
        }function form_EntityRoute_Edit_save (fn,isload,forcecall) {
        if (form_EntityRoute_Edit_store.data.getCount() == 0) { 
         var newItem = Ext.create('EntityRoute_Edit_model');
         form_EntityRoute_Edit_store.insert(0, newItem);
         }
        var validationError = false;
        if (form_EntityRoute_Edit_store.data.getCount() != 1) { return; }
        for(var i = 0; i < form_load_elements.length; i++){
             if (!form_load_elements[i].isValid())
                    validationError = true;
                    }
        if (validationError) {
    return false;
    }
var record = form_EntityRoute_Edit_store.data.getAt(0);
for(var j = 0; j < form_save_elements.length; j++){
    if (typeof(form_save_elements[j]) != 'undefined')
    {
        if (!form_save_elements[j].isDirty())
            continue;
        record.set(form_save_elements[j].fieldName,form_save_elements[j].getValue());
        record.setDirty();
    }
    }

if (forcecall != undefined && forcecall && !record.dirty)
            {
    var res = undefined;
    if (fn != undefined)
    {
        if (isload)
    {
           form_EntityRoute_Edit_reload_internal(record,res,fn);
           }
           else if (!isload)
           {
               fn();
           }
           }

       return true;
    }

if(form_EntityRoute_Edit_store.getNewRecords().length == 0 && form_EntityRoute_Edit_store.getUpdatedRecords().length == 0 && form_EntityRoute_Edit_store.getRemovedRecords().length == 0){
    optimajet.showInfo('Сохранение', 'Перед сохранением необходимо изменить запись!');
    return;
    }

optimajet.WaitSaveDialogShow();
        form_EntityRoute_Edit_store.sync({success : function(res) {
        if (fn != undefined)
        {
            if ( isload  && res.operations.length == 1)
            {
               form_EntityRoute_Edit_reload_internal(record,res,fn);
               }
               else if (!isload)
            {
        fn();
        }
        }

optimajet.WaitSaveDialogHide();
},
    failure:function() {
    optimajet.WaitSaveDialogHide();
    }});
return true;
    };
        optimajet.registerInContainer('form_EntityRoute_Edit_save',form_EntityRoute_Edit_save);
        var form_EntityRoute_Edit_collect = function () {
        var ret = new Array();
            for (var i = 0; i < form_load_elements.length; i++)
            {
                ret.push({name:form_load_elements[i].fieldName,value:form_load_elements[i].getValue(),editor:form_load_elements[i]});
                }
            return ret;
                }
        optimajet.registerInContainer('form_EntityRoute_Edit_collect',form_EntityRoute_Edit_collect);
form_EntityRoute_Edit_store.ExtensionCollect = form_EntityRoute_Edit_collect;
var form_EntityRoute_Edit_collect_save = function () {
var ret = new Array();
    for (var i = 0; i < form_save_elements.length; i++)
    {
        ret.push({name:form_save_elements[i].fieldName,value:form_save_elements[i].getValue(),editor:form_save_elements[i]});
        }
    return ret;
        }
optimajet.registerInContainer('form_EntityRoute_Edit_collect_save',form_EntityRoute_Edit_collect_save);
form_EntityRoute_Edit_store.ExtensionCollectSave = form_EntityRoute_Edit_collect_save;form_EntityRoute_Edit_load('',2);

form_EntityRoute_Edit_store.on('load', function(){ localMask.hide(); });
});
 

    
    var config = {
    disableSearchField: true,
        disableShowDeleted: true,
            ignorePermission: true
    };
    
    ojControls.InitGridWithToolbar('form', 'EntityRouteItem', config);
    
     Ext.onReady(function () { 
   var localMask = new Ext.LoadMask(Ext.get('form_EntityRouteItemDiv'), { msg: 'Загрузка...' });
  localMask.show();
Ext.define('EntityRouteItem_model', {extend: 'Ext.data.Model', fields: [{
        name: 'allowedit',
    type: 'bool',
        useNull: false
        },{
        name: 'id',
            type: 'string',
                useNull: true
                },{
                name: 'lockversion',
                    type: 'string',
                    useNull: true
                    },{
                    name: 'name',
                    type: 'string',
                        useNull: false
                        },{
                        name: 'number',
    type: 'int',
            useNull: false
            }],idProperty: 'id'});var form_EntityRouteItem_writer = Ext.create('Ext.data.writer.Json',{ getRecordData: function(record){
            return {'allowedit': record.data.allowedit,'id': record.data.id,'lockversion': record.data.lockversion,'name': record.data.name,'number': record.data.number};
            }
            }); var form_EntityRouteItem_store = Ext.create('Ext.data.Store', {
           viewName: 'EntityRouteItem',
                   autoLoad: false,
               autoSync: false,
               setAllPhantomAfterLoad : false,

                   listeners: {
                   add: function(store, records, index, eOpts) {
                       if (optimajet.CustomFunctions.form_EntityRouteItem_store_onAddCallback) {
                           optimajet.CustomFunctions.form_EntityRouteItem_store_onAddCallback.call(store, records, index, eOpts);
                       }
                       },
                       load: function(store, records, successful, eOpts) {
                           if (optimajet.CustomFunctions.form_EntityRouteItem_store_onLoadCallback) {
                               optimajet.CustomFunctions.form_EntityRouteItem_store_onLoadCallback.call(store, records, successful, eOpts);
                           }
                           },
                       },pageSize: -1,model: 'EntityRouteItem_model',remoteSort: false,
               proxy: {
                   type: 'rest',
                   extraParams: {search_term : '',selectquerytype : 0,extra: GetExtraParams(),beidname:'EntityRouteId',beidvalue: '',visibility:'%7b%22GlobalReadOnly%22%3afalse%2c%22Settings%22%3a%7b%22EntityRouteItem%22%3a%7b%22H%22%3afalse%2c%22RO%22%3afalse%2c%22ROP%22%3a%5b%5d%2c%22EP%22%3a%5b%5d%2c%22HP%22%3a%5b%5d%2c%22SP%22%3a%5b%5d%2c%22NP%22%3a%5b%5d%2c%22NNP%22%3a%5b%5d%2c%22ExP%22%3a%5b%5d%7d%7d%2c%22AdditionalParameters%22%3a%7b%22gname%22%3a%22EntityRoute_Edit%22%2c%22gtype%22%3a%22form%22%7d%2c%22Hash%22%3a%2219243cf9f9461c489d4cea859f5c97b8%22%7d',showdeleted:false},
                       url: optimajet.CorrectUrl('DDS/Get/EntityRouteItem.dds'),
                           reader: {
                           type: 'json',
        root: 'data',
        totalProperty: 'count'
},
    writer: form_EntityRouteItem_writer,
                           listeners: { 
                       exception: function(proxy, response, options) {
                           form_EntityRouteItem_store.rejectChanges();
                           optimajet.ShowErrorFromResponse(response);            
                           }
                           }
                           },});function GetExtraParams() { if (optimajet.container.EntityRouteItem_extra) return optimajet.container.EntityRouteItem_extra; return ''; }optimajet.registerInContainer('form_EntityRouteItem_store',form_EntityRouteItem_store); var form_EntityRouteItem_filters = {
           ftype: 'filters',
           encode: true,
                   local: false
                   };var form_EntityRouteItem_dblclick = function(grid, record, item, index, e, eOpts) {
                   var id = record.getId();
                   form_EntityRouteItem_grid.editingRecord = record;
                   form_EntityRouteItem_grid.sourceRecord = record;
                   form_EntityRouteItem_grid.fireEvent('edit', form_EntityRouteItem_grid);
                   WorkspaceControls.ShowWindowByUrl('WS/EntityRouteItem_Edit/GetContent?customsave=true&windowid=EntityRouteItem_Edit_2cadfed0bed94583a10e2425705833c3&gridid=form_EntityRouteItem_grid&editform=EntityRouteItem_Edit&selectquerytype=0&needredirect=false&id=' + id,'EntityRouteItem_Edit', 'EntityRouteItem_Edit_2cadfed0bed94583a10e2425705833c3', '600px','500px','Редактировать: Route Item',null);
                   }; 
                   var form_EntityRouteItem_selection = Ext.create('Ext.selection.CheckboxModel',{ allowDeselect: true,enableKeyNav: true,mode : 'MULTI'}); 
                   function form_EntityRouteItem_grid_toolbar_add_function () {
                     form_EntityRouteItem_grid.editingRecord = undefined;
                     form_EntityRouteItem_grid.sourceRecord = undefined;
                     WorkspaceControls.ShowWindowByUrl('WS/EntityRouteItem_Edit/GetContent?beidname=EntityRouteId&beidvalue=&customsave=true&windowid=EntityRouteItem_Edit_9cfba4c24ebd4692bb864cfeeb67daac&gridid=form_EntityRouteItem_grid&editform=EntityRouteItem_Edit&selectquerytype=2&needredirect=false','EntityRouteItem_Edit', 'EntityRouteItem_Edit_9cfba4c24ebd4692bb864cfeeb67daac', '600px','500px','Создать: Route Item',null);
                     }optimajet.registerInContainer('form_EntityRouteItem_grid_toolbar_add_function',form_EntityRouteItem_grid_toolbar_add_function);
                     var toolbar = Ext.getCmp('form_EntityRouteItem_grid_toolbar');
                     if (toolbar == undefined && typeof (optimajet.container.form_EntityRouteItem_grid_toolbar) != 'undefined')
       {
                         toolbar = optimajet.container.form_EntityRouteItem_grid_toolbar;
                         }
                     if (toolbar != undefined) {
                     for (i=0;i<toolbar.items.length;i++){
                         var item = toolbar.items.getAt(i);
                         if (item != undefined && item.getId() != undefined &&  item.getId() == 'form_EntityRouteItem_grid_toolbar_add')
                         {
                             item.addListener('click',form_EntityRouteItem_grid_toolbar_add_function);
                             item.setVisible(true);
    }
    }
    };
 
                     function form_EntityRouteItem_grid_toolbar_delete_function () {
                         var sm = form_EntityRouteItem_grid.getSelectionModel();
                         if (sm == undefined)
        return;
    var selection = sm.getSelection();
    if (selection == undefined || (selection.length != undefined && selection.length < 1))
        return;
                         form_EntityRouteItem_store.remove(selection);
    
                         }

                     function form_EntityRouteItem_grid_toolbar_delete_confirm_function () {    
                         Ext.MessageBox.show({
                             title: 'Подтверждение',
                                     icon: Ext.MessageBox.QUESTION,
                                     msg: 'Вы действительно хотите удалить выбранные записи?',
                                 buttons: Ext.MessageBox.YESNO,
                                 callback: function(isConfirm){ if(isConfirm == 'yes') form_EntityRouteItem_grid_toolbar_delete_function(); },
                                     width: 450
            });
            }
             optimajet.registerInContainer('form_EntityRouteItem_grid_toolbar_delete_confirm_function',form_EntityRouteItem_grid_toolbar_delete_confirm_function);
             var toolbar = Ext.getCmp('form_EntityRouteItem_grid_toolbar');
             if (toolbar == undefined && typeof (optimajet.container.form_EntityRouteItem_grid_toolbar) != 'undefined')
       {
                 toolbar = optimajet.container.form_EntityRouteItem_grid_toolbar;
                 }
             if (toolbar != undefined) {
             for (i=0;i<toolbar.items.length;i++){
                 var item = toolbar.items.getAt(i);
                 if (item != undefined && item.getId() != undefined &&  item.getId() == 'form_EntityRouteItem_grid_toolbar_delete')
                 {
                     item.addListener('click',form_EntityRouteItem_grid_toolbar_delete_confirm_function);
                     item.setVisible(true);
    }
    }
    };
 
             function form_EntityRouteItem_grid_toolbar_copy_function () {
                 var sm = form_EntityRouteItem_grid.getSelectionModel();
                 if (sm == undefined)
        return;
   var selection = sm.getSelection();
    if (selection == undefined || (selection.length != undefined && selection.length != 1))
        return;
  var id = selection[0].getId();
              form_EntityRouteItem_grid.editingRecord = undefined;
              form_EntityRouteItem_grid.sourceRecord = selection[0];
              WorkspaceControls.ShowWindowByUrl('WS/EntityRouteItem_Edit/GetContent?iscopy=true&customsave=true&windowid=EntityRouteItem_Edit_b77fdb8c08f440f9b0c49a62fd8b759e&gridid=form_EntityRouteItem_grid&editform=EntityRouteItem_Edit&selectquerytype=1&needredirect=false&id=' + id,'EntityRouteItem_Edit', 'EntityRouteItem_Edit_b77fdb8c08f440f9b0c49a62fd8b759e', '600px','500px','Копировать: Route Item',null);
              }optimajet.registerInContainer('form_EntityRouteItem_grid_toolbar_copy_function',form_EntityRouteItem_grid_toolbar_copy_function);
              var toolbar = Ext.getCmp('form_EntityRouteItem_grid_toolbar');
              if (toolbar == undefined && typeof (optimajet.container.form_EntityRouteItem_grid_toolbar) != 'undefined')
       {
                  toolbar = optimajet.container.form_EntityRouteItem_grid_toolbar;
                  }
              if (toolbar != undefined) {
              for (i=0;i<toolbar.items.length;i++){
                  var item = toolbar.items.getAt(i);
                  if (item != undefined && item.getId() != undefined &&  item.getId() == 'form_EntityRouteItem_grid_toolbar_copy')
                  {
                      item.addListener('click',form_EntityRouteItem_grid_toolbar_copy_function);
                      item.setVisible(true);
    }
    }
    };
 
              function form_EntityRouteItem_grid_toolbar_edit_function () {
                  var sm = form_EntityRouteItem_grid.getSelectionModel();
                  if (sm == undefined)
        return;
   var selection = sm.getSelection();
    if (selection == undefined || (selection.length != undefined && selection.length != 1))
        return;
  var id = selection[0].getId();
 WorkspaceControls.ShowWindowByUrl('WS/EntityRouteItem_Edit/GetContent?customsave=true&windowid=EntityRouteItem_Edit_48516077bf5b479e9671c537def74f4c&gridid=form_EntityRouteItem_grid&editform=EntityRouteItem_Edit&selectquerytype=0&needredirect=false&id=' + id,'EntityRouteItem_Edit', 'EntityRouteItem_Edit_48516077bf5b479e9671c537def74f4c', '600px','500px','Редактировать: Route Item',null);
 }optimajet.registerInContainer('form_EntityRouteItem_grid_toolbar_edit_function',form_EntityRouteItem_grid_toolbar_edit_function);
 var toolbar = Ext.getCmp('form_EntityRouteItem_grid_toolbar');
 if (toolbar == undefined && typeof (optimajet.container.form_EntityRouteItem_grid_toolbar) != 'undefined')
       {
     toolbar = optimajet.container.form_EntityRouteItem_grid_toolbar;
     }
 if (toolbar != undefined) {
 for (i=0;i<toolbar.items.length;i++){
     var item = toolbar.items.getAt(i);
     if (item != undefined && item.getId() != undefined &&  item.getId() == 'form_EntityRouteItem_grid_toolbar_edit')
     {
         item.addListener('click',form_EntityRouteItem_grid_toolbar_edit_function);
         item.setVisible(true);
    }
    }
    };
 
 function form_EntityRouteItem_grid_toolbar_showall_function () {
      Ext.getCmp('form_EntityRouteItem_grid_toolbar_search_field').setValue('');
      form_EntityRouteItem_store.getProxy().extraParams.search_term = '';
      form_EntityRouteItem_store.loadPage(1);
      }optimajet.registerInContainer('form_EntityRouteItem_grid_toolbar_showall_function',form_EntityRouteItem_grid_toolbar_showall_function);
      var toolbar = Ext.getCmp('form_EntityRouteItem_grid_toolbar');
      if (toolbar == undefined && typeof (optimajet.container.form_EntityRouteItem_grid_toolbar) != 'undefined')
       {
          toolbar = optimajet.container.form_EntityRouteItem_grid_toolbar;
          }
      if (toolbar != undefined) {
      for (i=0;i<toolbar.items.length;i++){
          var item = toolbar.items.getAt(i);
          if (item != undefined && item.getId() != undefined &&  item.getId() == 'form_EntityRouteItem_grid_toolbar_showall')
          {
              item.addListener('click',form_EntityRouteItem_grid_toolbar_showall_function);
              item.setVisible(true);
    }
    }
    };
var toolbar = Ext.getCmp('form_EntityRouteItem_grid_toolbar');
if (toolbar == undefined && typeof (optimajet.container.form_EntityRouteItem_grid_toolbar) != 'undefined')
       {
    toolbar = optimajet.container.form_EntityRouteItem_grid_toolbar;
    }
if (toolbar != undefined) {
var itemsToRemove = new Array();
for (i=0; i<toolbar.items.length; i++){
    var item = toolbar.items.getAt(i);
    if (item != undefined && item.getId() != undefined &&  item.getId() == 'form_EntityRouteItem_grid_toolbar_showdeleted')
    {
        itemsToRemove.push(item);
        }
        }
for (var i = 0; i <  itemsToRemove.length; i++)
    {
        var item = itemsToRemove[i];
        toolbar.remove(itemsToRemove[i]);
        }
        };
 
function form_EntityRouteItem_grid_toolbar_search_function () {
    var searchValue = Ext.getCmp('form_EntityRouteItem_grid_toolbar_search_field').getValue();
    if (searchValue == undefined || searchValue == null)
        return;
    if (searchValue == undefined || searchValue == null)
        return;
    form_EntityRouteItem_store.getProxy().extraParams.search_term = searchValue;
    form_EntityRouteItem_store.loadPage(1);
    }
 
if (Ext.getCmp('form_EntityRouteItem_grid_toolbar_search_field') != undefined)
       {
    Ext.getCmp('form_EntityRouteItem_grid_toolbar_search_field').on('keydown', function(field, e) { if (e.getKey() == e.ENTER) {form_EntityRouteItem_grid_toolbar_search_function();} });
    }optimajet.registerInContainer('form_EntityRouteItem_grid_toolbar_search_function',form_EntityRouteItem_grid_toolbar_search_function);
    var toolbar = Ext.getCmp('form_EntityRouteItem_grid_toolbar');
    if (toolbar == undefined && typeof (optimajet.container.form_EntityRouteItem_grid_toolbar) != 'undefined')
       {
        toolbar = optimajet.container.form_EntityRouteItem_grid_toolbar;
        }
    if (toolbar != undefined) {
    for (i=0;i<toolbar.items.length;i++){
        var item = toolbar.items.getAt(i);
        if (item != undefined && item.getId() != undefined &&  item.getId() == 'form_EntityRouteItem_grid_toolbar_search')
        {
            item.addListener('click',form_EntityRouteItem_grid_toolbar_search_function);
            item.setVisible(true);
    }
    }
    };
 
    function form_EntityRouteItem_grid_toolbar_exportexcel_function () {
            var selection = gridUtils.getSelection(form_EntityRouteItem_grid);
            var url = optimajet.CorrectUrl('DDS/EntityRouteItem.xlsx');
        
            if(typeof selection!='undefined') { 
                var separator = url.indexOf('?') < 0 ? '?' : '&';
                url+= separator+'entityIds='+gridUtils.getSelectedIds(selection).join(',');
                }
          
            var currentStore = form_EntityRouteItem_store;
            var currentProxy = currentStore.getProxy();     

            var fieldColumns = 'columns=';
            var visibleColumnCount = 0;
            for(var i=0; i< form_EntityRouteItem_grid.columns.length; i++)
        {
                var c = form_EntityRouteItem_grid.columns[i];
                if(!c.hidden){
                if(visibleColumnCount > 0)
                    fieldColumns += ',';
                fieldColumns += c.dataIndex;
                visibleColumnCount++;
            }   
                }
            
            var separator = url.indexOf('?') < 0 ? '?' : '&';
            url += separator + fieldColumns;

            var search_term_cntrl = Ext.getCmp('form_EntityRouteItem_grid_toolbar_search_field');
            if(search_term_cntrl != undefined){
                var search_term = search_term_cntrl.getValue();
                if(search_term != undefined)
                    url += '&search_term=' + search_term;
                    }
            var sortParam = currentStore.getFirstSorter();
            if(sortParam != undefined)
                url += '&sort=' + currentStore.getFirstSorter().property + '&dir=' + currentStore.getFirstSorter().direction;

            if(form_EntityRouteItem_grid.filters != undefined){
                var filter = form_EntityRouteItem_grid.filters.buildQuery(form_EntityRouteItem_grid.filters.getFilterData());
                if(filter != undefined && filter.filter != undefined)
                    url += '&filter=' + filter.filter;
                    }

            if(currentProxy && currentProxy.extraParams){
                separator = url.indexOf('?') < 0 ? '?' : '&';
                url += separator + 'extra=' + currentProxy.extraParams.extra;
                }

            url += '&beidname=EntityRouteId&beidvalue=';
            location.href = url;
    }optimajet.registerInContainer('form_EntityRouteItem_grid_toolbar_exportexcel_function',form_EntityRouteItem_grid_toolbar_exportexcel_function);
    var toolbar = Ext.getCmp('form_EntityRouteItem_grid_toolbar');
    if (toolbar == undefined && typeof (optimajet.container.form_EntityRouteItem_grid_toolbar) != 'undefined')
       {
        toolbar = optimajet.container.form_EntityRouteItem_grid_toolbar;
        }
    if (toolbar != undefined) {
    for (i=0;i<toolbar.items.length;i++){
        var item = toolbar.items.getAt(i);
        if (item != undefined && item.getId() != undefined &&  item.getId() == 'form_EntityRouteItem_grid_toolbar_exportexcel')
        {
            item.addListener('click',form_EntityRouteItem_grid_toolbar_exportexcel_function);
            item.setVisible(true);
    }
    }
    };
var form_EntityRouteItem_grid = Ext.create('Ext.grid.Panel', {
           id: 'form_EntityRouteItem_grid',
                   width: '100%',
               height: '100%',
               layout: 'fit',
                   store: form_EntityRouteItem_store,
                   disableSelection: false,
                   editingRecord: undefined,
                   sourceRecord: undefined,
                   stateId: 'form_EntityRouteItem_grid',
                   viewConfig:{loadMask:{maskCls:'unVisibleMask'}},
                           stateful: true,
               features: [form_EntityRouteItem_filters],selModel: form_EntityRouteItem_selection,columns:[{text: 'Number',
                   dataIndex: 'number',
                       hidden: false,
                       sortable: true , width: 100,
                       filterable: true
                       ,xtype: 'numbercolumn',format: '0'
                       },{text: 'Name',
                       dataIndex: 'name',
                           hidden: false,
                           sortable: true , width: 200,
                           filterable: true
                           ,renderer: function (val, metaData, record, rowIndex, colIndex, store){var key = record.get('name');if (key == 'Manager Level') {
                           return 'Manager Level';
                           }if (key == 'Functional Head') {
                           return 'Functional Head';
                           }if (key == 'Regional or Global Functional Head') {
                           return 'Regional or Global Functional Head';
                           }if (key == 'SILO HEAD') {
                           return 'SILO HEAD';
                           }}
                           },{text: 'Allow edit',
                       dataIndex: 'allowedit',
                               hidden: false,
                           sortable: true , width: 100,
                           filterable: true
                           ,xtype: 'readonlycheckcolumn'
                           }],renderTo: 'form_EntityRouteItemDiv',listeners : {itemdblclick : form_EntityRouteItem_dblclick}});form_EntityRouteItem_store.load();
                           localMask.hide();
                           });

   Ext.onReady(function () { 
Ext.define('EntityRouteItemSighters_model', {extend: 'Ext.data.Model', fields: [{
        name: 'entityrouteitemid_entityrouteid',
                type: 'string',
            useNull: false
            },{
            name: 'securityuserid_name',
                    type: 'string',
                useNull: false
                },{
                name: 'entityrouteitemid',
                        type: 'string',
                    useNull: false
                    },{
                    name: 'id',
                        type: 'string',
                            useNull: true
                            },{
                            name: 'lockversion',
                                type: 'string',
                                useNull: true
                                },{
                                name: 'securityuserid',
                                        type: 'string',
                                    useNull: false
                                    }],idProperty: 'id'});var form_EntityRouteItemSighters_writer = Ext.create('Ext.data.writer.Json',{ getRecordData: function(record){
                                    return {'entityrouteitemid_entityrouteid': record.data.entityrouteitemid_entityrouteid,'securityuserid_name': record.data.securityuserid_name,'entityrouteitemid': record.data.entityrouteitemid,'id': record.data.id,'lockversion': record.data.lockversion,'securityuserid': record.data.securityuserid};
                                    }
                                    }); var form_EntityRouteItemSighters_store = Ext.create('Ext.data.Store', {
        viewName: 'EntityRouteItemSighters',
                autoLoad: false,
            autoSync: false,
            setAllPhantomAfterLoad : false,

                listeners: {
                add: function(store, records, index, eOpts) {
                    if (optimajet.CustomFunctions.form_EntityRouteItemSighters_store_onAddCallback) {
                        optimajet.CustomFunctions.form_EntityRouteItemSighters_store_onAddCallback.call(store, records, index, eOpts);
                    }
                    },
                    load: function(store, records, successful, eOpts) {
                        if (optimajet.CustomFunctions.form_EntityRouteItemSighters_store_onLoadCallback) {
                            optimajet.CustomFunctions.form_EntityRouteItemSighters_store_onLoadCallback.call(store, records, successful, eOpts);
                        }
                        },
                    },pageSize: -1,model: 'EntityRouteItemSighters_model',remoteSort: true,
            proxy: {
                type: 'rest',
                extraParams: {search_term : '',selectquerytype : 0,extra: GetExtraParams(),beidname:'EntityRouteItemId_EntityRouteId',beidvalue: '',visibility:'%7b%22GlobalReadOnly%22%3afalse%2c%22Settings%22%3a%7b%22EntityRouteItem%22%3a%7b%22H%22%3afalse%2c%22RO%22%3afalse%2c%22ROP%22%3a%5b%5d%2c%22EP%22%3a%5b%5d%2c%22HP%22%3a%5b%5d%2c%22SP%22%3a%5b%5d%2c%22NP%22%3a%5b%5d%2c%22NNP%22%3a%5b%5d%2c%22ExP%22%3a%5b%5d%7d%7d%2c%22AdditionalParameters%22%3a%7b%22gname%22%3a%22EntityRoute_Edit%22%2c%22gtype%22%3a%22form%22%7d%2c%22Hash%22%3a%2219243cf9f9461c489d4cea859f5c97b8%22%7d',showdeleted:false},
                    url: optimajet.CorrectUrl('DDS/Get/EntityRouteItemSighters.dds'),
                        reader: {
                        type: 'json',
        root: 'data',
        totalProperty: 'count'
},
    writer: form_EntityRouteItemSighters_writer,
                        listeners: { 
                    exception: function(proxy, response, options) {
                        form_EntityRouteItemSighters_store.rejectChanges();
                        optimajet.ShowErrorFromResponse(response);            
                        }
                        }
                        },});function GetExtraParams() { if (optimajet.container.EntityRouteItemSighters_extra) return optimajet.container.EntityRouteItemSighters_extra; return ''; }optimajet.registerInContainer('form_EntityRouteItemSighters_store',form_EntityRouteItemSighters_store);
form_EntityRouteItemSighters_store.on('load', function(){ });
form_EntityRouteItemSighters_store.load();
});
   
   Ext.ComponentManager.onAvailable('form_EntityRouteItem_grid', function(item) {
	
	
	var toolbar_copy = Ext.getCmp('form_EntityRouteItem_grid_toolbar_copy');
	if(toolbar_copy != undefined){
		toolbar_copy.hide();
	}
	
	item.setSize();	
	
	item.on('edit', function(grid){
	
		optimajet.container.entityrouteitem_EntityRouteItemSighters_store = undefined;
		optimajet.containerStoreOnLoad('entityrouteitem_EntityRouteItemSighters_store', function(){
			var store  = optimajet.container.form_EntityRouteItemSighters_store;
			var secondaryStore = optimajet.container.entityrouteitem_EntityRouteItemSighters_store;
		
			var id = Ext.getCmp('form_EntityRouteItem_grid').editingRecord.internalId;
		
			store.data.items.forEach(function(item){
				if(item.get('entityrouteitemid') == id ){
					secondaryStore.add(item.data);
					}	
					});	
					});
				});	
				});

function EntityRouteItem_Cancel(){
	optimajet.container.entityrouteitem_EntityRouteItem_Edit_exit();
	}

function EntityRouteItem_Delete(index){
	var id = optimajet.container.form_EntityRouteItem_store.data.get(index).get('id');
	var line = optimajet.container.form_EntityRouteItemSighters_store;
	for(var i=line.data.items.length - 1; i >= 0 ; i--){	
		if(line.data.items[i].get('entityrouteitemid') == id){
			line.removeAt(i);
		}
	}

	optimajet.container.form_EntityRouteItem_store.removeAt(index);
	}

function EntityRouteItem_Save(){
	
	var source = optimajet.container.entityrouteitem_EntityRouteItemSighters_store;
	
	if (source.getCount()<= 0)
    {
		$('div#routeItemErrors').append(ojControls.GenerateErrorBlock("You must specify at least one user"));
		return;
		}
	var usedNames = new Array();
	
	for (var i = 0; i < source.getCount(); i++)
    {
		var name = source.data.getAt(i).get('securityuserid_name');
		if ($.inArray(name, usedNames)
	    {
			$('div#routeItemErrors').append(ojControls.GenerateErrorBlock("Users must be unique"));
			return;
			}
		usedNames.push(name);
	}
	
	
	if (!optimajet.container.entityrouteitem_EntityRouteItem_Edit_save())
		return;
		
	var editingRecord =  Ext.getCmp('form_EntityRouteItem_grid').editingRecord;
	var id = editingRecord.get('id');
	if (id == null)
    {
			id =  optimajet.NewGuid();
			editingRecord.setId(id);
			
			}
	source.data.items.forEach(function(item){
		if(item.get('id') == undefined){
			item.set('id', optimajet.NewGuid());
			item.set('entityrouteitemid', id);
			}		
			});
		
	
	var target = optimajet.container.form_EntityRouteItemSighters_store;	
	
	var properties = ['entityrouteitemid',
				'entityrouteitemid_entityrouteid',
			        'id',
				'lockversion',
				'securityuserid',
				'securityuserid_name'];
								
	
	
	ojControls.SyncStore(source, target, 'id', properties , 'entityrouteitemid', id );

	optimajet.container.entityrouteitem_EntityRouteItem_Edit_exit();
	

	}



