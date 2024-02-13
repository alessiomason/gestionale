import {Icon} from "react-bootstrap-icons";
import {createElement, MouseEvent} from "react";
import {Button} from "react-bootstrap";

interface LightGlossyButtonProps {
    readonly children: string
    readonly icon: Icon
    readonly className?: string
    readonly onClick: (() => void) | ((event: MouseEvent<HTMLButtonElement>) => void)
}

function LightGlossyButton(props: LightGlossyButtonProps) {
    return (
        <Button className={`light-glossy-button d-flex justify-content-center align-items-center ${props.className}`} onClick={props.onClick}>
            {createElement(props.icon, {className: "me-1"})}
            {props.children}
        </Button>
    );
}

export default LightGlossyButton;