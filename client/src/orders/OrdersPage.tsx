import React, {useEffect, useState} from "react";
import {Order} from "../models/order";
import orderApis from "../api/orderApis";
import {Col, Row, Table} from "react-bootstrap";
import GlossyButton from "../buttons/GlossyButton";
import {
    ArrowLeftSquare,
    ArrowRightSquare,
    CaretDownFill,
    CaretRight,
    CaretUpFill,
    ClipboardPlus,
    ClipboardX
} from "react-bootstrap-icons";
import Loading from "../Loading";
import EditOrderPane from "./EditOrderPane";
import {User} from "../models/user";
import OrderPane from "./OrderPane";
import "./OrdersPage.css";
import {formatDate} from "../functions";
import dayjs from "dayjs";

interface OrdersPageProps {
    readonly user: User
}

type PossibleSortingOptions = "name" | "job" | "supplier" | "deliveryDate";

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

    const [comparison, setComparison] = useState<PossibleSortingOptions>("name");
    const [comparisonOrder, setComparisonOrder] = useState<"asc" | "desc">("desc");

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

    function showCaret(header: PossibleSortingOptions) {
        if (comparison === header) {
            if (comparisonOrder === "asc") {
                return <CaretUpFill/>;
            }
            return <CaretDownFill/>;
        }
        return <CaretRight/>;
    }

    function selectComparison(choice: PossibleSortingOptions) {
        if (comparison === choice) {
            setComparisonOrder(prevOrder => prevOrder === "asc" ? "desc" : "asc");
        } else {
            setComparison(choice);
            setComparisonOrder(choice === "supplier" ? "asc" : "desc");
        }
    }

    function compareOrdersByName(a: Order, b: Order) {
        const yearComparison = a.year - b.year;
        return yearComparison === 0 ? a.id - b.id : yearComparison;
    }

    function compareOrdersByDeliveryDate(a: Order, b: Order) {
        if (a.scheduledDeliveryDate && b.scheduledDeliveryDate) {
            return a.scheduledDeliveryDate.localeCompare(b.scheduledDeliveryDate);
        } else if (a.scheduledDeliveryDate) {
            return -1;
        } else if (b.scheduledDeliveryDate) {
            return 1;
        }

        return 0;
    }

    function compareOrders(a: Order, b: Order) {
        switch (comparison) {
            case "name":
                const nameComparison = compareOrdersByName(a, b);
                return comparisonOrder === "asc" ? nameComparison : -1 * nameComparison;
            case "job":
                const jobComparison = a.job.id.localeCompare(b.job.id);
                return comparisonOrder === "asc" ? jobComparison : -1 * jobComparison;
            case "supplier":
                const supplierComparison = a.supplier.localeCompare(b.supplier);
                return comparisonOrder === "asc" ? supplierComparison : -1 * supplierComparison;
            case "deliveryDate":
                const deliveryDateComparison = compareOrdersByDeliveryDate(a, b);
                return comparisonOrder === "asc" ? deliveryDateComparison : -1 * deliveryDateComparison;
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
                                    <ArrowLeftSquare
                                        className={decreasablePageNumber ? "clickable-arrow" : "unclickable-arrow"}
                                        onClick={decreasePageNumber}/>
                                    <p className="text-center">
                                        Pagina {pageNumber + 1} di {Math.ceil(orders.length / 100)}
                                    </p>
                                    <ArrowRightSquare
                                        className={increasablePageNumber ? "clickable-arrow" : "unclickable-arrow"}
                                        onClick={increasePageNumber}/>
                                </Col>
                            </Row>

                            <Table hover responsive>
                                <thead>
                                <tr>
                                    <th className="comparable"
                                        onClick={() => selectComparison("name")}>Ordine {showCaret("name")}</th>
                                    <th className="comparable"
                                        onClick={() => selectComparison("job")}>Commessa {showCaret("job")}</th>
                                    {!shrunkTable && <th>Data</th>}
                                    <th className="comparable"
                                        onClick={() => selectComparison("supplier")}>Fornitore {showCaret("supplier")}</th>
                                    {!shrunkTable && <>
                                        <th>Descrizione</th>
                                        <th>Presa in carico da</th>
                                        <th className="comparable"
                                            onClick={() => selectComparison("deliveryDate")}>Consegna {showCaret("deliveryDate")}</th>
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