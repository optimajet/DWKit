import React, { Component } from 'react';
import { Provider } from 'react-redux';
import {TouchableHighlight, SafeAreaView} from 'react-native';
import {View, ActivityIndicator, Text} from 'react-native';
import JSON5 from 'json5';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeProvider } from 'react-native-elements';
import builderTheme from './../builder-theme';
import { ApplicationProvider, IconRegistry  } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { default as themeMapping } from './theme/evaThemeMapping.json';
import { default as dwkitOrangeTheme } from './theme/dwkitOrangeTheme.json';
import * as eva from '@eva-design/eva';

import { NavigationContainer } from '@react-navigation/native';
import Config from "react-native-config";
import {
    Actions,
    API,
    ApplicationRouter,
    ScreenContent,
    FormContent,
    FlowContent,
    NotificationComponent,
    SignalRConnector,
    StateBindedForm,
    Store,
    Thunks,
    navigate, 
    navigationRef
} from '../scripts/optimajet-app';

import LoginScreen from './screens/login';
import { CustomControls, CustomControlsRender } from './controls/CustomControlsInit';
import CustomUserForms from './controls/CustomUserForms';
import { LogBox } from 'react-native';
import { debug } from 'react-native-reanimated';
LogBox.ignoreLogs(['Require cycle:', 
    'VirtualizedList', 
    'Warning: Each child in a list should have a unique',
    'Warning: Cannot update during an existing state',
    'Animated: `useNativeDriver` was not specified',
    'Warning: Failed child context type: Invalid child context `virtualizedCell.cellKey`',
    'Warning: Can\'t perform a React state update on an unmounted']);

window.DWKitFormSettings = {
    externalControlList: CustomControls,
    externalControlRender: CustomControlsRender
};

const backendUrl = Config.REACT_APP_BACKEND_URL;
const settings = Store.getState().settings;
settings.backendUrl = backendUrl;
settings.userForms = CustomUserForms;

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pagekey: 0,
            resourcesLoaded: false,
            menu: [],
            initialRouteName: "dashboard",
            isSignedIn: false
        };

        this.subscribeRouterEvents();
       
        window.DWKitApp = this;
        window.DWKitApp.backendUrl = backendUrl;
        window.DWKitApp.API = API;
        window.DWKitApp.Store = Store;
    }

    componentDidMount(){
        this.restoreUser();
    }

    render() {
        if(!this.state.isSignedIn){
            return this.renderLogin();
        }

        return <ThemeProvider theme={builderTheme}>
            <IconRegistry icons={EvaIconsPack} />
            <ApplicationProvider {...eva} theme={dwkitOrangeTheme} customMapping={themeMapping}>
                <Provider store={Store}>
                <>
                    <NotificationComponent
                            onFetchStarted={this.onFetchStarted.bind(this)}
                            onFetchFinished={this.onFetchFinished.bind(this)}/>
                    <ApplicationRouter 
                        onReload={this.onRefresh.bind(this, true)} 
                        onRefresh={this.onRefresh.bind(this, false)}>                    
                        <NavigationContainer ref={navigationRef}>
                            {this.renderNavigator()}
                        </NavigationContainer>
                    </ApplicationRouter>                            
                </>
                </Provider>
            </ApplicationProvider>
        </ThemeProvider>;
    }

    renderNavigator(){
        let me = this;
        let menuItems = [];

        let navigatorProps = {
            initialRouteName: this.state.initialRouteName,
        };

        let menu = this.state.menu;
        let user = this.state.user;
        if(user.mobileNavigationType == "stack"){
            this.NavigatorElement = createStackNavigator();
        }
        else if(user.mobileNavigationType == "drawer"){                
            this.NavigatorElement = createDrawerNavigator();
        }
        else if(user.mobileNavigationType == "tabs") {
            this.NavigatorElement = createBottomTabNavigator();
            navigatorProps.tabBarOptions= {
                activeTintColor: 'tomato',
                inactiveTintColor: 'gray',
            };

            navigatorProps.screenOptions = ({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'dashboard';
                    if(Array.isArray(menu)){
                        menu.forEach(function(item){
                            if(item.name == route.name && item.icon){
                                iconName = item.icon;
                            }
                        });
                    }

                    return <Icons name={iconName} size={size} color={color} />;
                }
            });
        }
        else{
            this.NavigatorElement = createStackNavigator();
        }

        let navigator = this.NavigatorElement;
        if(Array.isArray(menu) && menu.length > 0){
            menu.forEach(function(item){
                let name = item.name;
                let title = item.title ? item.title : item.name;
                let target = (item.target && item.target !== "/") ? item.target : me.state.defaultForm;
                menuItems.push(<navigator.Screen name={name} options={{ title: title, tabBarLabel: title }}
                    listeners={({ navigation, route }) => ({
                        focus: () => {
                            Store.switchSceen(route.name);
                            Store.saveStateToStorage();        
                        }
                      })}
                >
                    {props => <ScreenContent 
                        {...props} 
                        screenName={name} 
                        key={name} 
                        title={title} 
                        baseLocation={target}
                        activityIndicator={(ps)=> me.renderActivityIndicator()}
                        />}
                </navigator.Screen>);
            });
        }
        else{
            menuItems.push(<navigator.Screen name="dashboard" options={{ 
                title: "Dashboard",
                headerRight: () => (
                    <TouchableHighlight onPress={() => Store.logoff() } style={{marginRight:20}}>
                        <Icons name="logout" size={24} />
                    </TouchableHighlight>)
                }}>
                {props => <ScreenContent 
                    {...props}
                    key="dashboard"
                    baseLocation={this.state.defaultForm}
                    activityIndicator={(ps)=> me.renderActivityIndicator()}/>}
            </navigator.Screen>);
        }

        return <navigator.Navigator {...navigatorProps}>{menuItems}</navigator.Navigator>;
    }

    renderLogin(){
        return  <Provider store={Store}>
            <>
                {this.state.loading && this.renderActivityIndicator()}
                <NotificationComponent 
                    onFetchStarted={this.onFetchStarted.bind(this)}
                    onFetchFinished={this.onFetchFinished.bind(this)}/>
                <LoginScreen backendUrl={backendUrl} />
            </>
        </Provider>;
    }

    onFetchStarted() {
        if(!this.state.isSignedIn)
            this.setState({loading: true});
    }

    onFetchFinished() {
        if(!this.state.isSignedIn)
            this.setState({loading: false});
    }

    onRefresh(reload) {
        Store.resetForm(reload);
        this.setState({
            pagekey: this.state.pagekey + 1
        });
        if (reload) {
             SignalRConnector.Connect(Store);
        }
    }

    renderActivityIndicator(){
        let loadingStyle = {
            position: 'absolute',
            zIndex: 9999,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center'
        };
        return <View style={loadingStyle}>
                <ActivityIndicator size='large' animating={true} color={"red"} />
            </View>;
    }

    onUserLoaded(user){
        let statechanges = {
            user: user,
            defaultForm: user.defaultMobileForm ? user.defaultMobileForm : "dashboard",
            isSignedIn: true
        }
        
        this.NavigatorElement = undefined;
        if(user.mobileMenuElements){
            try{
                statechanges.menu = JSON5.parse(user.mobileMenuElements);
            }
            catch(error){  
                statechanges.menu = [];        
            }
        }

        let state = Store.getState();
        if(state.router.screen){
            statechanges.initialRouteName = state.router.screen;
        }
        else{
            Store.setScreen(this.state.initialRouteName);
        }

        this.setState(statechanges);        
        Store.saveStateToStorage();
        this.loadResources();

        SignalRConnector.Connect(Store);  
    }

    subscribeRouterEvents(){
        let me = this;
        var settings = Store.getState().settings;
        if(!settings.router)
            settings.router = {};

        settings.router.userLoaded = function (user) {
            me.onUserLoaded(user);                      
        };

        settings.router.signoutRedirect = function(){
            me.setState({
                user: null,
                defaultForm: null,
                isSignedIn: false
            });
        };
    }

    restoreUser(){
        let me = this;
        me.onFetchStarted();
        try{
            Store.loadStateFromStorage().then((state) => {  
                me.onFetchFinished();                
            }).catch((error) => {
                me.onFetchFinished();
            });
        }
        catch(error){
            me.onFetchFinished();
        }
    }

    loadResources() {
        const me = this;
        const resources = [
            '/ui/localization.js',
            '/ui/form/businessobjects.js?mobile=true'
        ];

        let updateFunc = function () {           
        }

        resources.forEach(function (item) {
            API.loadBackendScript(item, {}, updateFunc);
        });
    }
}