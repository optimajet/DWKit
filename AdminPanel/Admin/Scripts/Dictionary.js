var DictionayConst = {
    NotSelectRows: "You don't select rows.",
    ShowDeleted: "Show deleted",
    HideDeleted: "Hide deleted",
    DeleteConfirm: "Do you want to delete the selected entry?"
};

var MainGridCustomKeyFieldName = undefined;
function MainGridDeleteCheckedRows() {
    if (MainGrid.GetSelectedRowCount() < 1) {
        alert('@Resources.Resource.NotSelectRows');
        return;
    }

    if (!confirm(DictionayConst.DeleteConfirm))
        return;

    if (MainGridCustomKeyFieldName == undefined)
        MainGrid.GetSelectedFieldValues("Id", OnMainGridDeleteCheckedRows);
    else
        MainGrid.GetSelectedFieldValues(MainGridCustomKeyFieldName, OnMainGridDeleteCheckedRows);

}

function OnMainGridDeleteCheckedRows(selectedValues) {
    var data = new Array();
    for (var i = 0; i < selectedValues.length; i++) {
        data[data.length] = { name: 'checkedRecords', value: selectedValues[i] };
    }

    $('#result').innerHTML = '';

    if (MainGridIsShowDeleted) {
        $('#result').load(MainGridRemoveAction, data,
            function () {
                MainGrid.Refresh();
                MainGrid.UnselectRows();
            });
    } else {
        $('#result').load(MainGridDeleteAction, data,
            function () {                
                MainGrid.Refresh();
                MainGrid.UnselectRows();
            });
    }
}

function MainGridShowDeletedCheckedRows() {
    MainGrid.Refresh();
    MainGrid.UnselectRows();
}
        
function MainGridRestoreCheckedRows() {
    if (MainGrid.GetSelectedRowCount() < 1) {
        alert(DictionayConst.NotSelectRows);
        return;
    }
    MainGrid.GetSelectedFieldValues("Id", OnMainGridRestoreCheckedRows);
}

function OnMainGridRestoreCheckedRows(selectedValues) {
    var data = new Array();
    for (var i = 0; i < selectedValues.length; i++) {
        data[data.length] = { name: 'checkedRecords', value: selectedValues[i] };
    }

    $('#result').innerHTML = '';
    $('#result').load(MainGridRestoreAction, data,
    function () {
        MainGrid.Refresh();
        MainGrid.UnselectRows();
    });
}
function MainGridShowDeleted() {
    MainGridIsShowDeleted = !MainGridIsShowDeleted;
    var b = $(".toolbar > .toolbar-showdeleted");
    var r = $(".toolbar > .toolbar-restore");
    if (MainGridIsShowDeleted) {
        b.html(DictionayConst.HideDeleted);
        r.show();
    }
    else {
        b.html(DictionayConst.ShowDeleted);
        r.hide();
    }

    MainGrid.UnselectRows();
    MainGrid.Refresh();
}

function TreeViewGetCheckedNodes(treeView) {
    var checkNodes = new Array();
    checkNodes = checkNodes.concat(TreeViewGetCheckedNodesInChildNode(treeView.GetRootNode()));
    return checkNodes;
}

function TreeViewGetCheckedNodesInChildNode(parent){
    var res = new Array(); 
    for (var i=0; i < parent.GetNodeCount(); i++){
        if (parent.GetNode(i).GetChecked()){
            res.push(parent.GetNode(i));
        }
        
        if (parent.GetNode(i).GetNodeCount() != 0){
            res = res.concat(TreeViewGetCheckedNodesInChildNode(parent.GetNode(i)));
        }
    }
    return res;
}