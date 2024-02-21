import {Form, Row} from "react-bootstrap";
import React, {useState} from "react";
import {TicketCompany} from "../../../server/src/tickets/ticketCompanies/ticketCompany";
import {TicketOrder} from "../../../server/src/tickets/ticketOrders/ticketOrder";
import {Ticket} from "../../../server/src/tickets/tickets/ticket";

interface TicketCompanyPaneProps {
    readonly ticketCompany: TicketCompany
}

function TicketCompanyPane(props: TicketCompanyPaneProps) {
    const [ticketOrders, setTicketOrders] = useState<TicketOrder[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [dirty, setDirty] = useState(true);
    
    return (
        <Form>
            <Row className="glossy-background">
                <Row>
                    <h3>{props.ticketCompany.name}</h3>
                </Row>


            </Row>
        </Form>
    );
}

export default TicketCompanyPane;