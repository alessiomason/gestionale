import React, {useEffect, useState} from "react";
import {Col, Row, Table} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {
    ArrowLeftSquare,
    ArrowRightSquare,
    CaretDownFill,
    CaretRight,
    CaretUpFill,
    FileEarmark
} from "react-bootstrap-icons";
import TextButton from "../buttons/TextButton";
import {PossibleSortingOptions} from "./OrdersPage";
import {formatDate} from "../functions";
import {Order} from "../models/order";
import dayjs from "dayjs";

interface OrdersTableProps {
    readonly orders: Order[]
    readonly shrunkTable: boolean
    readonly selectedOrder: Order | undefined
    readonly selectOrder: (order: Order) => void
    readonly filteringOrderName: string | undefined
    readonly filteringJobId: string | undefined
    readonly filteringSupplier: string | undefined
    readonly comparison: PossibleSortingOptions
    readonly setComparison: React.Dispatch<React.SetStateAction<PossibleSortingOptions>>
    readonly comparisonOrder: "asc" | "desc"
    readonly setComparisonOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>
}

function OrdersTable(props: OrdersTableProps) {
    const filteredOrders = props.orders.filter(filterOrders);

    const [pageNumber, setPageNumber] = useState(() => {
        const number = sessionStorage.getItem("ordersPageNumber");
        return number ? parseInt(number) : 0;
    });
    const increasablePageNumber = (pageNumber + 1) * 100 <= filteredOrders.length;
    const decreasablePageNumber = pageNumber > 0;

    const navigate = useNavigate();

    useEffect(() => {
        setPageNumber(0);
    }, [props.filteringOrderName, props.filteringJobId, props.filteringSupplier]);

    useEffect(() => {
        sessionStorage.setItem("ordersPageNumber", pageNumber.toString());
    }, [pageNumber]);

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

    function filterOrders(order: Order) {
        return (props.filteringOrderName === undefined || order.name.startsWith(props.filteringOrderName)) &&
            (props.filteringJobId === undefined || order.job.id.startsWith(props.filteringJobId)) &&
            (props.filteringSupplier === undefined || order.supplier.toLowerCase().includes(props.filteringSupplier.toLowerCase()));
    }

    function showCaret(header: PossibleSortingOptions) {
        if (props.comparison === header) {
            if (props.comparisonOrder === "asc") {
                return <CaretUpFill/>;
            }
            return <CaretDownFill/>;
        }
        return <CaretRight/>;
    }

    function selectComparison(choice: PossibleSortingOptions) {
        if (props.comparison === choice) {
            props.setComparisonOrder(prevOrder => prevOrder === "asc" ? "desc" : "asc");
        } else {
            props.setComparison(choice);
            props.setComparisonOrder(choice === "supplier" ? "asc" : "desc");
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
        switch (props.comparison) {
            case "name": {
                const nameComparison = compareOrdersByName(a, b);
                return props.comparisonOrder === "asc" ? nameComparison : -1 * nameComparison;
            }
            case "job": {
                const jobComparison = a.job.id.localeCompare(b.job.id);
                return props.comparisonOrder === "asc" ? jobComparison : -1 * jobComparison;
            }
            case "supplier": {
                const supplierComparison = a.supplier.localeCompare(b.supplier);
                return props.comparisonOrder === "asc" ? supplierComparison : -1 * supplierComparison;
            }
            case "deliveryDate": {
                const deliveryDateComparison = compareOrdersByDeliveryDate(a, b);
                return props.comparisonOrder === "asc" ? deliveryDateComparison : -1 * deliveryDateComparison;
            }
        }
    }

    return (
        <Row className="glossy-background w-100 m-0 mb-3">
            <Row className="mb-2">
                <Col className="d-flex justify-content-between">
                    <ArrowLeftSquare
                        className={decreasablePageNumber ? "clickable-arrow" : "unclickable-arrow"}
                        onClick={decreasePageNumber}/>
                    <p className="text-center">
                        Pagina {pageNumber + 1} di {Math.ceil(filteredOrders.length / 100)}
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
                    {!props.shrunkTable && <th>Data</th>}
                    <th className="comparable"
                        onClick={() => selectComparison("supplier")}>Fornitore {showCaret("supplier")}</th>
                    {!props.shrunkTable && <>
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
                {filteredOrders
                    .sort(compareOrders)
                    .slice(pageNumber * 100, (pageNumber + 1) * 100)
                    .map(order => {
                        let className = "";
                        if (order.id === props.selectedOrder?.id) {
                            className = "table-selected-row";
                        }
                        if (order.clearedBy && order.clearingDate) {
                            className += " cleared";
                        } else if (order.partiallyClearedBy && order.partialClearingDate) {
                            className += " partially-cleared";
                        } else if (order.scheduledDeliveryDate && dayjs(order.scheduledDeliveryDate).isBefore(dayjs())) {
                            className += " expired";
                        }

                        return (
                            <tr key={order.name} onClick={() => props.selectOrder(order)}
                                className={className}>
                                <td>{order.name}</td>
                                <td>{order.job.id}</td>
                                {!props.shrunkTable && <td>{formatDate(order.date)}</td>}
                                <td>{order.supplier}</td>
                                {!props.shrunkTable && <>
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
        </Row>
    );
}

export default OrdersTable;