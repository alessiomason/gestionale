import {Card, Col, Row} from "react-bootstrap";
import "../ticket-companies/TicketCompanyPane.css";
import dayjs from "dayjs";
import GlossyButton from "../../buttons/GlossyButton";
import {HourglassBottom, HourglassSplit, PauseFill, PencilSquare, PlayFill} from "react-bootstrap-icons";
import React from "react";
import {Ticket} from "../../models/ticket";
import IconButton from "../../buttons/IconButton";
import ticketApis from "../../api/ticketApis";

interface TicketBoxProps {
    readonly ticket: Ticket
    readonly openTicketModal: (ticket: Ticket) => void
    readonly setTicketToBeEnded: React.Dispatch<React.SetStateAction<Ticket | undefined>>
    readonly setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>
    readonly setDirtyTicketCompanyProgress: React.Dispatch<React.SetStateAction<boolean>>
}

function TicketBox(props: TicketBoxProps) {
    let humanizedDuration = dayjs.duration(props.ticket.duration).humanize();
    if (humanizedDuration === "un' ora") {  // fix Dayjs' misspell
        humanizedDuration = "un'ora";
    }

    function pauseResumeTicket() {
        ticketApis.pauseResumeTicket(props.ticket.id)
            .then(ticket => {
                props.setTickets(tickets => {
                    const newTickets = [...tickets];
                    const index = newTickets.findIndex(t => t.id === ticket!.id);
                    if (index > -1) {
                        newTickets[index] = ticket!;
                    }
                    return newTickets;
                })
                props.setDirtyTicketCompanyProgress(true);
            })
    }

    return (
        <Card className="ticket-company-pane-card glossy-background mt-2 mb-2">
            <Card.Title>
                <Row className="d-flex align-items-center">
                    <Col>{props.ticket.title}</Col>
                    <Col className="d-flex justify-content-end align-items-center">
                        <IconButton icon={PencilSquare} onClick={() => props.openTicketModal(props.ticket)}/>
                        {!props.ticket.endTime && props.ticket.paused && <PauseFill/>}
                        {!props.ticket.endTime && !props.ticket.paused && <HourglassSplit/>}
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
                    <Col sm={7} className="d-flex justify-content-center">
                        <GlossyButton icon={props.ticket.paused ? PlayFill : PauseFill} className="w-100" onClick={pauseResumeTicket}>
                            {props.ticket.paused ? "Riprendi ticket" : "Ticket in pausa"}
                        </GlossyButton>
                    </Col>
                    <Col/>
                </Row>}
                {!props.ticket.endTime && <Row className="mt-3">
                    <Col/>
                    <Col sm={7} className="d-flex justify-content-center">
                        <GlossyButton icon={HourglassBottom} className="w-100"
                                      onClick={() => props.setTicketToBeEnded(props.ticket)}>
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