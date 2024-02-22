import {Ticket} from "../../../server/src/tickets/tickets/ticket";
import {Card} from "react-bootstrap";
import "./TicketCompanyPane.css";
import dayjs from "dayjs";

interface TicketBoxProps {
    readonly ticket: Ticket
}

function TicketBox(props: TicketBoxProps) {
    const ticketDuration = dayjs.duration(dayjs(props.ticket.endTime).diff(dayjs(props.ticket.startTime)));

    return (
        <Card key={props.ticket.id} className="ticket-company-pane-card glossy-background mt-2 mb-2">
            <Card.Title>{props.ticket.title}</Card.Title>
            <Card.Subtitle>{props.ticket.description}</Card.Subtitle>
            <Card.Body>
                <p>Inizio: {dayjs(props.ticket.startTime).format("LL [alle] LT")}</p>
                <p>Durata: {ticketDuration.humanize()}</p>
            </Card.Body>
        </Card>
    );
}

export default TicketBox;