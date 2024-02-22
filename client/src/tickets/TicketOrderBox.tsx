import {Card} from "react-bootstrap";
import {TicketOrder} from "../../../server/src/tickets/ticketOrders/ticketOrder";
import {humanize} from "../functions";
import dayjs from "dayjs";
import "./TicketCompanyPane.css";

interface TicketOrderBoxProps {
    readonly ticketOrder: TicketOrder
}

function TicketOrderBox(props: TicketOrderBoxProps) {
    return (
        <Card key={props.ticketOrder.id} className="ticket-company-pane-card glossy-background">
            <Card.Title>Ordine del {dayjs(props.ticketOrder.date).format("LL")}</Card.Title>
            <Card.Subtitle>{humanize(props.ticketOrder.hours, 2)} ore</Card.Subtitle>
        </Card>
    );
}

export default TicketOrderBox;