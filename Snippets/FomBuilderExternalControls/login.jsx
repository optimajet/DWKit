import React from 'react'
import { render } from 'react-dom'
import { DWKitForm } from "./../../scripts/optimajet-form.js"

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                remember: true
            }
        }
    }

    render(){
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

    eventHandler(args){
        var me = this;
        if (Array.isArray(args.actions)){
            args.actions.forEach(function (a) {
                if (a === "login"){
                    me.onLogin();
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
    
    onLogin(){
        if (this.validate() == false) {
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

    redirectToApp(){
        let returnUrl = this.getParameterByName("ReturnUrl");
        if (returnUrl != undefined){
            window.location = returnUrl;
        }
        else {
            window.location = '/';
        }
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
}

render(<Login/>,document.getElementById('content'));
