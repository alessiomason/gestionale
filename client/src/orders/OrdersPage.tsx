import React, {useEffect, useState} from "react";
import {Order} from "../models/order";
import orderApis from "../api/orderApis";
import {Col, Row, Table} from "react-bootstrap";
import GlossyButton from "../buttons/GlossyButton";
import {ClipboardPlus, ClipboardX} from "react-bootstrap-icons";
import Loading from "../Loading";
import EditOrderPane from "./EditOrderPane";
import {User} from "../models/user";
import OrderPane from "./OrderPane";
import "./OrdersPage.css";
import {compareOrders, formatDate} from "../functions";

interface OrdersPageProps {
    readonly user: User
}

function OrdersPage(props: OrdersPageProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [dirty, setDirty] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showingNewOrderPane, setShowingNewOrderPane] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order>();
    const shrunkTable = showingNewOrderPane || selectedOrder !== undefined;

    useEffect(() => {
        if (dirty) {
            orderApis.getAllOrders()
                .then(orders => {
                    setOrders(orders!);
                    setDirty(false);
                    setLoading(false);
                })
                .catch(err => console.error(err))
        }
    }, [dirty]);

    function handleOpenCloseButton() {
        setShowingNewOrderPane(previouslyShowingNewOrderPane => {
            if (previouslyShowingNewOrderPane || selectedOrder) {
                setSelectedOrder(undefined);
                return false;
            }
            return true;
        })
    }

    function selectOrder(order: Order) {
        setSelectedOrder(order);
        setShowingNewOrderPane(false);
    }

    function selectNewlyCreatedOrder(newOrder: Order) {
        setOrders(orders => {
            orders.push(newOrder);
            return orders;
        })
        setSelectedOrder(newOrder);
        setShowingNewOrderPane(false);
    }

    function updateSelectedOrder(oldOrderId: number, updatedOrder: Order) {
        setOrders(orders => {
            const index = orders.findIndex(o => o.id === oldOrderId);

            if (index === -1) {
                orders.push(updatedOrder);
            } else {
                if (oldOrderId === updatedOrder.id) {
                    orders[index] = updatedOrder;
                } else {
                    orders.splice(index, 1);
                    orders.push(updatedOrder);
                }
            }
            return orders;
        });
        setSelectedOrder(updatedOrder);
        setShowingNewOrderPane(false);
    }

    return (
        <>
            <Row>
                <h1 className="page-title">Ordini</h1>
            </Row>

            <Row>
                <Col sm={shrunkTable ? 4 : 0}
                     className={shrunkTable ? "orders-page-first-column" : "me-4 orders-page-first-column"}>
                    <GlossyButton icon={shrunkTable ? ClipboardX : ClipboardPlus}
                                  onClick={handleOpenCloseButton} className="new-user-button">
                        {shrunkTable ? "Chiudi" : "Nuovo ordine"}
                    </GlossyButton>

                    {loading ?
                        <Loading/> :
                        <Row className="glossy-background w-100">
                            <Table hover responsive>
                                <thead>
                                <tr>
                                    <th>Ordine</th>
                                    <th>Commessa</th>
                                    {!shrunkTable && <th>Data</th>}
                                    <th>Fornitore</th>
                                    {!shrunkTable && <>
                                        <th>Descrizione</th>
                                        <th>Presa in carico da</th>
                                        <th>Consegna</th>
                                        <th>Evasa da</th>
                                        <th>Evasa il</th>
                                    </>}
                                </tr>
                                </thead>

                                <tbody>
                                {orders.sort(compareOrders)
                                    .map(order => {
                                        let className = "";
                                        if (order.id === selectedOrder?.id) {
                                            className = "table-selected-row";
                                        }
                                        if (order.clearedBy && order.clearingDate) {
                                            className += " cleared";
                                        }

                                        return (
                                            <tr key={order.name} onClick={() => selectOrder(order)} className={className}>
                                                <td>{order.name}</td>
                                                <td>{order.job.id}</td>
                                                {!shrunkTable && <td>{formatDate(order.date)}</td>}
                                                <td>{order.supplier}</td>
                                                {!shrunkTable && <>
                                                    <td>{order.description}</td>
                                                    <td>{order.by.surname} {order.by.name}</td>
                                                    <td>{formatDate(order.scheduledDeliveryDate)}</td>
                                                    <td>{order.clearedBy?.surname} {order.clearedBy?.name}</td>
                                                    <td>{formatDate(order.clearingDate)}</td>
                                                </>}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Row>}
                </Col>

                {showingNewOrderPane &&
                    <Col className="orders-page-second-column">
                        <EditOrderPane order={undefined} afterSubmit={selectNewlyCreatedOrder} user={props.user}/>
                    </Col>}
                {!showingNewOrderPane && selectedOrder &&
                    <Col>
                        <OrderPane order={selectedOrder} afterSubmitEdit={updateSelectedOrder} user={props.user}/>
                    </Col>}
            </Row>
        </>
    );
}

export default OrdersPage;