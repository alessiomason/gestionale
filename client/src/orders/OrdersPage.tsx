import React, {useEffect, useState} from "react";
import {Col, Row, Table} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import GlossyButton from "../buttons/GlossyButton";
import TextButton from "../buttons/TextButton";
import {
    ArrowLeftSquare,
    ArrowRightSquare,
    CaretDownFill,
    CaretRight,
    CaretUpFill,
    ClipboardPlus,
    ClipboardX,
    FileEarmark,
    Funnel
} from "react-bootstrap-icons";
import Loading from "../Loading";
import OrderPane from "./OrderPane";
import EditOrderPane from "./EditOrderPane";
import OrdersFiltersModal from "./OrdersFiltersModal";
import {Order} from "../models/order";
import orderApis from "../api/orderApis";
import {User} from "../models/user";
import {formatDate} from "../functions";
import dayjs from "dayjs";
import "./OrdersPage.css";

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
    const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(() => {
        const orderId = sessionStorage.getItem("selectedOrderId");
        return orderId ? orders.find(o => o.id === parseInt(orderId)) : undefined;
    });
    const shrunkTable = showingNewOrderPane || selectedOrder !== undefined;

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filteringOrderName, setFilteringOrderName] = useState<string | undefined>(() => {
        const filter = sessionStorage.getItem("filteringOrderName");
        return filter ?? undefined;
    });
    const [filteringJobId, setFilteringJobId] = useState<string | undefined>(() => {
        const filter = sessionStorage.getItem("filteringJobId");
        return filter ?? undefined;
    });
    const [filteringSupplier, setFilteringSupplier] = useState<string | undefined>(() => {
        const filter = sessionStorage.getItem("filteringSupplier");
        return filter ?? undefined;
    });

    const [comparison, setComparison] = useState<PossibleSortingOptions>(() => {
        const comp = sessionStorage.getItem("comparison");
        return comp as PossibleSortingOptions | null ?? "name";
    });
    const [comparisonOrder, setComparisonOrder] = useState<"asc" | "desc">(() => {
        const compOrder = sessionStorage.getItem("comparisonOrder");
        return compOrder as "asc" | "desc" | null ?? "desc";
    });

    const navigate = useNavigate();

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

    function filterOrders(value: Order) {
        return (filteringOrderName === undefined || value.name.startsWith(filteringOrderName)) &&
            (filteringJobId === undefined || value.job.id.startsWith(filteringJobId)) &&
            (filteringSupplier === undefined || value.supplier.toLowerCase().includes(filteringSupplier.toLowerCase()));
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
            case "name": {
                const nameComparison = compareOrdersByName(a, b);
                return comparisonOrder === "asc" ? nameComparison : -1 * nameComparison;
            }
            case "job": {
                const jobComparison = a.job.id.localeCompare(b.job.id);
                return comparisonOrder === "asc" ? jobComparison : -1 * jobComparison;
            }
            case "supplier": {
                const supplierComparison = a.supplier.localeCompare(b.supplier);
                return comparisonOrder === "asc" ? supplierComparison : -1 * supplierComparison;
            }
            case "deliveryDate": {
                const deliveryDateComparison = compareOrdersByDeliveryDate(a, b);
                return comparisonOrder === "asc" ? deliveryDateComparison : -1 * deliveryDateComparison;
            }
        }
    }

    return (
        <>
            <Row>
                <h1 className="page-title">Ordini</h1>
            </Row>

            <Row className="me-2">
                <Col sm={4}>
                    <GlossyButton icon={ClipboardPlus} onClick={handleNewOrderButton} className="new-user-button">
                        Nuovo ordine</GlossyButton>
                </Col>
                <Col/>
                <Col sm={4}>
                    {shrunkTable ?
                        <GlossyButton icon={ClipboardX} onClick={handleCloseButton} className="new-user-button">
                            Chiudi</GlossyButton> :
                        <GlossyButton icon={Funnel} onClick={() => setShowFilterModal(true)}
                                   className="new-user-button">
                        Filtri</GlossyButton>}
                </Col>
                <OrdersFiltersModal show={showFilterModal} setShow={setShowFilterModal}
                                    filteringOrderName={filteringOrderName}
                                    setFilteringOrderName={setFilteringOrderName} filteringJobId={filteringJobId}
                                    setFilteringJobId={setFilteringJobId} filteringSupplier={filteringSupplier}
                                    setFilteringSupplier={setFilteringSupplier}/>
            </Row>

            <Row>
                <Col sm={shrunkTable ? 4 : 0}
                     className={shrunkTable ? "orders-page-first-column" : "me-4 orders-page-first-column"}>

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

                            <Table hover responsive className="orders-table">
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
                                        <th>Allegato</th>
                                    </>}
                                </tr>
                                </thead>

                                <tbody>
                                {orders
                                    .filter(filterOrders)
                                    .sort(compareOrders)
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
                                                    {order.uploadedFile ? <td>
                                                        <TextButton icon={FileEarmark} onClick={() => {
                                                            const attachmentOrderName = `${order.id}-${order.year.toString().substring(2)}`;
                                                            navigate(`/order/${attachmentOrderName}/pdf`);
                                                        }}>Apri</TextButton>
                                                    </td> : <td/>}
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