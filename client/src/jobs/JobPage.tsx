import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import jobApis from "../api/jobApis";
import {DetailedJob} from "../models/job";
import JobPane from "./JobPane";
import {Row} from "react-bootstrap";
import Loading from "../Loading";

function JobPage() {
    const {jobId} = useParams();
    const [job, setJob] = useState<DetailedJob>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (jobId) {
            jobApis.getDetailedJob(jobId)
                .then(job => {
                    setJob(job);
                    setLoading(false);
                })
                .catch(err => console.error(err))
        }
    }, []);

    if (loading) return (
        <Loading/>
    );

    if (job) return (
        <JobPane job={job} setJob={setJob}/>
    );

    return (
        <Row className="glossy-background">
            <h3>Commessa {jobId} non trovata</h3>
        </Row>
    );
}

export default JobPage;