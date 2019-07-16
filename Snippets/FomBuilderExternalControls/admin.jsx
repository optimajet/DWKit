import React from 'react';
import { render } from 'react-dom';
import DWKitAdmin from './../../scripts/optimajet-admin';
import renderControls from './controls/controlrenderer';
import customControls from './controls/controlslist';

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
    'workflowExecuteCommand',
    'workflowSetState',
    'refresh',
    'confirm',
    'createElement',
    'openModal',
    'selectWorkflowScheme'];

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
        externalControlList={customControls}
        externalControlRender={renderControls}
        externalControlsOnly
    />,
    document.getElementById('content')
);




