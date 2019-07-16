import { BaseEditControl } from "./../../../scripts/optimajet-form";
import { Form, Button, Message } from 'semantic-ui-react';
import React from 'react';

export class CounterControl extends React.Component {

    constructor(props) {
        super(props);
    }

    changeValue(e, newValue) {
        const props = this.props;
        if (props.handleEvent) {
            props.handleEvent({ syntheticEvent: e, key: props.name, eventName: "onChange", name: props.name, value: newValue });
        }
    }

    onInc = (e) => {
        this.changeValue(e, this.getValue() + 1);
    }

    onDec = (e) => {
        this.changeValue(e, this.getValue() - 1);
    }

    getValue() {
        const data = this.props.data;
        return data ? data[this.props.name] : 0;
    }

    render() {

        const label = this.props.label ? <label>{this.props.label}</label> : null;

        return (
            <div className="field">
                {label}
                <Button.Group>
                    <Button content={this.props.incButtonText} onClick={this.onInc} />
                    <Button.Or text={this.getValue()} />
                    <Button content={this.props.decButtonText} onClick={this.onDec} />
                </Button.Group>
            </div>
        );
    }

}


export class CounterEditControl extends BaseEditControl {

    constructor(props) {
        super(props);
    }
 
    getGeneralDescription() {
        const data = this.props.data;
        const handleChange = this.props.parent.handleChange.bind(this.props.parent);

        return (<Form>
            <Form.Group widths="equal">
                <Form.Input name="key" label="Name" value={data.key} onChange={handleChange} />
                <Form.Input name="label" label="Label" value={data.label} onChange={handleChange} />
            </Form.Group>
            <Form.Group widths="equal">
                <Form.Input name="incButtonText" label="Inc button text" value={data.incButtonText} onChange={handleChange} />
                <Form.Input name="decButtonText" label="Dec button text" value={data.decButtonText} onChange={handleChange} />
            </Form.Group>
        
        </Form>);
    }


    getEventsList() {
        return ["onChange"];
    }

}