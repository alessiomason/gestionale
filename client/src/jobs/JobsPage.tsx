import {Col, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {Job} from "../../../server/src/jobs/job";
import jobApis from "../api/jobApis";
import {JournalPlus} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";

function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [dirty, setDirty] = useState(true);

    useEffect(() => {
        if (dirty) {
            jobApis.getAllJobs()
                .then(jobs => {
                    setJobs(jobs);
                    setDirty(false);
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
                    <GlossyButton icon={JournalPlus} onClick={() => {}} className="new-user-button">
                        Nuova commessa
                    </GlossyButton>

                    <Row className="glossy-background w-100">
                        filtri
                    </Row>
                </Col>
                <Col>
                    <Row className="glossy-background">
                        lista di commesse
                    </Row>
                </Col>
            </Row>
        </>
    );
}

export default JobsPage;