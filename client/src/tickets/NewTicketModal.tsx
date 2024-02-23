import {Card, Col, FloatingLabel, Form, InputGroup, Modal, Row} from "react-bootstrap";
import React, {useState} from "react";
import {TicketCompany} from "../models/ticketCompany";
import {Building, Icon} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";
import Floppy from "../new-bootstrap-icons/Floppy";
import dayjs from "dayjs";
import "./NewTicketModal.css";

interface NewTicketModalProps {
    readonly show: boolean
    readonly setShow: React.Dispatch<React.SetStateAction<boolean>>
    readonly ticketCompany: TicketCompany
    readonly setDirtyTicketCompany: React.Dispatch<React.SetStateAction<boolean>>
    readonly setDirtyTickets: React.Dispatch<React.SetStateAction<boolean>>
}

function NewTicketModal(props: NewTicketModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [adjustedDate, setAdjustedDate] = useState("");
    const [adjustedTime, setAdjustedTime] = useState("");
    const [useCurrentTime, setUseCurrentTime] = useState(true);
    const [currentTimeClassName, setCurrentTimeClassName] = useState("selected-card");
    const [adjustedTimeClassName, setAdjustedTimeClassName] = useState("deselected-card");

    function handleSelection(selectCurrent: boolean) {
        if (selectCurrent) {
            setCurrentTimeClassName("selected-card");
            setAdjustedTimeClassName("deselected-card");
            setUseCurrentTime(true);
        } else {
            setCurrentTimeClassName("deselected-card");
            setAdjustedTimeClassName("selected-card");
            setUseCurrentTime(false);
        }
    }

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();


    }

    return (
        <Modal show={props.show} onHide={() => props.setShow(false)} size="lg" centered>
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
                            <Card className={"date-time-card " + currentTimeClassName}
                                  onClick={() => handleSelection(true)}>
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
                            <Card className={"date-time-card " + adjustedTimeClassName}
                                  onClick={() => handleSelection(false)}>
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
                    <GlossyButton icon={Floppy as Icon} onClick={handleSubmit}>Avvia ticket</GlossyButton>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default NewTicketModal;