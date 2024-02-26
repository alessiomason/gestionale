import {Card, Col, FloatingLabel, Form, InputGroup, Modal, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {TicketCompany} from "../models/ticketCompany";
import {Building, HourglassTop} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";
import dayjs from "dayjs";
import "./NewTicketModal.css";
import {Ticket} from "../models/ticket";
import ticketApis from "../api/ticketApis";

interface NewTicketModalProps {
    readonly show: boolean
    readonly setShow: React.Dispatch<React.SetStateAction<boolean>>
    readonly ticketCompany: TicketCompany
    readonly setDirtyTickets: React.Dispatch<React.SetStateAction<boolean>>
}

function NewTicketModal(props: NewTicketModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [currentTime, setCurrentTime] = useState(dayjs());
    const [adjustedDate, setAdjustedDate] = useState("");
    const [adjustedTime, setAdjustedTime] = useState("");
    const [useCurrentTime, setUseCurrentTime] = useState(true);

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

        const adjusted = dayjs(`${adjustedDate} ${adjustedTime}`, "YYYY-MM-DD HH:mm");

        const newTicket = new Ticket(
            -1,
            props.ticketCompany,
            title,
            description,
            useCurrentTime ? undefined : adjusted.format(),
            undefined
        )

        ticketApis.createTicket(newTicket)
            .then(_ticket => {
                props.setDirtyTickets(true);
                hide();
            })
            .catch(err => console.error(err))
    }

    function hide() {
        props.setShow(false);

        setTitle("");
        setDescription("");
        setAdjustedDate("");
        setAdjustedTime("");
        setUseCurrentTime(true);
    }

    return (
        <Modal show={props.show} onHide={hide} size="lg" centered>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>Nuovo ticket</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <p>Azienda: {props.ticketCompany.name}</p>
                    </Row>

                    <Row>
                        <InputGroup className="mt-2">
                            <InputGroup.Text><Building/></InputGroup.Text>
                            <FloatingLabel controlId="floatingInput" label="Titolo">
                                <Form.Control type="text" placeholder="Titolo" value={title}
                                              onChange={ev => setTitle(ev.target.value)}/>
                            </FloatingLabel>
                        </InputGroup>

                        <InputGroup className="mt-2">
                            <InputGroup.Text><Building/></InputGroup.Text>
                            <Form.Control as="textarea" placeholder="Descrizione" value={description}
                                          onChange={ev => setDescription(ev.target.value)}/>
                        </InputGroup>
                    </Row>

                    <Row>
                        <Col md={6} className="d-flex justify-content-center">
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
                        </Col>
                        <Col md={6} className="d-flex justify-content-center">
                            <Card className={"date-time-card " + (useCurrentTime ? "deselected-card" : "selected-card")}
                                  onClick={() => setUseCurrentTime(false)}>
                                <Card.Body className="d-flex flex-column align-items-center">
                                    <Card.Title className="text-center ">
                                        Modifica ora di inizio
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
                    <GlossyButton icon={HourglassTop} onClick={handleSubmit}>Avvia ticket</GlossyButton>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default NewTicketModal;