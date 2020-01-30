import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { DWKitForm } from "./../../scripts/optimajet-form.js"
import {ApplicationRouter, NotificationComponent, FormContent,
    FlowContent, Thunks, Store, Actions, SignalRConnector, StateBindedForm, API} from './../../scripts/optimajet-app.js'
import {CustomControls, CustomControlsRender} from './controls/CustomControlsInit.jsx';
import {CustomUserForms} from './controls/CustomUserForms.jsx';

window.DWKitFormSettings = {
    externalControlList: CustomControls,
    externalControlRender: CustomControlsRender
};

Store.getState().settings.userForms = CustomUserForms;
Store.dispatch(Actions.app.impersonateduseridfromurl());

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pagekey: 0,
            resourcesLoaded: false
        };

        //API.setAuth("cookie");

        let me = this;
        Store.dispatch(Thunks.userinfo.fetch(function (){
            me.state.user = Store.getState().app.user;
            me.loadResources();
        }));

        window.DWKitApp = this;
        window.DWKitApp.API = API;
    }

    render(){
        let sectorprops = {
            eventFunc: this.actionsFetch.bind(this),
            getAdditionalDataForControl: this.additionalFetch.bind(this, undefined)
        };

        let state = Store.getState();
        let user = state.app.user;

        if (!this.state.user || !this.state.resourcesLoaded){
            return null;
        }

        let currentEmployee = state.app.impersonatedUserId ? state.app.impersonatedUserId : user.id;

        return <div className="dwkit-wrapper" key={this.state.pagekey}>
            <Provider store={Store}>
                <StateBindedForm {...sectorprops} formName="header" stateDataPath="app.extra" data={{ currentUser: user.name, currentEmployee: currentEmployee }} modelurl="/ui/form/header" />
            </Provider>
            <div className="dwkit-container">
                <Provider store={Store}>
                    <StateBindedForm className="dwkit-sidebar-container" {...sectorprops} formName="sidebar" stateDataPath="app.extra" data={{currentEmployee: currentEmployee}} modelurl="/ui/form/sidebar" />
                </Provider>
                <div className="dwkit-content">
                    <Provider store={Store}>
                        <BrowserRouter>
                            <div className="dwkit-content-form">
                                <ApplicationRouter onReload={this.onRefresh.bind(this, true)} onRefresh={this.onRefresh.bind(this, false)} />
                                <NotificationComponent
                                    onFetchStarted={this.onFetchStarted.bind(this)}
                                    onFetchFinished={this.onFetchFinished.bind(this)}/>
                                <Switch>
                                    <Route path='/form' component={FormContent}  />
                                    <Route path='/flow' component={FlowContent}  />
                                    <Route exact path='/'>
                                        <FormContent formName={this.props.defaultForm ? this.props.defaultForm : this.state.user.defaultForm} />
                                    </Route>
                                    <Route path='/account/logoff' render={() => {
                                        Store.logoff();
                                        return null;
                                    }} />
                                    <Route nomatch render={() => {
                                        //Hack for back button
                                        let url = window.location.href;
                                        window.location.href = url;
                                        return null;
                                    }} />
                                </Switch>
                            </div>
                        </BrowserRouter>
                    </Provider>
                </div>
            </div>
            <DWKitForm {...sectorprops} className="dwkit-footer" formName="footer" modelurl="/ui/form/footer" />
        </div>;
    }

    onFetchStarted() {
        Pace.start();
        $('body').loadingModal({
            text: 'Loading...',
            animation: 'foldingCube',
            backgroundColor: '#1262E2'});
    }

    onFetchFinished() {
        Pace.stop();
        $('body').loadingModal('destroy');
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

    actionsFetch(args){
        Store.dispatch(Thunks.form.executeActions(args));
    }

    additionalFetch(formName, controlRef, { startIndex, pageSize, filters, sort, model }, callback) {
        Store.dispatch(Thunks.additional.fetch({
                type: controlRef.props["data-buildertype"],
                formName, controlRef, startIndex, pageSize, filters, sort, callback
            }
        ));
    }

    loadResources(){
        this.loadStaticResources();

        var me = this;
        var resources = [
            "/ui/localization.js",
            "/ui/form/businessobjects.js"
        ];

        var count = resources.length;
        let updateFunc = function(){
            count--;
            if(count == 0){
                me.setState({
                    resourcesLoaded: true
                })
            }
        }

        resources.forEach(function(item){
            API.loadBackendScript(item, {}, updateFunc);
        });

        if(resources.length == 0){
            me.setState({
                resourcesLoaded: true
            });
        }
    }

    loadStaticResources(){
        var appendLinkCss = function(href){
            var body = document.getElementsByTagName('body')[0];
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = href;
            body.appendChild(link);
        };

        if(this.state.user.isRTL){
            appendLinkCss('/css/dwkit-style.rtl.css');
        }

        if(this.state.user.theme){
            var theme = this.state.user.theme;
            $.getJSON("/themes/theme_manifest.json", function(json) {
                if(Array.isArray(json.themes)){
                    json.themes.forEach(function(item){
                        if(item.name == theme && Array.isArray(item.files)){
                            item.files.forEach(function(file){
                                appendLinkCss('/themes/' + file);
                            });
                        }
                    })
                }
            });
        }
    }
}

SignalRConnector.Connect(Store);

var contentDiv = document.getElementById('content');
render(<App defaultForm={contentDiv.getAttribute("data-defaultform")} />, contentDiv);

