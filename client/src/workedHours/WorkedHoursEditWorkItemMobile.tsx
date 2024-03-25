import {Button, Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Calendar, Clock, Floppy} from "react-bootstrap-icons";
import React, {useState} from "react";
import dayjs from "dayjs";
import {Job} from "../models/job";
import {upperCaseFirst} from "../functions";
import GlossyButton from "../buttons/GlossyButton";

interface WorkedHoursEditWorkItemMobileProps {
    readonly month: number
    readonly year: number
    readonly setSavingStatus: React.Dispatch<React.SetStateAction<"" | "saving" | "saved">>
}

function WorkedHoursEditWorkItemMobile(props: WorkedHoursEditWorkItemMobileProps) {
    const currentDay = parseInt(dayjs().format("D"));
    const [date, setDate] = useState(`${props.year}-${props.month}-${currentDay}`);
    const [job, setJob] = useState<Job>();
    const [hours, setHours] = useState(0);

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

                        <InputGroup className="mt-2">
                            <Button variant="outline-secondary">Seleziona commessa</Button>
                            <Form.Control placeholder={job?.subject ?? ""} readOnly/>
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
                    <GlossyButton type="submit" icon={Floppy} onClick={() => {}}>Salva</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default WorkedHoursEditWorkItemMobile;