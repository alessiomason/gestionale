import {Button} from "react-bootstrap";
import "./Hamburger.css";

export type HamburgerType = "hamburger--3dx" |
    "hamburger--3dx-r" |
    "hamburger--3dy" |
    "hamburger--3dy-r" |
    "hamburger--3dxy" |
    "hamburger--3dxy-r" |
    "hamburger--arrow" |
    "hamburger--arrow-r" |
    "hamburger--arrowalt" |
    "hamburger--arrowalt-r" |
    "hamburger--arrowturn" |
    "hamburger--arrowturn-r" |
    "hamburger--boring" |
    "hamburger--collapse" |
    "hamburger--collapse-r" |
    "hamburger--elastic" |
    "hamburger--elastic-r" |
    "hamburger--emphatic" |
    "hamburger--emphatic-r" |
    "hamburger--minus" |
    "hamburger--slider" |
    "hamburger--slider-r" |
    "hamburger--spin" |
    "hamburger--spin-r" |
    "hamburger--spring" |
    "hamburger--spring-r" |
    "hamburger--stand" |
    "hamburger--stand-r" |
    "hamburger--squeeze" |
    "hamburger--vortex" |
    "hamburger--vortex-r";

interface HamburgerProps {
    readonly type: HamburgerType
    readonly isActive: boolean
    readonly onClick?: () => void
}

function Hamburger(props: HamburgerProps) {
    return (
        <Button type="button" className={`hamburger ${props.type} ${props.isActive ? "is-active" : undefined}`}
                onClick={props.onClick}>
            <span className="hamburger-box">
                <span className="hamburger-inner"/>
            </span>
        </Button>
    );
}

export default Hamburger;