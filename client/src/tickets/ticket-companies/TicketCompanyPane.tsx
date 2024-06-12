import {Col, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import ticketApis from "../../api/ticketApis";
import ticketOrderApis from "../../api/ticketOrderApis";
import LightGlossyButton from "../../buttons/LightGlossyButton";
import {PencilSquare, PlusCircle, Trash} from "react-bootstrap-icons";
import TicketBox from "../tickets/TicketBox";
import TicketOrderBox from "../ticket-orders/TicketOrderBox";
import TicketCompanyHoursProgress from "./TicketCompanyHoursProgress";
import {TicketCompany} from "../../models/ticketCompany";
import NewTicketOrderModal from "../ticket-orders/NewTicketOrderModal";
import {TicketOrder} from "../../models/ticketOrder";
import TicketModal from "../tickets/TicketModal";
import CloseTicketModal from "../tickets/CloseTicketModal";
import {Ticket} from "../../models/ticket";
import dayjs from "dayjs";
import GlossyButton from "../../buttons/GlossyButton";
import ticketCompanyApis from "../../api/ticketCompanyApis";

interface TicketCompanyPaneProps {
    readonly ticketCompany: TicketCompany
    readonly updateSelectedCompany: (updatedTicketCompany: TicketCompany | undefined) => void
    readonly setModifying: React.Dispatch<React.SetStateAction<boolean>>
}

function TicketCompanyPane(props: TicketCompanyPaneProps) {
    const [dirtyTicketCompanyProgress, setDirtyTicketCompanyProgress] = useState(false);
    const [ticketOrders, setTicketOrders] = useState<TicketOrder[]>([]);
    const [dirtyTicketOrders, setDirtyTicketOrders] = useState(true);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [dirtyTickets, setDirtyTickets] = useState(true);
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | undefined>();
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

    function openTicketModal(ticket: Ticket) {
        setEditingTicket(ticket);
        setShowTicketModal(true);
    }

    function closeTicketModal() {
        setShowTicketModal(false);
        setEditingTicket(undefined);
    }

    function deleteTicketCompany() {
        ticketCompanyApis.deleteTicketCompany(props.ticketCompany.id)
            .then(() => props.updateSelectedCompany(undefined))
            .catch(err => console.error(err))
    }

    return (
        <>
            <Row className="glossy-background">
                <NewTicketOrderModal show={showNewOrderModal} setShow={setShowNewOrderModal}
                                     ticketCompany={props.ticketCompany} setTicketOrders={setTicketOrders}
                                     updateSelectedCompany={props.updateSelectedCompany}/>
                <TicketModal show={showTicketModal} closeModal={closeTicketModal} ticket={editingTicket}
                             ticketCompany={props.ticketCompany} setTickets={setTickets}
                             setDirtyTicketCompanyProgress={setDirtyTicketCompanyProgress}/>
                <CloseTicketModal ticketToBeClosed={ticketToBeClosed} setTicketToBeClosed={setTicketToBeClosed}
                                  setTickets={setTickets}
                                  setDirtyTicketCompanyProgress={setDirtyTicketCompanyProgress}/>

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
                                        <TicketOrderBox key={`ticket-order-${ticketOrder.id}`}
                                                        ticketOrder={ticketOrder}/>
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
                                <LightGlossyButton icon={PlusCircle} onClick={() => setShowTicketModal(true)}>
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
                                                   openTicketModal={openTicketModal}
                                                   setTicketToBeEnded={setTicketToBeClosed}/>
                                    );
                                })}
                        </Row>
                    </Col>
                </Row>
            </Row>

            <Row className="mt-3 mb-4">
                <Col className="d-flex justify-content-evenly">
                    <GlossyButton icon={PencilSquare} onClick={() => props.setModifying(true)}>Modifica
                        azienda</GlossyButton>
                    <GlossyButton icon={Trash} onClick={deleteTicketCompany}>Elimina azienda</GlossyButton>
                </Col>
            </Row>
        </>
    );
}

export default TicketCompanyPane;