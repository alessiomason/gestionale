import {Card, Col, FloatingLabel, Form, InputGroup, Modal, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {TicketCompany} from "../../models/ticketCompany";
import {Floppy, HourglassTop, Sticky, TicketPerforated} from "react-bootstrap-icons";
import GlossyButton from "../../buttons/GlossyButton";
import dayjs from "dayjs";
import "./NewTicketModal.css";
import {Ticket} from "../../models/ticket";
import ticketApis from "../../api/ticketApis";

interface TicketModalProps {
    readonly ticket?: Ticket
    readonly show: boolean
    readonly closeModal: () => void
    readonly ticketCompany: TicketCompany
    readonly setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>
    readonly setDirtyTicketCompanyProgress: React.Dispatch<React.SetStateAction<boolean>>
}

function TicketModal(props: TicketModalProps) {
    const [title, setTitle] = useState(props.ticket?.title ?? "");
    const [description, setDescription] = useState(props.ticket?.description ?? "");

    const [currentTime, setCurrentTime] = useState(dayjs());
    const [useCurrentTime, setUseCurrentTime] = useState(props.ticket === undefined);
    const [adjustedStartDate, setAdjustedStartDate] = useState(dayjs(props.ticket?.startTime).format("YYYY-MM-DD"));
    const [adjustedStartTime, setAdjustedStartTime] = useState(dayjs(props.ticket?.startTime).format("HH:mm"));
    const [endDate, setEndDate] = useState(dayjs(props.ticket?.endTime).format("YYYY-MM-DD"));
    const [endTime, setEndTime] = useState(dayjs(props.ticket?.endTime).format("HH:mm"));

    useEffect(() => {
        setTitle(props.ticket?.title ?? "");
        setDescription(props.ticket?.description ?? "");
        setUseCurrentTime(props.ticket === undefined);
        setAdjustedStartDate(dayjs(props.ticket?.startTime).format("YYYY-MM-DD"));
        setAdjustedStartTime(dayjs(props.ticket?.startTime).format("HH:mm"));
        setEndDate(dayjs(props.ticket?.endTime).format("YYYY-MM-DD"));
        setEndTime(dayjs(props.ticket?.endTime).format("HH:mm"));
    }, [props.show]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined = undefined;

        if (props.show) {
            intervalId = setInterval(() => {
                setCurrentTime(dayjs());
            }, 1000)

            return () => clearInterval(intervalId);
        } else {
            clearInterval(intervalId);
        }
    }, [props.show])

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        const adjustedStartDateTime = dayjs(`${adjustedStartDate} ${adjustedStartTime}`, "YYYY-MM-DD HH:mm");
        const endDateTime = dayjs(`${endDate} ${endTime}`, "YYYY-MM-DD HH:mm");

        const ticket = new Ticket(
            props.ticket?.id ?? -1,
            props.ticket?.company ?? props.ticketCompany,
            title,
            description,
            useCurrentTime ? undefined : adjustedStartDateTime.format(),
            props.ticket?.endTime ? endDateTime.format() : undefined
        )

        if (props.ticket) {
            ticketApis.editTicket(ticket)
                .then(ticket => {
                    props.setTickets(tickets => {
                        tickets.push(ticket);
                        return tickets;
                    });
                    props.setDirtyTicketCompanyProgress(true);
                    props.closeModal();
                })
                .catch(err => console.error(err))
        } else {
            ticketApis.createTicket(ticket)
                .then(ticket => {
                    props.setTickets(tickets => {
                        tickets.push(ticket);
                        return tickets;
                    });
                    props.setDirtyTicketCompanyProgress(true);
                    props.closeModal();
                })
                .catch(err => console.error(err))
        }
    }

    return (
        <Modal show={props.show} onHide={props.closeModal} size="lg" centered>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>{props.ticket ? "Modifica ticket" : "Nuovo ticket"}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <p>Azienda: {props.ticketCompany.name}</p>
                    </Row>

                    <Row>
                        <InputGroup className="mt-2">
                            <InputGroup.Text><TicketPerforated/></InputGroup.Text>
                            <FloatingLabel controlId="floatingInput" label="Titolo">
                                <Form.Control type="text" placeholder="Titolo" value={title}
                                              onChange={ev => setTitle(ev.target.value)}/>
                            </FloatingLabel>
                        </InputGroup>

                        <InputGroup className="mt-2">
                            <InputGroup.Text><Sticky/></InputGroup.Text>
                            <Form.Control as="textarea" placeholder="Descrizione" maxLength={2047} value={description}
                                          onChange={ev => setDescription(ev.target.value)}/>
                        </InputGroup>
                    </Row>

                    <Row>
                        {!props.ticket && <Col md={6} className="d-flex justify-content-center">
                            <Card className={"date-time-card " + (useCurrentTime ? "selected-card" : "deselected-card")}
                                  onClick={() => setUseCurrentTime(true)}>
                                <Card.Body className="d-flex flex-column justify-content-center">
                                    <Card.Title className="text-center mb-1">
                                        Avvia con l'ora corrente
                                    </Card.Title>
                                    <Card.Text className="text-center">
                                        {currentTime.format("LL, LT")}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>}
                        <Col md={(!props.ticket || props.ticket.endTime) ? 6 : 12} className="d-flex justify-content-center">
                            <Card className={"date-time-card " + (useCurrentTime ? "deselected-card" : "selected-card")}
                                  onClick={() => setUseCurrentTime(false)}>
                                <Card.Body className="d-flex flex-column align-items-center">
                                    <Card.Title className="text-center ">
                                        Modifica ora di inizio
                                    </Card.Title>
                                    <Row>
                                        <Col>
                                            <Form.Control type="date" value={adjustedStartDate} className="h-100"
                                                          onChange={event => setAdjustedStartDate(event.target.value)}
                                                          disabled={useCurrentTime}/>
                                        </Col>
                                        <Col>
                                            <Form.Control type="time" value={adjustedStartTime} className="h-100"
                                                          onChange={event => setAdjustedStartTime(event.target.value)}
                                                          disabled={useCurrentTime}/>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                        {props.ticket?.endTime && <Col md={6} className="d-flex justify-content-center">
                            <Card className="date-time-card selected card">
                                <Card.Body className="d-flex flex-column align-items-center">
                                    <Card.Title className="text-center ">
                                        Modifica ora di fine
                                    </Card.Title>
                                    <Row>
                                        <Col>
                                            <Form.Control type="date" value={endDate} className="h-100"
                                                          onChange={event => setEndDate(event.target.value)}/>
                                        </Col>
                                        <Col>
                                            <Form.Control type="time" value={endTime} className="h-100"
                                                          onChange={event => setEndTime(event.target.value)}/>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>}
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <GlossyButton icon={props.ticket ? Floppy : HourglassTop}
                                  onClick={handleSubmit}>{props.ticket ? "Modifica ticket" : "Avvia ticket"}</GlossyButton>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default TicketModal;