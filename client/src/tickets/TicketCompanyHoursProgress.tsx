import {ProgressBar} from "react-bootstrap";
import {TicketCompany} from "../models/ticketCompany";
import {humanize} from "../functions";

interface TicketCompanyHoursProgressProps {
    ticketCompany: TicketCompany
}

function TicketCompanyHoursProgress(props: TicketCompanyHoursProgressProps) {
    return (
        <ProgressBar now={props.ticketCompany.remainingHoursPercentage}
                     label={`${Math.round(props.ticketCompany.remainingHoursPercentage)}%`}/>
    );
}

export default TicketCompanyHoursProgress;