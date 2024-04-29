import {Order} from "../models/order";
import {Col, Row} from "react-bootstrap";
import React from "react";
import {
    Buildings,
    Clipboard,
    ClipboardCheck,
    JournalBookmarkFill,
    Person,
    Sticky
} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";
import {formatDate} from "../functions";

interface OrderPaneProps {
    readonly order: Order
}

function OrderPane(props: OrderPaneProps) {
    return (
        <>
            <Row className="glossy-background">
                <Row>
                    <h3>Ordine {props.order.id}{props.order.clearingDate && " (evaso)"}</h3>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Clipboard className="me-1"/> Data dell'ordine
                    </Col>
                    <Col>{formatDate(props.order.date)}</Col>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <JournalBookmarkFill className="me-1"/> Commessa
                    </Col>
                    <Col>{props.order.job.id} - <i>{props.order.job.client}</i> - {props.order.job.subject}</Col>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Buildings className="me-1"/> Fornitore
                    </Col>
                    <Col>{props.order.supplier}</Col>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Sticky className="me-1"/> Descrizione
                    </Col>
                    <Col>{props.order.description}</Col>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Person className="me-1"/> Presa in carico da
                    </Col>
                    <Col>{props.order.by.surname} {props.order.by.name}</Col>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Person className="me-1"/> Consegna prevista
                    </Col>
                    <Col>
                        {props.order.scheduledDeliveryDate ?
                            formatDate(props.order.scheduledDeliveryDate) :
                            "Nessuna data prevista"}
                    </Col>
                </Row>

                {props.order.clearedBy && <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Person className="me-1"/> Evasa da
                    </Col>
                    <Col>{props.order.clearedBy.surname} {props.order.clearedBy.name}</Col>
                </Row>}

                {props.order.clearingDate && <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Person className="me-1"/> Data di evasione
                    </Col>
                    <Col>{formatDate(props.order.clearingDate)}</Col>
                </Row>}
            </Row>

            <Row className="d-flex justify-content-center my-3">
                <Col sm={4} className="d-flex justify-content-center">
                    <GlossyButton icon={ClipboardCheck} onClick={() => {
                    }}>Evadi l'ordine</GlossyButton>
                </Col>
            </Row>

        </>
    );
}

export default OrderPane;