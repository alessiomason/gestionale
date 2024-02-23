import {ProgressBar} from "react-bootstrap";
import {TicketCompany} from "../models/ticketCompany";
import "./TicketCompanyHoursProgress.css";

interface TicketCompanyHoursProgressProps {
    ticketCompany: TicketCompany
}

function TicketCompanyHoursProgress(props: TicketCompanyHoursProgressProps) {
    let className = "progress-bar-ok"
    if (props.ticketCompany.remainingHoursPercentage <= 10) {
        className = "progress-bar-red"
    } else if (props.ticketCompany.remainingHoursPercentage <= 15) {
        className = "progress-bar-warning"
    }

    return (
        <ProgressBar now={props.ticketCompany.remainingHoursPercentage}
                     label={`${Math.round(props.ticketCompany.remainingHoursPercentage)}%`}
                     className={className}/>
    );
}

export default TicketCompanyHoursProgress;