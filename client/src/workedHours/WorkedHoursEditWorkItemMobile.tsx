import {Button, Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Calendar, Clock, Floppy} from "react-bootstrap-icons";
import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import {Job} from "../models/job";
import {upperCaseFirst} from "../functions";
import GlossyButton from "../buttons/GlossyButton";
import {WorkItem} from "../models/workItem";
import WorkedHoursNewJobModal from "./WorkedHoursNewJobModal";
import workItemApis from "../api/workItemApis";
import {useNavigate} from "react-router-dom";
import {User} from "../models/user";

interface WorkedHoursEditWorkItemMobileProps {
    readonly user: User
    readonly month: number
    readonly year: number
    readonly workItems: WorkItem[]
}

function WorkedHoursEditWorkItemMobile(props: WorkedHoursEditWorkItemMobileProps) {
    const currentDay = parseInt(dayjs().format("D"));
    const [date, setDate] = useState(`${props.year}-${props.month}-${currentDay}`);
    const [job, setJob] = useState<Job>();
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    const [hours, setHours] = useState(0);

    const jobDisplayText = job ? `${job?.id} - ${job.client} - ${job.subject}` : "";

    const navigate = useNavigate();

    useEffect(() => {
        const existingWorkItem = props.workItems.find(workItem =>
            dayjs(workItem.date).isSame(dayjs(date), "day") && workItem.job.id === job?.id
        );

        if (existingWorkItem) {
            setHours(existingWorkItem.hours);
        }
    }, [date, job?.id]);

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        if (job !== undefined) {
            workItemApis.createOrUpdateWorkItem(props.user.id, job.id, date, hours)
                .then(() => navigate("/workedHours"))
                .catch(err => console.error(err))
        }
    }

    return (
        <Form>
            <Row className="glossy-background">
                <Row className="mb-4">
                    <h3 className="text-center mb-0">
                        {upperCaseFirst(dayjs(`${props.year}-${props.month}-01`).format("MMMM YYYY"))}
                    </h3>
                </Row>

                <Row>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Calendar/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Data">
                            <Form.Control type="date" value={date}
                                          onChange={event => setDate(event.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>

                    <WorkedHoursNewJobModal show={showNewJobModal} setShow={setShowNewJobModal}
                                            selectJob={job => setJob(job)}/>

                    <InputGroup className="mt-2">
                        <Button variant="outline-secondary" onClick={() => setShowNewJobModal(true)}>
                            Seleziona commessa
                        </Button>
                        <Form.Control placeholder="Commessa non selezionata" value={jobDisplayText ?? ""} readOnly/>
                    </InputGroup>

                    <InputGroup className="mt-2">
                        <InputGroup.Text><Clock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Ore">
                            <Form.Control type="number" min={0} step={0.5} placeholder="Ore"
                                          value={hours}
                                          onChange={ev => setHours(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                </Row>
            </Row>

            <Row>
                <Col className="d-flex justify-content-center">
                    <GlossyButton type="submit" icon={Floppy} onClick={handleSubmit}>Salva</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default WorkedHoursEditWorkItemMobile;