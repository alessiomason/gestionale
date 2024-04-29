import {Order} from "../models/order";
import {Col, Row} from "react-bootstrap";
import React, {useState} from "react";
import {
    Buildings,
    Clipboard,
    ClipboardCheck,
    JournalBookmarkFill,
    PencilSquare,
    Person,
    Sticky
} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";
import {formatDate} from "../functions";
import EditOrderPane from "./EditOrderPane";
import {User} from "../models/user";
import orderApis from "../api/orderApis";

interface OrderPaneProps {
    readonly user: User
    readonly order: Order
    readonly afterSubmitEdit: (order: Order) => void
}

function OrderPane(props: OrderPaneProps) {
    const [modifying, setModifying] = useState(false);

    function afterEdit(updatedOrder: Order) {
        props.afterSubmitEdit(updatedOrder);
        setModifying(false);
    }

    function clearOrder() {
        orderApis.clearOrder(props.order)
            .then(order => props.afterSubmitEdit(order))
            .catch(err => console.error(err));
    }

    if (modifying) {
        return (
            <EditOrderPane user={props.user} order={props.order} afterSubmit={afterEdit}/>
        );
    }

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
                        <Person className="me-1"/> Evaso da
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

            <Row className="mt-3 mb-4">
                <Col/>
                <Col sm={4} className="d-flex justify-content-center">
                    <GlossyButton icon={PencilSquare} onClick={() => setModifying(true)}>
                        Modifica l'ordine
                    </GlossyButton>
                </Col>
                {!props.order.clearedBy && !props.order.clearingDate &&
                    <Col sm={4} className="d-flex justify-content-center">
                        <GlossyButton icon={ClipboardCheck} onClick={clearOrder}>Evadi l'ordine</GlossyButton>
                    </Col>}
                <Col/>
            </Row>

        </>
    );
}

export default OrderPane;