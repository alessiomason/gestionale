import React, {useEffect, useState} from "react";
import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Building, JournalBookmark, JournalPlus, JournalText, JournalX, XOctagon} from "react-bootstrap-icons";
import JobPane from "./JobPane";
import JobsTable from "./JobsTable";
import GlossyButton from "../buttons/GlossyButton";
import SwitchToggle from "../users-management/SwitchToggle";
import Loading from "../Loading";
import {Job} from "../models/job";
import jobApis from "../api/jobApis";

interface JobsPageProps {
    readonly isAdministrator: boolean
}

function JobsPage(props: JobsPageProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [dirty, setDirty] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showingNewJobPane, setShowingNewJobPane] = useState(false);

    const [filteringId, setFilteringId] = useState(() => {
        const filter = sessionStorage.getItem("filteringId");
        return filter ?? "";
    });
    const [filteringSubject, setFilteringSubject] = useState(() => {
        const filter = sessionStorage.getItem("filteringSubject");
        return filter ?? "";
    });
    const [filteringClient, setFilteringClient] = useState(() => {
        const filter = sessionStorage.getItem("filteringClient");
        return filter ?? "";
    });
    const [filteringFinalClient, setFilteringFinalClient] = useState(() => {
        const filter = sessionStorage.getItem("filteringFinalClient");
        return filter ?? "";
    });
    const [filteringOnlyActive, setFilteringOnlyActive] = useState(() => {
        const filtering = sessionStorage.getItem("filteringOnlyActive");
        return filtering === "true";    // this way, default is false
    });

    // Save all filters for the whole session
    useEffect(() => {
        sessionStorage.setItem("filteringId", filteringId);
    }, [filteringId]);

    useEffect(() => {
        sessionStorage.setItem("filteringSubject", filteringSubject);
    }, [filteringSubject]);

    useEffect(() => {
        sessionStorage.setItem("filteringClient", filteringClient);
    }, [filteringClient]);

    useEffect(() => {
        sessionStorage.setItem("filteringFinalClient", filteringFinalClient);
    }, [filteringFinalClient]);

    useEffect(() => {
        sessionStorage.setItem("filteringOnlyActive", String(filteringOnlyActive));
    }, [filteringOnlyActive]);

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
    }, [dirty]);

    function clearFilters(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        setFilteringId("");
        setFilteringSubject("");
        setFilteringClient("");
        setFilteringFinalClient("");
        setFilteringOnlyActive(false);
    }

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

                            <Row className="my-3">
                                <Col className="d-flex justify-content-center">
                                    <SwitchToggle id="active-toggle" isOn={filteringOnlyActive}
                                                  handleToggle={() => setFilteringOnlyActive(prevFilter => !prevFilter)}/>
                                    <label>Nascondi non attive</label>
                                </Col>
                            </Row>

                            <Row>
                                <GlossyButton icon={XOctagon} onClick={clearFilters}>Azzera i filtri</GlossyButton>
                            </Row>
                        </Form>
                    </Row>
                </Col>

                <Col>
                    {!showingNewJobPane && loading && <Loading/>}
                    {showingNewJobPane && <JobPane job={undefined} setJobs={setJobs}/>}
                    {!showingNewJobPane && !loading &&
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
                        })}/>
                    }
                </Col>
            </Row>
        </>
    );
}

export default JobsPage;