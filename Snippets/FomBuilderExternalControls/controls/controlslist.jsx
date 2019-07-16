import { CounterEditControl, CounterControl } from './counter';

const customControls = [
    { key: "externalControls", title: 'User Controls', isseparate: true, defaultopen: true },
    {
        key: "counter",
        title: 'Counter',
        control: CounterControl,
        editControl: CounterEditControl,
        defaultValues: { label: "Counter", incButtonText: "Inc", decButtonText: "Dec" }
    }
];

export default customControls;