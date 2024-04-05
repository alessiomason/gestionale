import {Icon} from "react-bootstrap-icons";
import {createElement, MouseEvent} from "react";
import {Button} from "react-bootstrap";
import "./Buttons.css";

interface LightGlossyButtonProps {
    readonly children: string
    readonly icon: Icon
    readonly singleLine?: boolean
    readonly className?: string
    readonly onClick: (() => void) | ((event: MouseEvent<HTMLButtonElement>) => void)
}

function LightGlossyButton(props: LightGlossyButtonProps) {
    return (
        <Button
            className={`light-glossy-button d-flex justify-content-center align-items-center ${props.className} ${props.singleLine ? "single-line-button" : undefined}`}
            onClick={props.onClick}>
            {createElement(props.icon, {className: "me-1"})}
            {props.children}
        </Button>
    );
}

export default LightGlossyButton;