import React, {useState} from "react";
import {Job} from "../models/job";
import TextButton from "../buttons/TextButton";
import {JournalPlus} from "react-bootstrap-icons";
import "./WorkedHoursTableNewJobRow.css";
import {Card, FloatingLabel, Form, Modal} from "react-bootstrap";
import jobApis from "../api/jobApis";

interface WorkedHoursTableNewJobRowProps {
    readonly daysInMonth: number
    readonly setAddedJobs: React.Dispatch<React.SetStateAction<Job[]>>
}

function WorkedHoursTableNewJobRow(props: WorkedHoursTableNewJobRowProps) {
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [jobs, setJobs] = useState<Job[]>([]);

    function getJobs() {
        jobApis.getActiveJobs()
            .then(jobs => setJobs(jobs))
            .catch(err => console.error(err))
    }

    function selectJob(job: Job) {
        props.setAddedJobs(addedJobs => {
            const newAddedJobs = Array(...addedJobs);
            newAddedJobs.push(job);
            return newAddedJobs;
        });
        setShowNewJobModal(false);
        setSearchText("");
    }

    return (
        <>
            <Modal className="modal-fixed-height" size="lg" show={showNewJobModal}
                   onShow={getJobs}
                   onHide={() => setShowNewJobModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Seleziona una nuova commessa</Modal.Title>
                </Modal.Header>
                <Modal.Header>
                    <Form className="w-100">
                        <FloatingLabel controlId="floatingInput"
                                       label="Cerca per numero di commessa, oggetto o cliente"
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
                        .map(job => <JobListItem key={job.id} job={job} selectJob={selectJob}/>)}
                </Modal.Body>
            </Modal>

            <tr>
                <td className="unhoverable"/>
                <td className="unhoverable">
                    <TextButton icon={JournalPlus} className="smaller-button"
                                onClick={() => setShowNewJobModal(true)}>Nuova commessa</TextButton>
                </td>

                <td colSpan={props.daysInMonth} className="unhoverable"/>
                <td className="unhoverable"/>
            </tr>
        </>
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

export default WorkedHoursTableNewJobRow;