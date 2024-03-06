import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Building, Check2, CurrencyEuro, Icon} from "react-bootstrap-icons";
import React, {useState} from "react";
import SwitchToggle from "../users-management/SwitchToggle";
import GlossyButton from "../buttons/GlossyButton";
import Floppy from "../new-bootstrap-icons/Floppy";
import jobApis from "../api/jobApis";
import {Job} from "../models/job";
import {useNavigate} from "react-router-dom";

interface JobPaneProps {
    readonly job: Job | undefined
    readonly setJobs?: React.Dispatch<React.SetStateAction<Job[]>>
    readonly setJob?: React.Dispatch<React.SetStateAction<Job | undefined>>
}

function JobPane(props: JobPaneProps) {
    const [id, setId] = useState(props.job?.id ?? "");
    const [subject, setSubject] = useState(props.job?.subject ?? "");
    const [client, setClient] = useState(props.job?.client ?? "");
    const [finalClient, setFinalClient] = useState(props.job?.finalClient ?? "");
    const [orderName, setOrderName] = useState(props.job?.orderName ?? "");
    const [orderAmount, setOrderAmount] = useState(props.job?.orderAmount ?? 0);
    const [notes, setNotes] = useState(props.job?.notes ?? "");
    const [startDate, setStartDate] = useState(props.job?.startDate ?? "");
    const [deliveryDate, setDeliveryDate] = useState(props.job?.deliveryDate ?? "");

    const [active, setActive] = useState(props.job?.active ?? true);
    const [lost, setLost] = useState(props.job?.lost ?? false);
    const [design, setDesign] = useState(props.job?.design ?? false);
    const [construction, setConstruction] = useState(props.job?.construction ?? false);

    const [updated, setUpdated] = useState(false);

    const navigate = useNavigate();

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        const job = new Job(
            id,
            subject,
            client,
            finalClient,
            orderName,
            orderAmount,
            startDate,
            deliveryDate,
            notes,
            active,
            lost,
            design,
            construction
        );

        if (props.job) {    // existing job, update
            jobApis.updateJob(job)
                .then(_ => {
                    props.setJob!(job);
                    setUpdated(true);
                })
                .catch(err => console.error(err))
        } else {    // new job, create
            jobApis.createJob(job)
                .then(job => {
                    props.setJobs!(jobs => {
                        jobs.push(job);
                        return jobs;
                    })

                    navigate(`/jobs/${job.id}`);
                })
                .catch(err => console.error(err))
        }
    }

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
                                    <label>Persa</label>
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
                                            <InputGroup.Text>Data di inizio</InputGroup.Text>
                                            <Form.Control type="date" value={startDate}
                                                          onChange={event => setStartDate(event.target.value)}/>
                                        </InputGroup>
                                    </Col>
                                    <Col>
                                        <InputGroup className="mt-2">
                                            <InputGroup.Text>Data di consegna</InputGroup.Text>
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
                            Dettagli costi
                        </Col>
                    }
                </Row>
            </Row>

            <Row className="d-flex justify-content-center my-4">
                <Col sm={4} className="d-flex justify-content-center">
                    <GlossyButton type="submit" icon={updated ? Check2 : (Floppy as Icon)} onClick={handleSubmit}>{props.job ? (updated ? "Aggiornato" : "Aggiorna") : "Salva"}</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default JobPane;