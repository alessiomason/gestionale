import {Ticket} from "../../../server/src/tickets/tickets/ticket";
import {Card, Col, Row} from "react-bootstrap";
import "./TicketCompanyPane.css";
import dayjs from "dayjs";
import GlossyButton from "../buttons/GlossyButton";
import {HourglassBottom, HourglassSplit} from "react-bootstrap-icons";
import React from "react";

interface TicketBoxProps {
    readonly ticket: Ticket
    readonly setTicketToBeEnded: React.Dispatch<React.SetStateAction<Ticket | undefined>>

}

function TicketBox(props: TicketBoxProps) {
    const ticketDuration = dayjs.duration(dayjs(props.ticket.endTime).diff(dayjs(props.ticket.startTime)));

    return (
        <Card className="ticket-company-pane-card glossy-background mt-2 mb-2">
            <Card.Title>
                <Row className="d-flex align-items-center">
                    <Col>{props.ticket.title}</Col>
                    {!props.ticket.endTime && <Col className="d-flex justify-content-end">
                        <HourglassSplit/>
                    </Col>}
                </Row>
            </Card.Title>
            <Card.Subtitle>{props.ticket.description}</Card.Subtitle>
            <Card.Body>
                <p>Inizio: {dayjs(props.ticket.startTime).format("LL [alle] LT")}</p>
                <p>Durata: {ticketDuration.humanize()}{!props.ticket.endTime && " (in corso)"}</p>

                {!props.ticket.endTime && <Row className="mt-3">
                    <Col/>
                    <Col sm={8} className="d-flex justify-content-center">
                        <GlossyButton icon={HourglassBottom} onClick={() => props.setTicketToBeEnded(props.ticket)}>
                            Termina ticket
                        </GlossyButton>
                    </Col>
                    <Col/>
                </Row>}
            </Card.Body>
        </Card>
    );
}

export default TicketBox;