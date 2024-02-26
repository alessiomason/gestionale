import {Col, FloatingLabel, Form, InputGroup, Modal, Row} from "react-bootstrap";
import React, {useState} from "react";
import {TicketCompany} from "../models/ticketCompany";
import {Building, Clock, Icon} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";
import Floppy from "../new-bootstrap-icons/Floppy";
import ticketOrderApis from "../api/ticketOrderApis";
import {TicketOrder} from "../models/ticketOrder";
import LightGlossyButton from "../buttons/LightGlossyButton";

interface NewTicketOrderModalProps {
    readonly show: boolean
    readonly setShow: React.Dispatch<React.SetStateAction<boolean>>
    readonly ticketCompany: TicketCompany
    readonly setDirtyTicketCompany: React.Dispatch<React.SetStateAction<boolean>>
    readonly setDirtyTicketOrders: React.Dispatch<React.SetStateAction<boolean>>
}

function NewTicketOrderModal(props: NewTicketOrderModalProps) {
    const [hours, setHours] = useState(0);

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        if (hours === 0) return

        const ticketOrder = new TicketOrder(-1, props.ticketCompany, hours, "");

        ticketOrderApis.createTicketOrder(ticketOrder)
            .then(_ => {
                props.setDirtyTicketCompany(true);
                props.setDirtyTicketOrders(true);
                hide();
            })
            .catch(err => console.error(err))
    }

    function hide() {
        props.setShow(false);
        setHours(0);
    }

    return (
        <Modal show={props.show} onHide={hide} size="lg" centered>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>Nuovo ordine</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <p>Azienda: {props.ticketCompany.name}</p>
                    </Row>

                    <Row>
                        <InputGroup className="mt-2">
                            <InputGroup.Text><Building/></InputGroup.Text>
                            <FloatingLabel controlId="floatingInput" label="Ore">
                                <Form.Control type="number" min={0} placeholder="Ore" value={hours}
                                              onChange={ev => setHours(parseInt(ev.target.value))}/>
                            </FloatingLabel>
                        </InputGroup>
                    </Row>

                    <Row className="mt-3">
                        <Col/>
                        <Col sm={2}>
                            <LightGlossyButton icon={Clock} className="w-100" onClick={() => setHours(50)}>50
                                ore</LightGlossyButton>
                        </Col>
                        <Col sm={2}>
                            <LightGlossyButton icon={Clock} className="w-100" onClick={() => setHours(100)}>100
                                ore</LightGlossyButton>
                        </Col>
                        <Col sm={2}>
                            <LightGlossyButton icon={Clock} className="w-100" onClick={() => setHours(150)}>150
                                ore</LightGlossyButton>
                        </Col>
                        <Col/>
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <GlossyButton icon={Floppy as Icon} onClick={handleSubmit}>Salva</GlossyButton>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default NewTicketOrderModal;