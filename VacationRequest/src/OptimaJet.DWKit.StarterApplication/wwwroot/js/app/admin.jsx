import React from 'react'
import { render } from 'react-dom'
import DWKitAdmin from './../../scripts/optimajet-admin.js'
import {CustomControls, CustomControlsRender} from './controls/CustomControlsInit.jsx';

let globalActions = [
    'validate',
    'save',
    'delete',
    'apply',
    'exit',
    'redirect',
    'setFilter',
    'applyFilter',
    'gridCreate',
    'gridEdit',
    'gridCopy',
    'gridDelete',
    'gridRefresh',
    'gridExport',
    'workflowExecuteCommand',
    'workflowSetState',
    'workflowSelectScheme',
    'workflowShowCommandForm',
    'workflowContinueExecution',
    'workflowCancelExecution',
    'refresh',
    'confirm',
    'createElement',
    'changeModel',
    'reload',
    'copy',
    'loadRecord'];

render(
    <DWKitAdmin
        apiUrl="/configapi"
        workflowApi="/workflow/designerapi"
        imageFolder="/images/"
        localizationFolder="/localization/"
        autocompleteHub="/hubs/autocomplete"
        themesFolder="/themes/"
        deltaWidth={0}
        deltaHeight={0}
        controlActions={globalActions}
        returnToAppUrl="/"
        externalControlList={CustomControls}
        externalControlRender={CustomControlsRender}
    />,
    document.getElementById('content')
);




