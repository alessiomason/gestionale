import "./SwitchToggle.css";

interface SwitchToggleProps {
    readonly id: string
    readonly isOn: boolean
    readonly handleToggle: () => void
}

// from https://upmostly.com/tutorials/build-a-react-switch-toggle-component
function SwitchToggle(props: SwitchToggleProps) {
    return (
        <>
            <input
                checked={props.isOn}
                onChange={props.handleToggle}
                className="react-switch-checkbox"
                id={props.id}
                type="checkbox"
            />
            <label
                className={"react-switch-label" + (props.isOn ? " active-label" : "")}
                htmlFor={props.id}
            >
                <span className={`react-switch-button`}/>
            </label>
        </>
    );
}

export default SwitchToggle;