import {ProgressBar} from "react-bootstrap";
import {TicketCompany} from "../models/ticketCompany";

interface TicketCompanyHoursProgressProps {
    ticketCompany: TicketCompany
}

function TicketCompanyHoursProgress(props: TicketCompanyHoursProgressProps) {
    return (
        <ProgressBar now={props.ticketCompany.usedHoursProgress} label={`${props.ticketCompany.usedHoursProgress}%`}/>
    );
}

export default TicketCompanyHoursProgress;