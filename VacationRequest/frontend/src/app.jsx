import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import moment from 'moment'
import {
    Actions,
    API,
    ApplicationRouter,
    DWKitAppForm,
    FlowContent,
    FormContent,
    WorkflowContent,
    NotificationComponent,
    SignalRConnector,
    StateBindedForm,
    Store,
    Thunks
} from '../scripts/optimajet-app';
import { CustomControls, CustomControlsRender } from './controls/CustomControlsInit';
import CustomUserForms from './controls/CustomUserForms';

window.DWKitFormSettings = {
    externalControlList: CustomControls,
    externalControlRender: CustomControlsRender
};

const backendUrl = process.env.REACT_APP_BACKEND_URL;
Store.getState().settings.backendUrl = backendUrl;
Store.getState().settings.userForms = CustomUserForms;

Store.dispatch(Actions.app.impersonateduseridfromurl());

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pagekey: 0,
            resourcesLoaded: false
        };

        let me = this;
        Store.dispatch(Thunks.userinfo.fetch(function () {
            me.state.user = Store.getState().app.user;
            me.loadResources();
        }));

        window.DWKitApp = this;
        window.DWKitApp.API = API;
        window.DWKitApp.Store = Store;
    }

    render() {
        let state = Store.getState();
        this.state.user = state.app.user;

        if (!this.state.user || !this.state.resourcesLoaded) {
            return null;
        }

        let currentEmployee = state.app.impersonatedUserId ? state.app.impersonatedUserId : this.state.user.id;
        let bindedFormData = {
            currentUser: this.state.user.name,
            currentEmployee: currentEmployee
        };

        return <div className="dwkit-wrapper" key={this.state.pagekey}>
            <Provider store={Store}>
                <StateBindedForm formName="header" stateDataPath="app.extra" data={bindedFormData}/>
            </Provider>
            <div className="dwkit-container">
                <Provider store={Store}>
                    <StateBindedForm className="dwkit-sidebar-container" formName="sidebar"
                                     stateDataPath="app.extra" data={bindedFormData} />
                </Provider>
                <div className="dwkit-content">
                    <Provider store={Store}>
                        <BrowserRouter>
                            <div className="dwkit-content-form">
                                <ApplicationRouter onReload={this.onRefresh.bind(this, true)}
                                                   onRefresh={this.onRefresh.bind(this, false)}/>
                                <NotificationComponent
                                    onFetchStarted={this.onFetchStarted.bind(this)}
                                    onFetchFinished={this.onFetchFinished.bind(this)}/>
                                <Switch>
                                    <Route path='/form' component={FormContent}/>
                                    <Route path='/flow' component={FlowContent}/>
                                    <Route path='/workflow' component={WorkflowContent}/>
                                    <Route exact path='/'>
                                        <FormContent
                                            formName={this.props.defaultForm ? this.props.defaultForm : this.state.user.defaultForm}/>
                                    </Route>
                                    <Route path='/admin' render={() => {
                                        return <div><a target="_blank" href={backendUrl + '/admin' + location.search}>Click
                                            here for opening Admin panel.</a></div>;
                                    }}/>
                                    <Route path='/account/logoff' render={() => {
                                        Store.logoff();
                                        return null;
                                    }}/>
                                </Switch>
                            </div>
                        </BrowserRouter>
                    </Provider>
                </div>
            </div>
            <DWKitAppForm className="dwkit-footer" formName="footer" data={bindedFormData}/>
        </div>;
    }

    onFetchStarted() {
        Pace.start();
        $('body').loadingModal({
            text: 'Loading...',
            animation: 'foldingCube',
            backgroundColor: '#1262E2'
        });
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

    actionsFetch(args) {
        Store.dispatch(Thunks.form.executeActions(args));
    }

    additionalFetch(formName, controlRef, { startIndex, pageSize, filters, sort, model }, callback) {
        Store.dispatch(Thunks.additional.fetch({
                type: controlRef.props['data-buildertype'],
                formName, controlRef, startIndex, pageSize, filters, sort, callback
            }
        ));
    }

    loadResources() {
        this.loadStaticResources();

        const me = this;
        const resources = [
            '/ui/localization.js',
            '/ui/form/businessobjects.js'
        ];

        let count = resources.length;
        let updateFunc = function () {
            count--;
            if (count === 0) {
                me.setState({
                    resourcesLoaded: true
                });

                if (window.DWKitLang && window.DWKitLang.common && window.DWKitLang.common.locale) {
                    let locale = window.DWKitLang.common.locale;
                    moment.locale(locale);
                }
            }
        }

        resources.forEach(function (item) {
            API.loadBackendScript(item, {}, updateFunc);
        });

        if (resources.length === 0) {
            me.setState({
                resourcesLoaded: true
            });
        }
    }

    loadStaticResources() {
        const appendLinkCss = function (href) {
            const body = document.getElementsByTagName('body')[0];
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = href;
            body.appendChild(link);
        };

        if (this.state.user.isRTL) {
            appendLinkCss('/css/dwkit-style.rtl.css');
        }

        if (this.state.user.theme) {
            const theme = this.state.user.theme;
            $.getJSON('/themes/theme_manifest.json', function (json) {
                if (Array.isArray(json.themes)) {
                    json.themes.forEach(function (item) {
                        if (item.name === theme && Array.isArray(item.files)) {
                            item.files.forEach(function (file) {
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
