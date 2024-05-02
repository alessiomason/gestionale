import React, {useEffect, useState} from "react";
import {Order} from "../models/order";
import orderApis from "../api/orderApis";
import {Col, Row, Table} from "react-bootstrap";
import GlossyButton from "../buttons/GlossyButton";
import {ArrowLeftSquare, ArrowRightSquare, ClipboardPlus, ClipboardX} from "react-bootstrap-icons";
import Loading from "../Loading";
import EditOrderPane from "./EditOrderPane";
import {User} from "../models/user";
import OrderPane from "./OrderPane";
import "./OrdersPage.css";
import {compareOrders, formatDate} from "../functions";
import dayjs from "dayjs";

interface OrdersPageProps {
    readonly user: User
}

function OrdersPage(props: OrdersPageProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pageNumber, setPageNumber] = useState(0);
    const increasablePageNumber = (pageNumber + 1) * 100 <= orders.length;
    const decreasablePageNumber = pageNumber > 0;
    const [nextOrderId, setNextOrderId] = useState(1);
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
                    updateNextOrderId(orders!);
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

    function updateNextOrderId(orders: Order[]) {
        const currentYear = parseInt(dayjs().format("YYYY"));
        const maxId = orders
            .filter(order => order.year === currentYear)
            .map(order => order.id)
            .reduce((a, b) => a < b ? b : a, 0);    // find max value
        setNextOrderId(maxId + 1);
    }

    function selectNewlyCreatedOrder(newOrder: Order) {
        setOrders(orders => {
            updateNextOrderId(orders);
            orders.push(newOrder);
            return orders;
        })
        setSelectedOrder(newOrder);
        setShowingNewOrderPane(false);
    }

    function updateSelectedOrder(oldOrderId: number, oldYear: number, updatedOrder: Order) {
        setOrders(orders => {
            const index = orders.findIndex(o => o.id === oldOrderId && o.year === oldYear);

            if (index === -1) {     // not found , won't happen
                orders.push(updatedOrder);
            } else if (oldOrderId === updatedOrder.id && oldYear === updatedOrder.year) {   // did not update id nor year
                orders[index] = updatedOrder;
            } else {        // updated id or year
                orders.splice(index, 1);
                orders.push(updatedOrder);
            }

            updateNextOrderId(orders);
            return orders;
        });
        setSelectedOrder(updatedOrder);
        setShowingNewOrderPane(false);
    }

    function deleteSelectedOrder(order: Order) {
        setOrders(orders => {
            const index = orders.findIndex(o => o.id === order.id && o.year === order.year);
            orders.splice(index, 1);
            return orders;
        });
        setSelectedOrder(undefined);
        setShowingNewOrderPane(false);
    }

    function increasePageNumber() {
        if (increasablePageNumber) {
            setPageNumber(prevPageNumber => prevPageNumber + 1);
        }
    }

    function decreasePageNumber() {
        if (decreasablePageNumber) {
            setPageNumber(prevPageNumber => prevPageNumber - 1);
        }
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
                            <Row className="mb-2">
                                <Col className="d-flex justify-content-between">
                                    <ArrowLeftSquare className={decreasablePageNumber ? "clickable-arrow" : "unclickable-arrow"}
                                                     onClick={decreasePageNumber}/>
                                    <p className="text-center">
                                        Pagina {pageNumber + 1} di {Math.ceil(orders.length / 100)}
                                    </p>
                                    <ArrowRightSquare className={increasablePageNumber ? "clickable-arrow" : "unclickable-arrow"}
                                                      onClick={increasePageNumber}/>
                                </Col>
                            </Row>

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
                                    .slice(pageNumber * 100, (pageNumber + 1) * 100)
                                    .map(order => {
                                        let className = "";
                                        if (order.id === selectedOrder?.id) {
                                            className = "table-selected-row";
                                        }
                                        if (order.clearedBy && order.clearingDate) {
                                            className += " cleared";
                                        }

                                        return (
                                            <tr key={order.name} onClick={() => selectOrder(order)}
                                                className={className}>
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
                        <EditOrderPane nextOrderId={nextOrderId} afterSubmit={selectNewlyCreatedOrder}
                                       afterDelete={deleteSelectedOrder} user={props.user}/>
                    </Col>}
                {!showingNewOrderPane && selectedOrder &&
                    <Col>
                        <OrderPane order={selectedOrder} afterSubmitEdit={updateSelectedOrder}
                                   afterDelete={deleteSelectedOrder} user={props.user}/>
                    </Col>}
            </Row>
        </>
    );
}

export default OrdersPage;