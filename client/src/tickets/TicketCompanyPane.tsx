import {Col, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import ticketApis from "../api/ticketApis";
import ticketOrderApis from "../api/ticketOrderApis";
import LightGlossyButton from "../buttons/LightGlossyButton";
import {PlusCircle} from "react-bootstrap-icons";
import TicketBox from "./TicketBox";
import TicketOrderBox from "./TicketOrderBox";
import TicketCompanyHoursProgress from "./TicketCompanyHoursProgress";
import {TicketCompany} from "../models/ticketCompany";
import NewTicketOrderModal from "./NewTicketOrderModal";
import {TicketOrder} from "../models/ticketOrder";
import NewTicketModal from "./NewTicketModal";
import CloseTicketModal from "./CloseTicketModal";
import {Ticket} from "../models/ticket";
import dayjs from "dayjs";

interface TicketCompanyPaneProps {
    readonly ticketCompany: TicketCompany
    readonly updateSelectedCompany: (updatedTicketCompany: TicketCompany) => void
}

function TicketCompanyPane(props: TicketCompanyPaneProps) {
    const [dirtyTicketCompanyProgress, setDirtyTicketCompanyProgress] = useState(false);
    const [ticketOrders, setTicketOrders] = useState<TicketOrder[]>([]);
    const [dirtyTicketOrders, setDirtyTicketOrders] = useState(true);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [dirtyTickets, setDirtyTickets] = useState(true);
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [ticketToBeClosed, setTicketToBeClosed] = useState<Ticket>();

    // empty arrays when selected ticket company changes
    useEffect(() => {
        setDirtyTickets(true);
        setDirtyTicketOrders(true);
    }, [props.ticketCompany]);

    useEffect(() => {
        if (dirtyTickets) {
            ticketApis.getTickets(props.ticketCompany.id)
                .then(tickets => {
                    setTickets(tickets);
                    setDirtyTickets(false);
                })
                .catch(err => console.error(err))
        }
    }, [dirtyTickets]);

    useEffect(() => {
        if (dirtyTicketOrders) {
            ticketOrderApis.getTicketOrders(props.ticketCompany.id)
                .then(ticketOrders => {
                    setTicketOrders(ticketOrders);
                    setDirtyTicketOrders(false);
                })
        }
    }, [dirtyTicketOrders]);

    // update the ticket company progress every 5 minutes
    useEffect(() => {
        const intervalId = setInterval(() => setDirtyTicketCompanyProgress(true), 5000 * 60)
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (dirtyTicketCompanyProgress) {
            const totalUsedHours = tickets
                .map(ticket => dayjs.duration(dayjs(ticket.endTime).diff(dayjs(ticket.startTime))))
                .reduce(((sum, ticketDuration) => sum.add(ticketDuration)), dayjs.duration(0))
                .asHours()

            const updatedSelectedCompany = new TicketCompany(
                props.ticketCompany.id,
                props.ticketCompany.name,
                props.ticketCompany.email,
                props.ticketCompany.contact,
                totalUsedHours,
                props.ticketCompany.orderedHours
            )
            props.updateSelectedCompany(updatedSelectedCompany);

            setDirtyTicketCompanyProgress(false);
        }
    }, [dirtyTicketCompanyProgress]);

    return (
        <Row className="glossy-background">
            <NewTicketOrderModal show={showNewOrderModal} setShow={setShowNewOrderModal}
                                 ticketCompany={props.ticketCompany} setTicketOrders={setTicketOrders}
                                 updateSelectedCompany={props.updateSelectedCompany}/>
            <NewTicketModal show={showNewTicketModal} setShow={setShowNewTicketModal}
                            ticketCompany={props.ticketCompany} setTickets={setTickets}
                            setDirtyTicketCompanyProgress={setDirtyTicketCompanyProgress}/>
            <CloseTicketModal ticketToBeClosed={ticketToBeClosed} setTicketToBeClosed={setTicketToBeClosed}
                              setTickets={setTickets} setDirtyTicketCompanyProgress={setDirtyTicketCompanyProgress}/>

            <Row>
                <h3>{props.ticketCompany.name}</h3>
                <p>Email: {props.ticketCompany.email ?? "non inserita"}</p>
                <p>Riferimento: {props.ticketCompany.contact ?? "non inserito"}</p>
            </Row>

            <Row className="my-4">
                <Col>
                    <TicketCompanyHoursProgress ticketCompany={props.ticketCompany}/>
                </Col>
            </Row>

            <Row>
                <Col className="me-3">
                    <Row className="d-flex align-items-center mb-3">
                        <Col>
                            <h4>Ordini</h4>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <LightGlossyButton icon={PlusCircle} onClick={() => setShowNewOrderModal(true)}>
                                Nuovo ordine
                            </LightGlossyButton>
                        </Col>
                    </Row>

                    <Row>
                        {ticketOrders
                            .sort((a, b) => -1 * a.date.localeCompare(b.date))
                            .map(ticketOrder => {
                                return (
                                    <TicketOrderBox key={`ticket-order-${ticketOrder.id}`} ticketOrder={ticketOrder}/>
                                );
                            })}
                    </Row>
                </Col>

                <Col className="ms-3">
                    <Row className="d-flex align-items-center mb-3">
                        <Col>
                            <h4>Ticket</h4>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <LightGlossyButton icon={PlusCircle} onClick={() => setShowNewTicketModal(true)}>
                                Nuovo ticket
                            </LightGlossyButton>
                        </Col>
                    </Row>

                    <Row>
                        {tickets
                            .sort((a, b) => -1 * a.startTime!.localeCompare(b.startTime!))
                            .map(ticket => {
                                return (
                                    <TicketBox key={`ticket-order-${ticket.id}`} ticket={ticket}
                                               setTicketToBeEnded={setTicketToBeClosed}/>
                                );
                            })}
                    </Row>
                </Col>
            </Row>
        </Row>
    );
}

export default TicketCompanyPane;