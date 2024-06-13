import React, {useEffect, useState} from "react";
import {Col, Modal, Row} from "react-bootstrap";
import {
    Buildings,
    CalendarCheck,
    CalendarEvent,
    Clipboard,
    ClipboardCheck,
    ClipboardX,
    FileEarmark,
    JournalBookmarkFill,
    PencilSquare,
    Person,
    Sticky
} from "react-bootstrap-icons";
import {useNavigate} from "react-router-dom";
import {useMediaQuery} from "react-responsive";
import GlossyButton from "../buttons/GlossyButton";
import EditOrderPane from "./EditOrderPane";
import {formatDate} from "../functions";
import {Order} from "../models/order";
import {User} from "../models/user";
import orderApis from "../api/orderApis";

interface OrderPaneProps {
    readonly user: User
    readonly order: Order
    readonly afterSubmitEdit: (oldOrderId: number, oldYear: number, updatedOrder: Order) => void
    readonly afterDelete: (order: Order) => void
}

function OrderPane(props: OrderPaneProps) {
    const attachmentOrderName = `${props.order.id}-${props.order.year.toString().substring(2)}`;
    const attachmentLink = `${process.env.REACT_APP_ORDERS_PDF_FOLDER}/orders/Ordine_${attachmentOrderName}.pdf`;
    const [modifying, setModifying] = useState(false);
    const [showClearingModal, setShowClearingModal] = useState(false);
    const navigate = useNavigate();
    const isMobile = useMediaQuery({maxWidth: 767});

    // exit editing mode when selecting another order
    useEffect(() => {
        setModifying(false);
    }, [props.order.id]);

    function afterEdit(updatedOrder: Order) {
        props.afterSubmitEdit(props.order.id, props.order.year, updatedOrder);
        setModifying(false);
    }

    function clearOrder(partially: boolean = false) {
        orderApis.clearOrder(props.order, partially)
            .then(order => {
                props.afterSubmitEdit(order!.id, order!.year, order!);
                setShowClearingModal(false);
            })
            .catch(err => console.error(err));
    }

    function unclearOrder(partially: boolean) {
        orderApis.unclearOrder(props.order, partially)
            .then(order => {
                props.afterSubmitEdit(order!.id, order!.year, order!);
                setShowClearingModal(false);
            })
            .catch(err => console.error(err));
    }

    if (modifying) {
        return (
            <EditOrderPane user={props.user} order={props.order} afterSubmit={afterEdit}
                           afterDelete={props.afterDelete}/>
        );
    }

    return (
        <div className="order-pane">
            <Row className="glossy-background">
                <Row>
                    <h3>
                        Ordine {props.order.name}
                        {props.order.partialClearingDate && " (evaso parzialmente)"}
                        {props.order.clearingDate && " (evaso)"}
                    </h3>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col xs={6} sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Clipboard className="me-1"/> Data dell'ordine
                    </Col>
                    <Col>{formatDate(props.order.date)}</Col>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col xs={6} sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <JournalBookmarkFill className="me-1"/> Commessa
                    </Col>
                    <Col>{props.order.job.id} - <i>{props.order.job.client}</i> - {props.order.job.subject}</Col>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col xs={6} sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Buildings className="me-1"/> Fornitore
                    </Col>
                    <Col>{props.order.supplier}</Col>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col xs={6} sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Sticky className="me-1"/> Descrizione
                    </Col>
                    <Col>{props.order.description}</Col>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col xs={6} sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Person className="me-1"/> Presa in carico da
                    </Col>
                    <Col>{props.order.by.surname} {props.order.by.name}</Col>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col xs={6} sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <CalendarEvent className="me-1"/> Consegna prevista
                    </Col>
                    <Col>
                        {props.order.scheduledDeliveryDate ?
                            formatDate(props.order.scheduledDeliveryDate) :
                            "Nessuna data prevista"}
                    </Col>
                </Row>

                {props.order.partiallyClearedBy && !props.order.clearedBy && <Row className="d-flex align-items-center">
                    <Col xs={6} sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Person className="me-1"/> Evaso parzialmente da
                    </Col>
                    <Col>{props.order.partiallyClearedBy.surname} {props.order.partiallyClearedBy.name}</Col>
                </Row>}

                {props.order.partialClearingDate && !props.order.clearingDate &&
                    <Row className="d-flex align-items-center">
                        <Col xs={6} sm={3}
                             className="glossy-background smaller d-flex justify-content-center align-items-center">
                            <CalendarCheck className="me-1"/> Data di evasione parziale
                        </Col>
                        <Col>{formatDate(props.order.partialClearingDate)}</Col>
                    </Row>}

                {props.order.clearedBy && <Row className="d-flex align-items-center">
                    <Col xs={6} sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Person className="me-1"/> Evaso da
                    </Col>
                    <Col>{props.order.clearedBy.surname} {props.order.clearedBy.name}</Col>
                </Row>}

                {props.order.clearingDate && <Row className="d-flex align-items-center">
                    <Col xs={6} sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <CalendarCheck className="me-1"/> Data di evasione
                    </Col>
                    <Col>{formatDate(props.order.clearingDate)}</Col>
                </Row>}
            </Row>

            <Row className="mt-3 mb-4">
                <Col className={`d-flex justify-content-evenly ${isMobile ? "flex-column mb-4" : undefined}`}>
                    <GlossyButton icon={PencilSquare} className={isMobile ? "my-1" : undefined}
                                  onClick={() => setModifying(true)}>
                        Modifica l'ordine
                    </GlossyButton>
                    <GlossyButton icon={ClipboardCheck} className={isMobile ? "my-1" : undefined}
                                  onClick={() => setShowClearingModal(true)}>
                        Modifica evasione dell'ordine</GlossyButton>
                    {props.order.uploadedFile &&
                        <GlossyButton icon={FileEarmark} className={isMobile ? "my-1" : undefined}
                                      onClick={() => navigate(attachmentLink)}>
                            Visualizza allegato
                        </GlossyButton>}
                </Col>
            </Row>

            <Modal show={showClearingModal} onHide={() => setShowClearingModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Modifica evasione dell'ordine</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <Col className="d-flex flex-column justify-content-center">
                            {!props.order.clearedBy && !props.order.clearingDate &&
                                <GlossyButton icon={ClipboardCheck} onClick={() => clearOrder(false)} className="mb-2">
                                    Evadi l'ordine</GlossyButton>}
                            {props.order.clearedBy && props.order.clearingDate &&
                                <GlossyButton icon={ClipboardX} onClick={() => unclearOrder(false)} className="mb-2">
                                    Non evaso</GlossyButton>}

                            {!props.order.clearedBy && !props.order.clearingDate &&
                                !props.order.partiallyClearedBy && !props.order.partialClearingDate &&
                                <GlossyButton icon={ClipboardCheck} onClick={() => clearOrder(true)} className="my-2">
                                    Evadi parzialmente l'ordine</GlossyButton>}
                            {!props.order.clearedBy && !props.order.clearingDate &&
                                props.order.partiallyClearedBy && props.order.partialClearingDate &&
                                <GlossyButton icon={ClipboardX} onClick={() => unclearOrder(true)} className="my-2">
                                    Annulla evasione parziale</GlossyButton>}
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default OrderPane;