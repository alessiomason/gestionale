import {createElement, MouseEvent} from "react";
import {Button} from "react-bootstrap";
import {Icon} from "react-bootstrap-icons";

interface TextButtonProps {
    readonly children?: string
    readonly type?: "submit" | "reset" | "button"
    readonly icon: Icon
    readonly secondaryIcon?: Icon
    readonly className?: string
    readonly onClick: (() => void) | ((event: MouseEvent<HTMLButtonElement>) => void)
}

function TextButton(props: TextButtonProps) {
    const iconMargin = props.children ? "me-1" : "";
    const secondaryIconMargin = props.children ? "ms-1" : "";

    return (
        <Button type={props.type}
                className={`text-button d-flex justify-content-center align-items-center ${props.className}`}
                onClick={props.onClick}>
            {createElement(props.icon, {className: iconMargin})}
            {props.children}
            {props.secondaryIcon && createElement(props.secondaryIcon, {className: secondaryIconMargin})}
        </Button>
    );
}

export default TextButton;