import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { DWKitForm } from "./../../scripts/optimajet-form.js"
import {ApplicationRouter, NotificationComponent, FormContent, 
    FlowContent, Thunks, Store, Actions} from './../../scripts/optimajet-app.js'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pagekey: 0
        };
        
        let me = this;
        Store.dispatch(Thunks.userinfo.fetch(function (){
            me.forceUpdate();
        }));
        
        window.DWKitApp = this;
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
                        <DWKitForm {...sectorprops} formName="top" modelurl="/ui/form/top"/>
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
                                                <FormContent formName="dashboard" />
                                            </Route>
                                            <Route nomatch render={() => {
                                                //Hack for back button
                                                let url = window.location.href;
                                                history.back();
                                                window.location.href = url;
                                                return null;
                                            }}/>
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
        $('body').loadingModal({
            text: 'Loading...',
            animation: 'foldingCube',
            backgroundColor: '#1262E2'});
    }

    onFetchFinished(){
        $('body').loadingModal('destroy');
    }

    onRefresh(){
        this.onFetchStarted();
        Store.resetForm();
        this.setState({
            pagekey: this.state.pagekey + 1
        })
    }

    actionsFetch(args){
        Store.dispatch(Thunks.form.executeActions(args));
    }

    additionalFetch(formName, controlRef, {startIndex, pageSize, filters, sort, model}, callback) {
        Store.dispatch(Thunks.additional.fetch({
                type: controlRef.props["data-buildertype"],
                formName, controlRef, startIndex, pageSize, filters, sort, callback
            }
        ));
    }
}

render(<App/>,document.getElementById('content'));


