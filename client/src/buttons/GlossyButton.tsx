import {createElement, MouseEvent} from "react";
import {Button} from "react-bootstrap";
import {Icon} from "react-bootstrap-icons";
import "./Buttons.css";

interface GlossyButtonProps {
    readonly children?: string
    readonly type?: "submit" | "reset" | "button"
    readonly icon: Icon
    readonly className?: string
    readonly onClick: (() => void) | ((event: MouseEvent<HTMLButtonElement>) => void)
}

function GlossyButton(props: GlossyButtonProps) {
    const margin = props.children ? "me-1" : "";

    return (
        <Button type={props.type}
                className={`glossy-button d-flex justify-content-center align-items-center ${props.className}`}
                onClick={props.onClick}>
            {createElement(props.icon, {className: margin})}
            {props.children}
        </Button>
    );
}

export default GlossyButton;