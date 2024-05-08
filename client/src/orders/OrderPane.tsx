import {Order} from "../models/order";
import {Col, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {
    Buildings,
    Clipboard,
    ClipboardCheck,
    ClipboardX,
    FileEarmark,
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
import {useNavigate} from "react-router-dom";

interface OrderPaneProps {
    readonly user: User
    readonly order: Order
    readonly afterSubmitEdit: (oldOrderId: number, oldYear: number, updatedOrder: Order) => void
    readonly afterDelete: (order: Order) => void
}

function OrderPane(props: OrderPaneProps) {
    const attachmentOrderName = `${props.order.id}-${props.order.year.toString().substring(2)}`;
    const [modifying, setModifying] = useState(false);
    const navigate = useNavigate();

    // exit editing mode when selecting another order
    useEffect(() => {
        setModifying(false);
    }, [props.order.id]);

    function afterEdit(updatedOrder: Order) {
        props.afterSubmitEdit(props.order.id, props.order.year, updatedOrder);
        setModifying(false);
    }

    function clearOrder() {
        orderApis.clearOrder(props.order)
            .then(order => props.afterSubmitEdit(order!.id, order!.year, order!))
            .catch(err => console.error(err));
    }

    function unclearOrder() {
        orderApis.unclearOrder(props.order)
            .then(order => props.afterSubmitEdit(order!.id, order!.year, order!))
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
                    <h3>Ordine {props.order.name}{props.order.clearingDate && " (evaso)"}</h3>
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
                <Col className="d-flex justify-content-evenly">
                    <GlossyButton icon={PencilSquare} onClick={() => setModifying(true)}>
                        Modifica l'ordine
                    </GlossyButton>
                    {!props.order.clearedBy && !props.order.clearingDate &&
                        <GlossyButton icon={ClipboardCheck} onClick={clearOrder}>Evadi l'ordine</GlossyButton>}
                    {props.order.clearedBy && props.order.clearingDate &&
                        <GlossyButton icon={ClipboardX} onClick={unclearOrder}>Non evaso</GlossyButton>}
                    <GlossyButton icon={FileEarmark} onClick={() => navigate(`/order/${attachmentOrderName}/pdf`)}>
                        Visualizza allegato
                    </GlossyButton>
                </Col>
            </Row>

        </div>
    );
}

export default OrderPane;