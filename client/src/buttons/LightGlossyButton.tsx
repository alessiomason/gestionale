import {createElement, MouseEvent} from "react";
import {Button} from "react-bootstrap";
import {Icon} from "react-bootstrap-icons";
import "./Buttons.css";

interface LightGlossyButtonProps {
    readonly children?: string
    readonly type?: "submit" | "reset" | "button"
    readonly icon: Icon
    readonly secondaryIcon?: Icon
    readonly singleLine?: boolean
    readonly className?: string
    readonly onClick: (() => void) | ((event: MouseEvent<HTMLButtonElement>) => void)
}

function LightGlossyButton(props: LightGlossyButtonProps) {
    const iconMargin = props.children ? "me-1" : "";
    const secondaryIconMargin = props.children ? "ms-1" : "";

    return (
        <Button type={props.type}
            className={`light-glossy-button d-flex justify-content-center align-items-center ${props.className} ${props.singleLine ? "single-line-button" : undefined}`}
            onClick={props.onClick}>
            {createElement(props.icon, {className: iconMargin})}
            {props.children}
            {props.secondaryIcon && createElement(props.secondaryIcon, {className: secondaryIconMargin})}
        </Button>
    );
}

export default LightGlossyButton;