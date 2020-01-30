// TODO: Here you can add your custom controls
// Read documentation: https://dwkit.com/documentation/forms/custom-components/

import React from 'react';
//import {YourControl, YourControlEditControl} from './customcontrol.jsx'

let CustomControls = [
//    {key: "sepCustomContainers", title: 'Custom Controls', isseparate: true, defaultopen: true},
//    {key: "yourcontrol", title: 'Your Control', control: YourControl, editControl: YourControlEditControl},
];

let CustomControlsRender = function(parentComponent, control, args){
    let res = undefined;

//  if (control === YourControl){
//      args.controlProps.label = args.model.label;
//      res = <YourControl {...args.controlProps} handleEvent={args.handleEvent}/>;
//  }

    return res;
};

module.exports = {CustomControls, CustomControlsRender};
