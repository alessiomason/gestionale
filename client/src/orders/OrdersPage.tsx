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

interface OrdersPageProps {
    readonly user: User
}

function OrdersPage(props: OrdersPageProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [dirty, setDirty] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showingNewOrderPane, setShowingNewOrderPane] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order>();

    useEffect(() => {
        if (dirty) {
            orderApis.getAllOrders()
                .then(orders => {
                    setOrders(orders);
                    setDirty(false);
                    setLoading(false);
                })
                .catch(err => console.error(err))
        }
    }, [dirty]);

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

    function updateSelectedOrder(updatedOrder: Order) {
        setOrders(orders => {
            const index = orders.findIndex(o => o.id === updatedOrder.id);

            if (index === -1) {
                orders.push(updatedOrder);
            } else {
                orders[index] = updatedOrder;
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
                <Col md={4}>
                    <GlossyButton icon={showingNewOrderPane ? ClipboardX : ClipboardPlus}
                                  onClick={() => setShowingNewOrderPane(prevShowing => !prevShowing)}
                                  className="new-user-button">
                        {showingNewOrderPane ? "Chiudi" : "Nuovo ordine"}
                    </GlossyButton>

                    {loading ?
                        <Loading/> :
                        <Row className="glossy-background w-100">
                            <Table hover responsive>
                                <thead>
                                <tr>
                                    <th>Ordine</th>
                                    <th>Commessa</th>
                                    <th>Fornitore</th>
                                </tr>
                                </thead>

                                <tbody>
                                {orders.sort((a, b) => a.id - b.id)
                                    .map(order => {
                                    return (
                                        <tr key={order.id} onClick={() => selectOrder(order)}
                                            className={selectedOrder?.id === order.id ? "table-selected-row" : ""}>
                                            <td>{order.id}</td>
                                            <td>{order.job.id}</td>
                                            <td>{order.supplier}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </Table>
                        </Row>}
                </Col>

                <Col>
                    {showingNewOrderPane &&
                        <EditOrderPane order={undefined} afterSubmit={selectNewlyCreatedOrder} user={props.user}/>}
                    {!showingNewOrderPane && selectedOrder &&
                        <OrderPane order={selectedOrder}/>}
                </Col>
            </Row>
        </>
    );
}

export default OrdersPage;