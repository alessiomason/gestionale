import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {TicketCompany} from "../models/ticketCompany";
import {Building, BuildingCheck} from "react-bootstrap-icons";
import React, {useState} from "react";
import GlossyButton from "../buttons/GlossyButton";
import ticketCompanyApis from "../api/ticketCompanyApis";

interface NewTicketCompanyPaneProps {
    readonly setDirty: React.Dispatch<React.SetStateAction<boolean>>
    readonly selectTicketCompany: (ticketCompany: TicketCompany) => void
}

function NewTicketCompanyPane(props: NewTicketCompanyPaneProps) {
    const [name, setName] = useState("");

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        if (name.trim() === "") return

        ticketCompanyApis.createTicketCompany(name)
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