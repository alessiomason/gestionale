import {Card, Col, Form, Modal, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {HourglassBottom} from "react-bootstrap-icons";
import GlossyButton from "../../buttons/GlossyButton";
import dayjs from "dayjs";
import "./NewTicketModal.css";
import {Ticket} from "../../models/ticket";
import ticketApis from "../../api/ticketApis";

interface CloseTicketModalProps {
    readonly ticketToBeClosed: Ticket | undefined
    readonly setTicketToBeClosed: React.Dispatch<React.SetStateAction<Ticket | undefined>>
    readonly setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>
    readonly setDirtyTicketCompanyProgress: React.Dispatch<React.SetStateAction<boolean>>
}

function CloseTicketModal(props: CloseTicketModalProps) {
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [adjustedDate, setAdjustedDate] = useState("");
    const [adjustedTime, setAdjustedTime] = useState("");
    const [useCurrentTime, setUseCurrentTime] = useState(true);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined = undefined;

        if (props.ticketToBeClosed) {
            intervalId = setInterval(() => {
                setCurrentTime(dayjs());
            }, 1000)

            return () => clearInterval(intervalId);
        } else {
            clearInterval(intervalId);
        }
    }, [props.ticketToBeClosed])

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        const adjusted = dayjs(`${adjustedDate} ${adjustedTime}`, "YYYY-MM-DD HH:mm");

        ticketApis.closeTicket(props.ticketToBeClosed!.id, useCurrentTime ? undefined : adjusted.format())
            .then(ticket => {
                props.setTickets(tickets => {
                    const newTickets = tickets;
                    const index = newTickets.findIndex(t => t.id === ticket!.id);
                    newTickets[index] = ticket!;
                    return newTickets;
                });
                props.setDirtyTicketCompanyProgress(true);
                hide();
            })
            .catch(err => console.error(err))
    }

    function hide() {
        props.setTicketToBeClosed(undefined);

        setAdjustedDate("");
        setAdjustedTime("");
        setUseCurrentTime(true);
    }

    return (
        <Modal show={props.ticketToBeClosed !== undefined} onHide={hide} size="lg" centered>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>Termina ticket</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <h3>{props.ticketToBeClosed?.title}</h3>
                        <p>{props.ticketToBeClosed?.description}</p>
                        <p>Azienda: {props.ticketToBeClosed?.company.name}</p>
                    </Row>

                    <Row>
                        <Col md={6} className="d-flex justify-content-center">
                            <Card className={"date-time-card " + (useCurrentTime ? "selected-card" : "deselected-card")}
                                  onClick={() => setUseCurrentTime(true)}>
                                <Card.Body className="d-flex flex-column justify-content-center">
                                    <Card.Title className="text-center mb-1">
                                        Termina con l'ora corrente
                                    </Card.Title>
                                    <Card.Text className="text-center">
                                        {currentTime.format("LL, LT")}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} className="d-flex justify-content-center">
                            <Card className={"date-time-card " + (useCurrentTime ? "deselected-card" : "selected-card")}
                                  onClick={() => setUseCurrentTime(false)}>
                                <Card.Body className="d-flex flex-column align-items-center">
                                    <Card.Title className="text-center ">
                                        Modifica ora di fine
                                    </Card.Title>
                                    <Row>
                                        <Col>
                                            <Form.Control type="date" value={adjustedDate} className="h-100"
                                                          onChange={event => setAdjustedDate(event.target.value)}
                                                          disabled={useCurrentTime}/>
                                        </Col>
                                        <Col>
                                            <Form.Control type="time" value={adjustedTime} className="h-100"
                                                          onChange={event => setAdjustedTime(event.target.value)}
                                                          disabled={useCurrentTime}/>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <GlossyButton icon={HourglassBottom} onClick={handleSubmit}>Termina ticket</GlossyButton>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default CloseTicketModal;