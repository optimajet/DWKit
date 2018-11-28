import React from 'react'
import { render } from 'react-dom'
import DWKitAdmin from './../../scripts/optimajet-admin.js'

let globalActions = [
    'validate',
    'save',
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
    'workflowExecuteCommand',
    'workflowSetState',
    'refresh',
    'confirm',
    'createElement'];

render(
    <DWKitAdmin
        apiUrl="/configapi"
        workflowApi="/workflow/designerapi"
        imageFolder="/images/"
        localizationFolder="/localization/"
        deltaWidth={0}
        deltaHeight={0}
        controlActions={globalActions}
        returnToAppUrl="/"
    />,
    document.getElementById('content')
);




