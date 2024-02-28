import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Building, CurrencyEuro, Icon} from "react-bootstrap-icons";
import React, {useState} from "react";
import SwitchToggle from "../users-management/SwitchToggle";
import {Job} from "../../../server/src/jobs/job";
import GlossyButton from "../buttons/GlossyButton";
import Floppy from "../new-bootstrap-icons/Floppy";

interface JobPaneProps {
    readonly job: Job | undefined
}

function JobPane(props: JobPaneProps) {
    const [id, setId] = useState("");
    const [subject, setSubject] = useState("");
    const [client, setClient] = useState("");
    const [finalClient, setFinalClient] = useState("");
    const [orderName, setOrderName] = useState("");
    const [orderAmount, setOrderAmount] = useState(0);
    const [notes, setNotes] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");

    const [active, setActive] = useState(true);
    const [lost, setLost] = useState(false);
    const [design, setDesign] = useState(false);
    const [construction, setConstruction] = useState(false);

    return (
        <Form>
            <Row className="glossy-background">
                <Row>
                    <h3>{props.job ? `Commessa ${props.job.id}` : "Nuova commessa"}</h3>
                </Row>

                <Row>
                    <Col>
                        <Row>
                            <Col className="d-flex justify-content-evenly my-3">
                                <div className="d-flex justify-content-center">
                                    <SwitchToggle id="active-toggle" isOn={active}
                                                  handleToggle={() => setActive(prevActive => !prevActive)}/>
                                    <label>{active ? "Attiva" : "Non attiva"}</label>
                                </div>

                                <div className="d-flex justify-content-center">
                                    <SwitchToggle id="lost-toggle" isOn={lost}
                                                  handleToggle={() => setLost(prevLost => !prevLost)}/>
                                    <label>{lost ? "Persa" : "Non persa"}</label>
                                </div>

                                <div className="d-flex justify-content-center">
                                    <SwitchToggle id="design-toggle" isOn={design}
                                                  handleToggle={() => setDesign(prevDesign => !prevDesign)}/>
                                    <label>Progettazione</label>
                                </div>

                                <div className="d-flex justify-content-center">
                                    <SwitchToggle id="construction-toggle" isOn={construction}
                                                  handleToggle={() => setConstruction(prevConstruction => !prevConstruction)}/>
                                    <label>Costruzione</label>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <InputGroup className="mt-2">
                                    <InputGroup.Text><Building/></InputGroup.Text>
                                    <FloatingLabel controlId="floatingInput" label="Commessa">
                                        <Form.Control type="text" placeholder="Commessa" value={id}
                                                      onChange={ev => setId(ev.target.value)}/>
                                    </FloatingLabel>
                                </InputGroup>
                                <InputGroup className="mt-2">
                                    <InputGroup.Text><Building/></InputGroup.Text>
                                    <FloatingLabel controlId="floatingInput" label="Oggetto">
                                        <Form.Control type="text" placeholder="Oggetto" value={subject}
                                                      onChange={ev => setSubject(ev.target.value)}/>
                                    </FloatingLabel>
                                </InputGroup>
                                <InputGroup className="mt-2">
                                    <InputGroup.Text><Building/></InputGroup.Text>
                                    <FloatingLabel controlId="floatingInput" label="Cliente">
                                        <Form.Control type="text" placeholder="Cliente" value={client}
                                                      onChange={ev => setClient(ev.target.value)}/>
                                    </FloatingLabel>
                                </InputGroup>
                                <InputGroup className="mt-2">
                                    <InputGroup.Text><Building/></InputGroup.Text>
                                    <FloatingLabel controlId="floatingInput" label="Cliente finale">
                                        <Form.Control type="text" placeholder="Cliente finale" value={finalClient}
                                                      onChange={ev => setFinalClient(ev.target.value)}/>
                                    </FloatingLabel>
                                </InputGroup>
                                <InputGroup className="mt-2">
                                    <InputGroup.Text><Building/></InputGroup.Text>
                                    <FloatingLabel controlId="floatingInput" label="Ordine">
                                        <Form.Control type="text" placeholder="Ordine" value={orderName}
                                                      onChange={ev => setOrderName(ev.target.value)}/>
                                    </FloatingLabel>
                                </InputGroup>
                                <InputGroup className="mt-2">
                                    <InputGroup.Text><CurrencyEuro/></InputGroup.Text>
                                    <FloatingLabel controlId="floatingInput" label="Importo dell'ordine">
                                        <Form.Control type="number" min={0} step={0.5} placeholder="Importo dell'ordine"
                                                      value={orderAmount}
                                                      onChange={ev => setOrderAmount(parseFloat(ev.target.value))}/>
                                    </FloatingLabel>
                                </InputGroup>
                                <InputGroup className="mt-2">
                                    <InputGroup.Text><Building/></InputGroup.Text>
                                    <Form.Control as="textarea" placeholder="Note" maxLength={2047} value={notes}
                                                  onChange={ev => setNotes(ev.target.value)}/>
                                </InputGroup>

                                <Row>
                                    <Col>
                                        <InputGroup className="mt-2">
                                            <InputGroup.Text>Data di consegna prevista</InputGroup.Text>
                                            <Form.Control type="date" value={dueDate}
                                                          onChange={event => setDueDate(event.target.value)}/>
                                        </InputGroup>
                                    </Col>
                                    <Col>
                                        <InputGroup className="mt-2">
                                            <InputGroup.Text>Data di consegna effettiva</InputGroup.Text>
                                            <Form.Control type="date" value={deliveryDate}
                                                          onChange={event => setDeliveryDate(event.target.value)}/>
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                    </Col>

                    {props.job &&
                        <Col>
                            Dettagli
                        </Col>
                    }
                </Row>
            </Row>

            <Row className="d-flex justify-content-center my-4">
                <Col sm={4} className="d-flex justify-content-center">
                    <GlossyButton type="submit" icon={Floppy as Icon} onClick={() => {}}>Salva</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default JobPane;