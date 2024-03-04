import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import jobApis from "../api/jobApis";
import {Job} from "../models/job";
import JobPane from "./JobPane";

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

    return (
        <JobPane job={job}/>
    );
}

export default JobPage;