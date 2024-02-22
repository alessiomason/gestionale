import {ProgressBar} from "react-bootstrap";
import {TicketCompany} from "../models/ticketCompany";
import {humanize} from "../functions";

interface TicketCompanyHoursProgressProps {
    ticketCompany: TicketCompany
}

function TicketCompanyHoursProgress(props: TicketCompanyHoursProgressProps) {
    return (
        <ProgressBar now={props.ticketCompany.usedHoursProgress}
                     label={`${humanize(props.ticketCompany.usedHoursProgress, 2)}%`}/>
    );
}

export default TicketCompanyHoursProgress;