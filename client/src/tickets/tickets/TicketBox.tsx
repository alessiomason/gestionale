import {Card, Col, Row} from "react-bootstrap";
import "../ticket-companies/TicketCompanyPane.css";
import dayjs from "dayjs";
import GlossyButton from "../../buttons/GlossyButton";
import {HourglassBottom, HourglassSplit, PencilSquare} from "react-bootstrap-icons";
import React from "react";
import {Ticket} from "../../models/ticket";
import IconButton from "../../buttons/IconButton";

interface TicketBoxProps {
    readonly ticket: Ticket
    readonly openTicketModal: (ticket: Ticket) => void
    readonly setTicketToBeEnded: React.Dispatch<React.SetStateAction<Ticket | undefined>>
}

function TicketBox(props: TicketBoxProps) {
    const ticketDuration = dayjs.duration(dayjs(props.ticket.endTime).diff(dayjs(props.ticket.startTime)));
    let humanizedDuration = ticketDuration.humanize();
    if (humanizedDuration === "un' ora") {  // fix Dayjs' misspell
        humanizedDuration = "un'ora";
    }

    return (
        <Card className="ticket-company-pane-card glossy-background mt-2 mb-2">
            <Card.Title>
                <Row className="d-flex align-items-center">
                    <Col>{props.ticket.title}</Col>
                    <Col className="d-flex justify-content-end align-items-center">
                        <IconButton icon={PencilSquare} onClick={() => props.openTicketModal(props.ticket)}/>
                        {!props.ticket.endTime && <HourglassSplit/>}
                    </Col>
                </Row>
            </Card.Title>
            <Card.Subtitle>{props.ticket.description}</Card.Subtitle>
            <Card.Body>
                <p>Inizio: {dayjs(props.ticket.startTime).format("LL [alle] LT")}</p>
                {props.ticket.endTime && <p>Fine: {dayjs(props.ticket.endTime).format("LL [alle] LT")}</p>}
                <p>Durata: {humanizedDuration}{!props.ticket.endTime && " (in corso)"}</p>

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