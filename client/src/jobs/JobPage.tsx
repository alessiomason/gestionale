import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import jobApis from "../api/jobApis";
import {Job} from "../models/job";
import JobPane from "./JobPane";
import {Row} from "react-bootstrap";

function JobPage() {
    const {jobId} = useParams();
    const [job, setJob] = useState<Job>();

    useEffect(() => {
        if (jobId) {
            jobApis.getJob(jobId)
                .then(job => setJob(job))
                .catch(err => console.error(err))
        }
    }, []);

    if (job) {
        return (
            <JobPane job={job} setJob={setJob}/>
        );
    } else {
        return (
            <Row className="glossy-background">
                <h3>Commessa {jobId} non trovata</h3>
            </Row>
        );
    }
}

export default JobPage;