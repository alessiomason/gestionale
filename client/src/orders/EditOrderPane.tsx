import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Order} from "../models/order";
import React, {useState} from "react";
import {Buildings, Calendar, Check2, Clipboard, Floppy, JournalBookmarkFill, Sticky} from "react-bootstrap-icons";
import WorkedHoursNewJobModal from "../workedHours/WorkedHoursNewJobModal";
import {Job} from "../models/job";
import GlossyButton from "../buttons/GlossyButton";
import orderApis from "../api/orderApis";
import {User} from "../models/user";
import dayjs from "dayjs";

interface EditOrderPaneProps {
    readonly user: User
    readonly order: Order | undefined
    readonly afterSubmit: (order: Order) => void
}

function EditOrderPane(props: EditOrderPaneProps) {
    const [id, setId] = useState(props.order?.id ?? -1);
    const [year, setYear] = useState(props.order?.year ?? parseInt(dayjs().format("YYYY")));
    const [orderDate, setOrderDate] = useState(props.order?.date ?? "");
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    const [job, setJob] = useState<Job | undefined>(props.order?.job);
    const [supplier, setSupplier] = useState(props.order?.supplier ?? "");
    const [description, setDescription] = useState(props.order?.description ?? "");
    const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState(props.order?.scheduledDeliveryDate ?? "");

    const [updated, setUpdated] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    let buttonLabel = "Salva";
    if (props.order) {
        buttonLabel = updated ? "Modifiche salvate" : "Salva modifiche";
    }

    function openModal(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        setShowNewJobModal(true);
    }

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        setErrorMessage("");

        if (!job) {
            setErrorMessage("Nessuna commessa selezionata!");
            return
        }
        if (supplier === "") {
            setErrorMessage("Inserire un fornitore!");
            return;
        }

        const order = new Order(
            id,
            year,
            orderDate,
            job,
            supplier,
            description,
            props.order?.by ?? props.user,
            scheduledDeliveryDate
        );

        if (props.order) {      // editing
            orderApis.updateOrder(order)
                .then(() => props.afterSubmit(order))
                .catch(err => console.error(err));
        } else {
            orderApis.createOrder(order)
                .then(order => props.afterSubmit(order!))
                .catch(err => console.error(err));
        }
    }

    return (
        <Form>
            <Row className="glossy-background">
                <Row>
                    <h3>{props.order ? `Ordine ${props.order.id}` : "Nuovo ordine"}</h3>
                </Row>

                {errorMessage !== "" && <Row className="glossy-error-background">
                    <Col>{errorMessage}</Col>
                </Row>}


                <Row className="mt-3">
                    <InputGroup>
                        <InputGroup.Text><Clipboard/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Identificativo ordine">
                            <Form.Control type="number" placeholder="Identificativo ordine" value={id}
                                          onChange={ev => setId(parseInt(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                </Row>

                <Row className="mt-3">
                    <InputGroup>
                        <InputGroup.Text><Calendar/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Anno">
                            <Form.Control type="number" placeholder="Anno" value={year}
                                          onChange={ev => setYear(parseInt(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                </Row>

                <Row className="mt-3">
                    <InputGroup>
                        <InputGroup.Text>Data dell'ordine</InputGroup.Text>
                        <Form.Control type="date" value={orderDate}
                                      onChange={event => setOrderDate(event.target.value)}/>
                    </InputGroup>
                </Row>

                <Row className="mt-3">
                    <Col sm={4}>
                        <GlossyButton icon={JournalBookmarkFill} onClick={openModal}>Seleziona
                            commessa</GlossyButton>
                        <WorkedHoursNewJobModal show={showNewJobModal} setShow={setShowNewJobModal}
                                                selectJob={job => setJob(job)}/>
                    </Col>
                    <Col className="d-flex align-items-center">
                        {job ? <p className="m-0"><strong>Commessa selezionata: </strong>
                                <i>{job.client}</i> - {job.subject}</p> :
                            <p className="m-0">Nessuna commessa selezionata</p>}
                    </Col>
                </Row>

                <Row className="mt-3">
                    <InputGroup>
                        <InputGroup.Text><Buildings/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Fornitore">
                            <Form.Control type="text" placeholder="Fornitore" value={supplier}
                                          onChange={ev => setSupplier(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                </Row>

                <Row className="mt-3">
                    <InputGroup>
                        <InputGroup.Text><Sticky/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Descrizione">
                            <Form.Control type="text" placeholder="Descrizione" value={description}
                                          onChange={ev => setDescription(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                </Row>

                <Row className="mt-3">
                    <InputGroup>
                        <InputGroup.Text>Data prevista di consegna</InputGroup.Text>
                        <Form.Control type="date" value={scheduledDeliveryDate}
                                      onChange={event => setScheduledDeliveryDate(event.target.value)}/>
                    </InputGroup>
                </Row>
            </Row>

            <Row className="d-flex justify-content-center my-4">
                <Col sm={4} className="d-flex justify-content-center">
                    <GlossyButton type="submit" icon={updated ? Check2 : Floppy}
                                  onClick={handleSubmit}>{buttonLabel}</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default EditOrderPane;