import {Card} from "react-bootstrap";
import {humanize} from "../../functions";
import dayjs from "dayjs";
import "../ticket-companies/TicketCompanyPane.css";
import {TicketOrder} from "../../models/ticketOrder";

interface TicketOrderBoxProps {
    readonly ticketOrder: TicketOrder
}

function TicketOrderBox(props: TicketOrderBoxProps) {
    return (
        <Card className="ticket-company-pane-card glossy-background mt-2 mb-2">
            <Card.Title>Ordine del {dayjs(props.ticketOrder.date).format("LL")}</Card.Title>
            <Card.Subtitle>{humanize(props.ticketOrder.hours, 2)} ore</Card.Subtitle>
        </Card>
    );
}

export default TicketOrderBox;