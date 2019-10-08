import React from 'react'
import { render } from 'react-dom'
import DWKitAdmin from './../../scripts/optimajet-admin.js'

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
    'workflowShowCommandForm',
    'workflowContinueExecution',
    'workflowCancelExecution',
    'refresh',
    'confirm',
    'createElement',
    'changeModel',
    'reload',
    'copy'];

render(
    <DWKitAdmin
        apiUrl="/configapi"
        workflowApi="/workflow/designerapi"
        imageFolder="/images/"
        localizationFolder="/localization/"
        themesFolder="/themes/"
        deltaWidth={0}
        deltaHeight={0}
        controlActions={globalActions}
        returnToAppUrl="/"
    />,
    document.getElementById('content')
);




