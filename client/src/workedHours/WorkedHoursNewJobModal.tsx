import React, {useState} from "react";
import {Job} from "../models/job";
import jobApis from "../api/jobApis";
import {Card, FloatingLabel, Form, Modal} from "react-bootstrap";

interface WorkedHoursNewJobModalProps {
    readonly show: boolean
    readonly setShow: React.Dispatch<React.SetStateAction<boolean>>
    readonly selectJob: (job: Job) => void
}

function WorkedHoursNewJobModal(props: WorkedHoursNewJobModalProps) {
    const [searchText, setSearchText] = useState("");
    const [jobs, setJobs] = useState<Job[]>([]);

    function getJobs() {
        jobApis.getActiveJobs()
            .then(jobs => setJobs(jobs))
            .catch(err => console.error(err))
    }

    function handleSubmit(job: Job) {
        props.selectJob(job);
        props.setShow(false);
    }

    return (
        <Modal className="modal-fixed-height" size="lg" show={props.show} onShow={getJobs}
               onHide={() => props.setShow(false)} onExited={() => setSearchText("")}>
            <Modal.Header closeButton>
                <Modal.Title>Seleziona una nuova commessa</Modal.Title>
            </Modal.Header>
            <Modal.Header>
                <Form className="w-100">
                    <FloatingLabel controlId="floatingInput" label="Cerca per numero di commessa, oggetto o cliente"
                                   className="mb-3">
                        <Form.Control type="search" value={searchText}
                                      onChange={ev => setSearchText(ev.target.value)}
                                      placeholder="Cerca per numero di commessa, oggetto o cliente"/>
                    </FloatingLabel>
                </Form>
            </Modal.Header>
            <Modal.Body className="modal-body-overflow">
                {jobs.sort((a, b) => -1 * a.id.localeCompare(b.id))
                    .filter(job => {
                        const searchString = searchText.toLowerCase();

                        return searchText === "" ||
                            job.id.toLowerCase().startsWith(searchString) ||
                            job.subject.toLowerCase().includes(searchString) ||
                            job.client.toLowerCase().includes(searchString);
                    })
                    .map(job => <JobListItem key={job.id} job={job} selectJob={handleSubmit}/>)}
            </Modal.Body>
        </Modal>
    );
}

interface JobListItemProps {
    readonly job: Job
    readonly selectJob: (job: Job) => void
}

function JobListItem(props: JobListItemProps) {

    return (
        <Card key={props.job.id} className="job-card mb-3" onClick={() => props.selectJob(props.job)}>
            <Card.Body className="px-3 py-1">
                <p className="p-mt grey">{props.job.id}</p>
                <p className="p-mt"><strong>{props.job.client}</strong> - {props.job.subject}</p>
            </Card.Body>
        </Card>
    );
}

export default WorkedHoursNewJobModal;