import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {TicketCompany} from "../models/ticketCompany";
import {Building, BuildingCheck, EnvelopeAt, PersonVcard} from "react-bootstrap-icons";
import React, {useState} from "react";
import GlossyButton from "../buttons/GlossyButton";
import ticketCompanyApis from "../api/ticketCompanyApis";
import {checkValidEmail} from "../functions";

interface EditTicketCompanyPaneProps {
    readonly ticketCompany?: TicketCompany
    readonly updateSelectedCompany: (updatedTicketCompany: TicketCompany) => void
}

function EditTicketCompanyPane(props: EditTicketCompanyPaneProps) {
    const [name, setName] = useState(props.ticketCompany?.name ?? "");
    const [email, setEmail] = useState(props.ticketCompany?.email ?? "");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [contact, setContact] = useState(props.ticketCompany?.contact ?? "");

    function handleEmailCheck() {
        setInvalidEmail(false);

        // empty email is allowed
        if (email && !checkValidEmail(email)) {
            setInvalidEmail(true);
        }
    }

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        if (name.trim() === "") return

        handleEmailCheck();

        if (props.ticketCompany) {
            const updatedTicketCompany = new TicketCompany(
                props.ticketCompany.id,
                name,
                email === "" ? undefined : email,
                contact === "" ? undefined : contact,
                props.ticketCompany.usedHours,
                props.ticketCompany.orderedHours
            )

            ticketCompanyApis.updateTicketCompany(updatedTicketCompany)
                .then(ticketCompany => props.updateSelectedCompany(ticketCompany!))
                .catch(err => console.error(err))
        } else {
            ticketCompanyApis.createTicketCompany(name, email, contact)
                .then(ticketCompany => props.updateSelectedCompany(ticketCompany))
                .catch(err => console.error(err))
        }
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
                            <Form.Control type="email" placeholder="Email" value={email} isInvalid={invalidEmail}
                                          onChange={ev => setEmail(ev.target.value)}
                                          onBlur={handleEmailCheck}/>
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

export default EditTicketCompanyPane;