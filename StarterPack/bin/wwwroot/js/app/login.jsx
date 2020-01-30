import React from 'react';
import { render } from 'react-dom';
import { DWKitForm } from "./../../scripts/optimajet-form";
import {CustomControls, CustomControlsRender} from './controls/CustomControlsInit.jsx';

window.DWKitFormSettings = {
    externalControlList: CustomControls,
    externalControlRender: CustomControlsRender
};

import 'url-search-params-polyfill';


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                remember: true,
                externals: []
            }
        };

        this.getExternalProviders();
    }

    getExternalProviders() {

        $.getJSON(
            "/account/external", (response) => {

                const data = { ...this.state.data };
                data.externals = response;

                this.setState({
                    data
                });

            }).fail(() => {
                const msg = "Error on the server! Please, check server's configuration and the connection to DB. More information in the application log or Event Viewer.";
                alert(msg);
            });
    }

    eventHandler(args){
        if (Array.isArray(args.actions)) {
            args.actions.forEach((a) => {
                if (a === "login") {
                    this.onLogin();
                } else if (a === "external") {

                    let newLocation = `/external/challenge?name=${args.parameters.row.name}`;

                    const urlParams = new URLSearchParams(location.search);

                    for (let key of urlParams.keys()) {
                        if (key.toLowerCase() === 'returnurl') {
                            newLocation = newLocation + `&returnUrl=${encodeURIComponent(urlParams.get(key))}`;
                            break;
                        }
                    }

                    location.href = newLocation;
                }
            });
        }
        return false;
    }

    validate(){
        var res = true;
        var editrow = this.state.data;
        var msgRequiredField = "This field is required";
        this.state.errors = {
            login: (editrow.login == undefined || editrow.login == "") ? msgRequiredField : undefined,
            password: (editrow.password == undefined || editrow.password == "") ? msgRequiredField : undefined
        };

        res &= this.state.errors.login == undefined && this.state.errors.password == undefined;
        return res;
    }

    onLogin() {
        if (!this.validate()) {
            alertify.error("Check errors on this form!");
        }
        else {
            var me = this;
            var data = new Array();
            data.push({name: 'login', value: this.state.data.login});
            data.push({name: 'password', value: this.state.data.password});
            data.push({name: 'remember', value: this.state.data.remember});
            $.ajax({
                url: "/account/login",
                data: data,
                async: true,
                type: "post",
                success: function (response) {
                    if (response.success) {
                        me.redirectToApp();
                    }
                    else {
                        alertify.error(response.message);
                        me.setState({errors:{
                            login:true,
                            password: true}
                        });
                    }
                },
                error: function (jqXHR, exception) {
                    var msg = "Error on the server! Please, check server's configuration and the connection to DB. More information in the application log or Event Viewer.";
                    alert(msg);
                }
            });
        }
        this.forceUpdate();
    }

    redirectToApp() {

        let newLocation = '/';

        const urlParams = new URLSearchParams(location.search);

        for (let key of urlParams.keys()) {
            if (key.toLowerCase() === 'returnurl') {
                newLocation = urlParams.get(key);
                break;
            }
        }

        window.location = newLocation;
    }

     getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
     }

    render() {
        let sectorprops = {
            eventFunc: this.eventHandler.bind(this)
        };

        return <DWKitForm {...sectorprops}
            formName="login"
            modelurl="/ui/login"
            data={this.state.data}
            errors={this.state.errors}
            className="dwkit-application-login" />;
    }
}

render(<Login/>,document.getElementById('content'));
