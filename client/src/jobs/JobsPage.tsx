import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {Job} from "../models/job";
import jobApis from "../api/jobApis";
import {Building, JournalBookmark, JournalPlus, JournalText, JournalX} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";
import JobPane from "./JobPane";
import JobsTable from "./JobsTable";
import SwitchToggle from "../users-management/SwitchToggle";
import Loading from "../Loading";

interface JobsPageProps {
    readonly isAdministrator: boolean
}

function JobsPage(props: JobsPageProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [dirty, setDirty] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showingNewJobPane, setShowingNewJobPane] = useState(false);

    const [filteringId, setFilteringId] = useState("");
    const [filteringSubject, setFilteringSubject] = useState("");
    const [filteringClient, setFilteringClient] = useState("");
    const [filteringFinalClient, setFilteringFinalClient] = useState("");
    const [filteringOnlyActive, setFilteringOnlyActive] = useState(false);

    useEffect(() => {
        if (dirty) {
            jobApis.getAllJobs()
                .then(jobs => {
                    setJobs(jobs);
                    setDirty(false);
                    setLoading(false);
                })
                .catch(err => console.error(err))
        }
    }, []);

    return (
        <>
            <Row>
                <h1 className="page-title">Commesse</h1>
            </Row>

            <Row>
                <Col md={4}>
                    {props.isAdministrator && <GlossyButton icon={showingNewJobPane ? JournalX : JournalPlus}
                                                            onClick={() => setShowingNewJobPane(prevShowing => !prevShowing)}
                                                            className="new-user-button">
                        {showingNewJobPane ? "Chiudi" : "Nuova commessa"}
                    </GlossyButton>}

                    <Row className="glossy-background w-100">
                        <Form>
                            <Row>
                                <h4>Cerca per...</h4>
                            </Row>

                            <InputGroup className="mt-2">
                                <InputGroup.Text><JournalBookmark/></InputGroup.Text>
                                <FloatingLabel controlId="floatingInput" label="Commessa">
                                    <Form.Control type="text" placeholder="Commessa" value={filteringId}
                                                  onChange={ev => setFilteringId(ev.target.value)}/>
                                </FloatingLabel>
                            </InputGroup>
                            <InputGroup className="mt-2">
                                <InputGroup.Text><JournalText/></InputGroup.Text>
                                <FloatingLabel controlId="floatingInput" label="Oggetto">
                                    <Form.Control type="text" placeholder="Oggetto" value={filteringSubject}
                                                  onChange={ev => setFilteringSubject(ev.target.value)}/>
                                </FloatingLabel>
                            </InputGroup>
                            <InputGroup className="mt-2">
                                <InputGroup.Text><Building/></InputGroup.Text>
                                <FloatingLabel controlId="floatingInput" label="Cliente">
                                    <Form.Control type="text" placeholder="Cliente" value={filteringClient}
                                                  onChange={ev => setFilteringClient(ev.target.value)}/>
                                </FloatingLabel>
                            </InputGroup>
                            <InputGroup className="mt-2">
                                <InputGroup.Text><Building/></InputGroup.Text>
                                <FloatingLabel controlId="floatingInput" label="Cliente finale">
                                    <Form.Control type="text" placeholder="Cliente finale" value={filteringFinalClient}
                                                  onChange={ev => setFilteringFinalClient(ev.target.value)}/>
                                </FloatingLabel>
                            </InputGroup>

                            <Row className="mt-3">
                                <Col className="d-flex justify-content-center">
                                    <SwitchToggle id="active-toggle" isOn={filteringOnlyActive}
                                                  handleToggle={() => setFilteringOnlyActive(prevFilter => !prevFilter)}/>
                                    <label>Nascondi non attive</label>
                                </Col>
                            </Row>
                        </Form>
                    </Row>
                </Col>

                <Col>
                    {loading && <Loading/>}
                    {(!loading && showingNewJobPane) ?
                        <JobPane job={undefined} setJobs={setJobs}/> :
                        <JobsTable isAdministrator={props.isAdministrator} jobs={jobs.filter(job => {
                            let keep = true;

                            if (filteringId !== "") {
                                keep = job.id.toLowerCase().startsWith(filteringId.toLowerCase())
                            }
                            if (keep && filteringSubject !== "") {
                                keep = job.subject.toLowerCase().includes(filteringSubject.toLowerCase())
                            }
                            if (keep && filteringClient !== "") {
                                keep = job.client.toLowerCase().includes(filteringClient.toLowerCase())
                            }
                            if (keep && filteringFinalClient !== "") {
                                keep = job.finalClient?.toLowerCase().includes(filteringFinalClient.toLowerCase()) ?? false
                            }
                            if (keep && filteringOnlyActive) {
                                keep = job.active
                            }

                            return keep;
                        })}/>}
                </Col>
            </Row>
        </>
    );
}

export default JobsPage;