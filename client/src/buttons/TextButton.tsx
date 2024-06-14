import {createElement, MouseEvent} from "react";
import {Button} from "react-bootstrap";
import {Icon} from "react-bootstrap-icons";

interface TextButtonProps {
    readonly children?: string
    readonly icon: Icon
    readonly className?: string
    readonly onClick: (() => void) | ((event: MouseEvent<HTMLButtonElement>) => void)
}

function TextButton(props: TextButtonProps) {
    const margin = props.children ? "me-1" : "";

    return (
        <Button className={`text-button d-flex justify-content-center align-items-center ${props.className}`}
                onClick={props.onClick}>
            {createElement(props.icon, {className: margin})}
            {props.children}
        </Button>
    );
}

export default TextButton;