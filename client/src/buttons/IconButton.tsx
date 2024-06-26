import {createElement, MouseEvent} from "react";
import {Button} from "react-bootstrap";
import {Icon} from "react-bootstrap-icons";

interface IconButtonProps {
    readonly icon: Icon
    readonly type?: "submit" | "reset" | "button"
    readonly className?: string
    readonly onClick: (() => void) | ((event: MouseEvent<HTMLButtonElement>) => void)
}

function IconButton(props: IconButtonProps) {
    return (
        <Button type={props.type} className={`text-button ${props.className}`} onClick={props.onClick}>
            {createElement(props.icon)}
        </Button>
    );
}

export default IconButton;