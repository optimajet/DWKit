import React, { Component } from 'react';
import {View, Image } from 'react-native';
import { Button } from 'react-native-elements';
import { Store, StateBindedForm } from '../../scripts/optimajet-app';

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }; 
    }

    onLogin() {
        try {
            Store.login();          
        } catch (e) {
            console.warn(e);
        }
    }

    eventHandler(args){
        let me = this;
        if (Array.isArray(args.actions)) {
            if(args.actions.includes("login")){
                    me.onLogin();
            }
        }
        return false;
    }

    render() {
        // TODO In the next version, it will be replace to dwkit form
        let productLogo = {
            width: 220 ,
            height: 80,
            marginTop: '50%',
            marginBottom: 50
          };
        
        let companyLogo = {
            width: 100,
            height: 30,
            position: 'absolute',
            bottom: 20
        }
		
		
		return (<View style={{ flex: 1, alignItems: 'center', backgroundColor: 'white' }}>
		            <Image
		                style={productLogo}
		                source={require('./../../images/logo.png')}
		            />
		            <Button buttonStyle={{ width: 300 }} title={'Login'} onPress={this.onLogin.bind(this)}/>                  
		            <Image
		                style={companyLogo}
		                source={require('./../../images/optimajet.png')}
		            />
		        </View>);
    }
}
