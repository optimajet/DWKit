import { CounterControl } from './counter';
import React from 'react';

export default function renderControls(parentComponent, control,
    {
        model, data, errors,
        parentItem,
        buildermode, children,
        handleEvent, getAdditionalDataForControl,
        readOnlyControls, readOnly,
        disableRefs,
        uploadUrl, downloadUrl, extendedData, controlsToReplace, needCheckReplace,
        eventOnEdit, eventOnDelete, eventOnCopy
    }) {

    const props = {
        key: model.key,
        name: model.key,
        "data-buildertype": model["data-buildertype"]
    };

    if (control === CounterControl) {

        props.incButtonText = model.incButtonText;
        props.decButtonText = model.decButtonText;
        props.label = model.label;
        props.handleEvent = handleEvent;
        props.data = data;

        return (<CounterControl {...props} />);
    }

    return null;

}