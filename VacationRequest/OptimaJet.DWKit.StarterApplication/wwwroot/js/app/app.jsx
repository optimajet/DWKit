import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { DWKitForm } from "./../../scripts/optimajet-form";
import {
    ApplicationRouter, NotificationComponent, FormContent,
    FlowContent, Thunks, Store, Actions, SignalRConnector, StateBindedForm, API
} from './../../scripts/optimajet-app';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pagekey: 0
        };

        let me = this;

        Store.dispatch(Thunks.userinfo.fetch(function () {
            me.forceUpdate();
        }));

        Store.dispatch(Actions.app.impersonateduseridfromurl());

        window.DWKitApp = this;
        window.DWKitApp.API = API;
        this.onFetchStarted();
    }

    render(){
        let sectorprops = {
            eventFunc: this.actionsFetch.bind(this),
            getAdditionalDataForControl: this.additionalFetch.bind(this, undefined)
        };

        let state = Store.getState();
        let user = state.app.user;
        if (user == undefined){
            user = {};
        }

        let currentEmployee = state.app.impersonatedUserId ? state.app.impersonatedUserId : user.id;

        return <div className="dwkit-application" key={this.state.pagekey}>
            <DWKitForm {...sectorprops} formName="header" data={{currentUser: user.name}} modelurl="/ui/form/header" />
            <div className="dwkit-application-basecontent">
                <Provider store={Store}>
                    <StateBindedForm {...sectorprops} formName="top" stateDataPath="app.extra" data={{currentEmployee: currentEmployee}} modelurl="/ui/form/top" />
                </Provider>
                <div className="dwkit-application-content">
                    <Provider store={Store}>
                        <BrowserRouter>
                            <div className="dwkit-application-content-form">
                                <ApplicationRouter onRefresh={this.onRefresh.bind(this)}/>
                                <NotificationComponent
                                    onFetchStarted={this.onFetchStarted.bind(this)}
                                    onFetchFinished={this.onFetchFinished.bind(this)}/>
                                <Switch>
                                    <Route path='/form' component={FormContent}  />
                                    <Route path='/flow' component={FlowContent}  />
                                    <Route exact path='/'>
                                        <FormContent formName="Documents" />
                                    </Route>
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
            <DWKitForm {...sectorprops} formName="footer" modelurl="/ui/form/footer" />
        </div>;
    }

    onFetchStarted(){
        Pace.start();
        $('body').loadingModal({
            text: 'Loading...',
            animation: 'foldingCube',
            backgroundColor: '#1262E2'});
    }

    onFetchFinished(){
        Pace.stop();
        $('body').loadingModal('destroy');
    }

    onRefresh(){
        this.onFetchStarted();
        Store.resetForm();
        this.setState({
            pagekey: this.state.pagekey + 1
        });
        SignalRConnector.Connect(Store);
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
}

SignalRConnector.Connect(Store);

render(<App/>,document.getElementById('content'));

