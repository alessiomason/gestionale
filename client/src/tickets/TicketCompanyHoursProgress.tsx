import {ProgressBar} from "react-bootstrap";
import {TicketCompany} from "../models/ticketCompany";
import "./TicketCompanyHoursProgress.css";

interface TicketCompanyHoursProgressProps {
    readonly ticketCompany: TicketCompany
}

function TicketCompanyHoursProgress(props: TicketCompanyHoursProgressProps) {
    let className = "progress-bar-ok"
    if (props.ticketCompany.remainingHoursPercentage <= 10) {
        className = "progress-bar-red"
    } else if (props.ticketCompany.remainingHoursPercentage <= 15) {
        className = "progress-bar-warning"
    }

    return (
        <>
            <ProgressBar now={props.ticketCompany.remainingHoursPercentage}
                         label={`${Math.round(props.ticketCompany.remainingHoursPercentage)}%`}
                         className={className}/>

            <p className="mt-3">
                Usate {Math.round(props.ticketCompany.usedHours)} ore di {Math.round(props.ticketCompany.orderedHours)}
            </p>
            <p>
                Rimanenti: {Math.round(props.ticketCompany.remainingHours)} ({Math.round(props.ticketCompany.remainingHoursPercentage)}%)
            </p>
        </>
    );
}

export default TicketCompanyHoursProgress;