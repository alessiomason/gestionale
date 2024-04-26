import {Col, FloatingLabel, Form, InputGroup, Row, Table} from "react-bootstrap";
import {Building, Check2, CurrencyEuro, Floppy, JournalBookmark, JournalText, Sticky} from "react-bootstrap-icons";
import React, {useState} from "react";
import SwitchToggle from "../users-management/SwitchToggle";
import GlossyButton from "../buttons/GlossyButton";
import jobApis from "../api/jobApis";
import {DetailedJob, Job} from "../models/job";
import {useNavigate} from "react-router-dom";
import {humanize} from "../functions";

interface JobPaneProps {
    readonly job: Job | DetailedJob | undefined
    readonly setJobs?: React.Dispatch<React.SetStateAction<Job[]>>
    readonly setJob?: React.Dispatch<React.SetStateAction<DetailedJob | undefined>>
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
    const [errorMessage, setErrorMessage] = useState("");

    let buttonLabel = "Salva";
    if (props.job) {
        buttonLabel = updated ? "Modifiche salvate" : "Salva modifiche";
    }

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
            const detailedJob = new DetailedJob(
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
                construction,
                props.job.totalWorkedHours,
                (props.job as DetailedJob).totalCost,
                (props.job as DetailedJob).userHours
            );

            setErrorMessage("");
            jobApis.updateJob(job)
                .then(_ => {
                    props.setJob!(detailedJob);
                    setUpdated(true);
                })
                .catch(err => {
                    setErrorMessage(err);
                    console.error(err);
                })
        } else {    // new job, create
            setErrorMessage("");
            jobApis.createJob(job)
                .then(job => {
                    props.setJobs!(jobs => {
                        jobs.push(job);
                        return jobs;
                    })

                    navigate(`/jobs/${job.id}`);
                })
                .catch(err => {
                    setErrorMessage(err);
                    console.error(err);
                })
        }
    }

    return (
        <Form>
            <Row className="glossy-background">
                <Row>
                    <h3>{props.job ? `Commessa ${props.job.id}` : "Nuova commessa"}</h3>
                </Row>

                {errorMessage !== "" && <Row className="glossy-error-background">
                    <Col>{errorMessage}</Col>
                </Row>}

                <Row>
                    <Col>
                        <Row>
                            <Col className="d-flex justify-content-evenly my-3">
                                <div className="d-flex justify-content-center">
                                    <SwitchToggle id="active-toggle" isOn={active}
                                                  handleToggle={() => setActive(prevActive => !prevActive)}/>
                                    <label>Attiva</label>
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
                                    <InputGroup.Text><JournalBookmark/></InputGroup.Text>
                                    <FloatingLabel controlId="floatingInput" label="Commessa">
                                        <Form.Control type="text" placeholder="Commessa" value={id}
                                                      onChange={ev => setId(ev.target.value)}/>
                                    </FloatingLabel>
                                </InputGroup>
                                <InputGroup className="mt-2">
                                    <InputGroup.Text><JournalText/></InputGroup.Text>
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
                                    <InputGroup.Text><JournalText/></InputGroup.Text>
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
                                    <InputGroup.Text><Sticky/></InputGroup.Text>
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

                    {props.job && <JobPaneDetails job={(props.job as DetailedJob)}/>}
                </Row>
            </Row>

            <Row className="d-flex justify-content-center my-4">
                <Col sm={4} className="d-flex justify-content-center">
                    <GlossyButton type="submit" icon={updated ? Check2 : Floppy} onClick={handleSubmit}>{buttonLabel}</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

interface JobPaneDetailsProps {
    readonly job: DetailedJob
}

function JobPaneDetails (props: JobPaneDetailsProps) {
    return (
        <Col>
            <Row>
                <Col>
                    <h4>Dettaglio costi</h4>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Row className="d-flex align-items-center">
                        <Col xs={3} className="glossy-background smaller text-center">Totale ore</Col>
                        <Col>{humanize(props.job.totalWorkedHours, 2)}</Col>
                    </Row>
                    <Row className="d-flex align-items-center">
                        <Col xs={3} className="glossy-background smaller text-center">Totale costi</Col>
                        <Col>{humanize(props.job.totalCost, 2)} euro</Col>
                    </Row>

                    <Table responsive className="mt-4">
                        <thead>
                        <tr>
                            <th>Personale</th>
                            <th className="text-center">Ore</th>
                            <th className="text-center">Costo</th>
                        </tr>
                        </thead>
                        <tbody>
                        {props.job.userHours.map(userHoursItem => {
                            return (
                                <tr key={userHoursItem.user.id} className="unhoverable">
                                    <td>{userHoursItem.user.surname} {userHoursItem.user.name}</td>
                                    <td className="text-center">{userHoursItem.hours}</td>
                                    <td className="text-center">€ {userHoursItem.cost}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Col>
    );
}

export default JobPane;