import React, {useState} from "react";
import dayjs from "dayjs";
import {Job} from "../models/job";
import TextButton from "../buttons/TextButton";
import {JournalPlus} from "react-bootstrap-icons";
import "./WorkedHoursTableNewJobRow.css";
import {Card, FloatingLabel, Form, Modal} from "react-bootstrap";
import jobApis from "../api/jobApis";

interface WorkedHoursTableNewJobRowProps {
    readonly workdays: dayjs.Dayjs[]
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
                        .map(job => <JobListItem job={job} setAddedJobs={props.setAddedJobs}
                                                 setShowNewJobModal={setShowNewJobModal}/>)}
                </Modal.Body>
            </Modal>

            <tr>
                <td className="unhoverable"/>
                <td className="unhoverable">
                    <TextButton icon={JournalPlus} className="smaller-button"
                                onClick={() => setShowNewJobModal(true)}>Nuova commessa</TextButton>
                </td>

                {props.workdays.map(workday => {
                    return (
                        <td key={`new-job-${workday.format()}`}
                            className={(!workday.isBusinessDay() || workday.isHoliday()) ? "holiday unhoverable" : "unhoverable"}/>
                    );
                })}
                <td className="unhoverable"/>
            </tr>
        </>
    );
}

interface JobListItemProps {
    readonly job: Job
    readonly setAddedJobs: React.Dispatch<React.SetStateAction<Job[]>>
    readonly setShowNewJobModal: React.Dispatch<React.SetStateAction<boolean>>
}

function JobListItem(props: JobListItemProps) {
    function selectJob() {
        props.setAddedJobs(addedJobs => {
            const newAddedJobs = Array(...addedJobs);
            newAddedJobs.push(props.job);
            return newAddedJobs;
        });
        props.setShowNewJobModal(false);
    }

    return (
        <Card key={props.job.id} className="job-card mb-3" onClick={selectJob}>
            <Card.Body className="px-3 py-1">
                <p className="p-mt grey">{props.job.id}</p>
                <p className="p-mt"><strong>{props.job.client}</strong> - {props.job.subject}</p>
            </Card.Body>
        </Card>
    );
}

export default WorkedHoursTableNewJobRow;