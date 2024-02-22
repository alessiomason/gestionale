import {Col, Form, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {TicketCompany} from "../../../server/src/tickets/ticketCompanies/ticketCompany";
import {TicketOrder} from "../../../server/src/tickets/ticketOrders/ticketOrder";
import {Ticket} from "../../../server/src/tickets/tickets/ticket";
import ticketApis from "../api/ticketApis";
import ticketOrderApis from "../api/ticketOrderApis";
import LightGlossyButton from "../buttons/LightGlossyButton";
import {PlusCircle} from "react-bootstrap-icons";
import TicketBox from "./TicketBox";
import TicketOrderBox from "./TicketOrderBox";

interface TicketCompanyPaneProps {
    readonly ticketCompany: TicketCompany
}

function TicketCompanyPane(props: TicketCompanyPaneProps) {
    const [ticketOrders, setTicketOrders] = useState<TicketOrder[]>([]);
    const [dirtyTicketOrders, setDirtyTicketOrders] = useState(true);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [dirtyTickets, setDirtyTickets] = useState(true);

    useEffect(() => {
        if (dirtyTickets) {
            ticketApis.getTickets(props.ticketCompany.id)
                .then(tickets => {
                    setTickets(tickets);
                    setDirtyTickets(false);
                })
                .catch(err => console.error(err))
        }
    }, [dirtyTickets]);

    useEffect(() => {
        if (dirtyTicketOrders) {
            ticketOrderApis.getTicketOrders(props.ticketCompany.id)
                .then(ticketOrders => {
                    setTicketOrders(ticketOrders);
                    setDirtyTicketOrders(false);
                })
        }
    }, [dirtyTicketOrders]);

    return (
        <Form>
            <Row className="glossy-background">
                <Row>
                    <h3>{props.ticketCompany.name}</h3>
                </Row>

                <Row>
                    <Col className="me-3">
                        <Row className="d-flex align-items-center mb-3">
                            <Col>
                                <h4>Ordini</h4>
                            </Col>
                            <Col className="d-flex justify-content-end">
                                <LightGlossyButton icon={PlusCircle} onClick={() => {}}>
                                    Nuovo ordine
                                </LightGlossyButton>
                            </Col>
                        </Row>

                        <Row>
                            {ticketOrders.map(ticketOrder => {
                                return (
                                  <TicketOrderBox ticketOrder={ticketOrder}/>
                                );
                            })}
                        </Row>
                    </Col>

                    <Col className="ms-3">
                        <Row className="d-flex align-items-center mb-3">
                            <Col>
                                <h4>Ticket</h4>
                            </Col>
                            <Col className="d-flex justify-content-end">
                                <LightGlossyButton icon={PlusCircle} onClick={() => {}}>
                                    Nuovo ticket
                                </LightGlossyButton>
                            </Col>
                        </Row>

                        <Row>
                            {tickets.map(ticket => {
                                return (
                                  <TicketBox ticket={ticket}/>
                                );
                            })}
                        </Row>
                    </Col>
                </Row>
            </Row>
        </Form>
    );
}

export default TicketCompanyPane;