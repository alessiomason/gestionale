import {createElement, MouseEvent} from "react";
import {Button} from "react-bootstrap";
import {Icon} from "react-bootstrap-icons";
import "./Buttons.css";

interface GlossyButtonProps {
    readonly children?: string
    readonly type?: "submit" | "reset" | "button"
    readonly icon: Icon
    readonly secondaryIcon?: Icon
    readonly className?: string
    readonly onClick: (() => void) | ((event: MouseEvent<HTMLButtonElement>) => void)
}

function GlossyButton(props: GlossyButtonProps) {
    const iconMargin = props.children ? "me-1" : "";
    const secondaryIconMargin = props.children ? "ms-1" : "";

    return (
        <Button type={props.type}
                className={`glossy-button d-flex justify-content-center align-items-center ${props.className}`}
                onClick={props.onClick}>
            {createElement(props.icon, {className: iconMargin})}
            {props.children}
            {props.secondaryIcon && createElement(props.secondaryIcon, {className: secondaryIconMargin})}
        </Button>
    );
}

export default GlossyButton;