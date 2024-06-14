import React, {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";
import {useMediaQuery} from "react-responsive";
import {ClipboardPlus, ClipboardX} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";
import Loading from "../Loading";
import OrderPane from "./OrderPane";
import OrdersTable from "./OrdersTable";
import EditOrderPane from "./EditOrderPane";
import OrdersFiltersSection from "./OrdersFiltersSection";
import {Order} from "../models/order";
import {User} from "../models/user";
import orderApis from "../api/orderApis";
import dayjs from "dayjs";
import "./OrdersPage.css";

export type PossibleSortingOptions = "name" | "job" | "supplier" | "deliveryDate";

interface OrdersPageProps {
    readonly user: User
}


function OrdersPage(props: OrdersPageProps) {
    const isMobile = useMediaQuery({maxWidth: 767});

    const [orders, setOrders] = useState<Order[]>([]);
    const [nextOrderId, setNextOrderId] = useState(1);
    const [dirty, setDirty] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showingNewOrderPane, setShowingNewOrderPane] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(() => {
        const orderId = sessionStorage.getItem("selectedOrderId");
        return orderId ? orders.find(o => o.id === parseInt(orderId)) : undefined;
    });
    const shrunkTable = isMobile || showingNewOrderPane || selectedOrder !== undefined;

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filteringOrderName, setFilteringOrderName] = useState(() => {
        const filter = sessionStorage.getItem("filteringOrderName");
        return filter ?? "";
    });
    const [filteringJobId, setFilteringJobId] = useState(() => {
        const filter = sessionStorage.getItem("filteringJobId");
        return filter ?? "";
    });
    const [filteringSupplier, setFilteringSupplier] = useState(() => {
        const filter = sessionStorage.getItem("filteringSupplier");
        return filter ?? "";
    });

    const [comparison, setComparison] = useState<PossibleSortingOptions>(() => {
        const comp = sessionStorage.getItem("comparison");
        return comp as PossibleSortingOptions | null ?? "name";
    });
    const [comparisonOrder, setComparisonOrder] = useState<"asc" | "desc">(() => {
        const compOrder = sessionStorage.getItem("comparisonOrder");
        return compOrder as "asc" | "desc" | null ?? "desc";
    });

    // save all filters for the whole session
    useEffect(() => {
        if (!dirty) {
            if (selectedOrder) {
                sessionStorage.setItem("selectedOrderId", selectedOrder.id.toString());
            } else {
                sessionStorage.removeItem("selectedOrderId");
            }
        }
    }, [selectedOrder?.id]);

    useEffect(() => {
        if (filteringOrderName) {
            sessionStorage.setItem("filteringOrderName", filteringOrderName);
        } else {
            sessionStorage.removeItem("filteringOrderName");
        }
    }, [filteringOrderName]);

    useEffect(() => {
        if (filteringJobId) {
            sessionStorage.setItem("filteringJobId", filteringJobId);
        } else {
            sessionStorage.removeItem("filteringJobId");
        }
    }, [filteringJobId]);

    useEffect(() => {
        if (filteringSupplier) {
            sessionStorage.setItem("filteringSupplier", filteringSupplier);
        } else {
            sessionStorage.removeItem("filteringSupplier");
        }
    }, [filteringSupplier]);

    useEffect(() => {
        sessionStorage.setItem("comparison", comparison);
    }, [comparison]);

    useEffect(() => {
        sessionStorage.setItem("comparisonOrder", comparisonOrder);
    }, [comparisonOrder]);

    useEffect(() => {
        if (dirty) {
            orderApis.getAllOrders()
                .then(orders => {
                    setOrders(orders!);
                    setDirty(false);
                    setLoading(false);
                    updateNextOrderId(orders!);

                    const orderId = sessionStorage.getItem("selectedOrderId");
                    setSelectedOrder(orderId ? orders!.find(o => o.id === parseInt(orderId)) : undefined);
                })
                .catch(err => console.error(err))
        }
    }, [dirty]);

    function handleNewOrderButton() {
        setShowingNewOrderPane(true);
        setSelectedOrder(undefined);
    }

    function handleCloseButton() {
        setShowingNewOrderPane(false);
        setSelectedOrder(undefined);
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

            if (index === -1) {     // not found, won't happen
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

    return (
        <>
            <Row>
                <h1 className="page-title">Ordini</h1>
            </Row>

            <Row className="me-4 mb-4">
                <Col sm={3}>
                    <GlossyButton icon={ClipboardPlus} onClick={handleNewOrderButton} className="new-user-button">
                        Nuovo ordine</GlossyButton>
                </Col>
                <Col/>
                <Col sm={showingNewOrderPane || selectedOrder ? 3 : 8}>
                    {showingNewOrderPane || selectedOrder ?
                        <GlossyButton icon={ClipboardX} onClick={handleCloseButton} className="new-user-button">
                            Chiudi</GlossyButton> :
                        <OrdersFiltersSection show={showFilterModal} setShow={setShowFilterModal}
                                              filteringOrderName={filteringOrderName}
                                              setFilteringOrderName={setFilteringOrderName}
                                              filteringJobId={filteringJobId} setFilteringJobId={setFilteringJobId}
                                              filteringSupplier={filteringSupplier}
                                              setFilteringSupplier={setFilteringSupplier}/>}
                </Col>
            </Row>

            <Row>
                <Col sm={shrunkTable ? 4 : 0}
                     className={shrunkTable ? "orders-page-first-column" : "me-4 orders-page-first-column"}>

                    {loading &&
                        <Loading/>}
                    {!loading && (!isMobile || (!selectedOrder && !showingNewOrderPane)) &&
                        <OrdersTable orders={orders} shrunkTable={shrunkTable} selectedOrder={selectedOrder}
                                     selectOrder={selectOrder} filteringOrderName={filteringOrderName}
                                     filteringJobId={filteringJobId} filteringSupplier={filteringSupplier}
                                     comparison={comparison} setComparison={setComparison}
                                     comparisonOrder={comparisonOrder} setComparisonOrder={setComparisonOrder}/>}
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