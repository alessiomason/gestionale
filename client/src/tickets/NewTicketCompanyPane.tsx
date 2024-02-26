import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {TicketCompany} from "../models/ticketCompany";
import {Building, BuildingCheck, EnvelopeAt, PersonVcard} from "react-bootstrap-icons";
import React, {useState} from "react";
import GlossyButton from "../buttons/GlossyButton";
import ticketCompanyApis from "../api/ticketCompanyApis";

interface NewTicketCompanyPaneProps {
    readonly setDirty: React.Dispatch<React.SetStateAction<boolean>>
    readonly selectTicketCompany: (ticketCompany: TicketCompany) => void
}

function NewTicketCompanyPane(props: NewTicketCompanyPaneProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [contact, setContact] = useState("");

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        if (name.trim() === "") return

        ticketCompanyApis.createTicketCompany(name, email, contact)
            .then(ticketCompany => {
                props.setDirty(true);
                props.selectTicketCompany(ticketCompany);
            })
            .catch(err => console.log(err))
    }

    return (
        <Form>
            <Row className="glossy-background">
                <Row>
                    <h3>Nuova azienda</h3>
                </Row>

                <Row>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Building/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Nome dell'azienda">
                            <Form.Control type="text" placeholder="Nome dell'azienda" value={name}
                                          onChange={ev => setName(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><EnvelopeAt/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Email">
                            <Form.Control type="email" placeholder="Email" value={email}
                                          onChange={ev => setEmail(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><PersonVcard/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Riferimento">
                            <Form.Control type="text" placeholder="Riferimento" value={contact}
                                          onChange={ev => setContact(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                </Row>
            </Row>

            <Row className="d-flex justify-content-center my-4">
                <Col sm={4} className="d-flex justify-content-center">
                    <GlossyButton icon={BuildingCheck} onClick={handleSubmit}>Salva</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default NewTicketCompanyPane;