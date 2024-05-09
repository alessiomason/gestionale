import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Order} from "../models/order";
import React, {useState} from "react";
import {
    Buildings,
    Calendar,
    Clipboard,
    CloudUpload,
    Floppy,
    JournalBookmarkFill,
    Sticky,
    Trash
} from "react-bootstrap-icons";
import WorkedHoursNewJobModal from "../workedHours/WorkedHoursNewJobModal";
import {Job} from "../models/job";
import GlossyButton from "../buttons/GlossyButton";
import orderApis from "../api/orderApis";
import {User} from "../models/user";
import dayjs from "dayjs";
import OrderFileUploadModal from "./OrderFileUploadModal";

interface EditOrderPaneProps {
    readonly user: User
    readonly order?: Order
    readonly nextOrderId?: number
    readonly afterSubmit: (order: Order) => void
    readonly afterDelete: (order: Order) => void
}

function EditOrderPane(props: EditOrderPaneProps) {
    const [id, setId] = useState(props.order?.id ?? props.nextOrderId!);
    const [year, setYear] = useState(props.order?.year ?? parseInt(dayjs().format("YYYY")));
    const [orderDate, setOrderDate] = useState(props.order?.date ?? "");
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const [job, setJob] = useState<Job | undefined>(props.order?.job);
    const [supplier, setSupplier] = useState(props.order?.supplier ?? "");
    const [description, setDescription] = useState(props.order?.description ?? "");
    const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState(props.order?.scheduledDeliveryDate ?? "");

    const [errorMessage, setErrorMessage] = useState("");

    function openJobsModal(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        setShowNewJobModal(true);
    }

    function openFileUploadModal(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        setShowFileUploadModal(true);
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
            props.order?.uploadedFile ?? false,
            scheduledDeliveryDate,
            props.order?.clearedBy,
            props.order?.clearingDate
        );

        if (props.order) {      // editing
            orderApis.updateOrder(props.order.id, props.order.year, order)
                .then(() => props.afterSubmit(order))
                .catch(err => {
                    console.error(err);
                    setErrorMessage(err);
                });
        } else {
            orderApis.createOrder(order)
                .then(order => props.afterSubmit(order!))
                .catch(err => {
                    console.error(err);
                    setErrorMessage(err);
                });
        }
    }

    function handleDelete(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        orderApis.deleteOrder(props.order!.id, props.order!.year)
            .then(() => props.afterDelete(props.order!))
            .catch(err => console.error(err));
    }

    let title = "Nuovo ordine";
    if (props.order) {
        title = `Ordine ${props.order.name}${props.order.clearingDate ? " (evaso)" : ""}`;
    }

    return (
        <Form className="order-pane">
            <Row className="glossy-background">
                <Row>
                    <h3>{title}</h3>
                </Row>

                {errorMessage !== "" && <Row>
                    <Col className="glossy-error-background">{errorMessage}</Col>
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
                        <GlossyButton icon={JournalBookmarkFill} onClick={openJobsModal}>Seleziona
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

            {props.order &&
                <OrderFileUploadModal order={props.order} show={showFileUploadModal} setShow={setShowFileUploadModal}
                                      afterSubmit={props.afterSubmit}/>}
            <Row className="d-flex justify-content-center my-4">
                <Col className="d-flex justify-content-evenly">
                    {props.order &&
                        <GlossyButton icon={CloudUpload} onClick={openFileUploadModal}>Carica allegato</GlossyButton>}
                    <GlossyButton type="submit" icon={Floppy}
                                  onClick={handleSubmit}>{props.order ? "Salva modifiche" : "Salva"}</GlossyButton>
                    {props.order && <GlossyButton icon={Trash} onClick={handleDelete}>Elimina ordine</GlossyButton>}
                </Col>
            </Row>
        </Form>
    );
}

export default EditOrderPane;