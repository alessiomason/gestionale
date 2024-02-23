import {Col, Row, Table} from "react-bootstrap";
import GlossyButton from "../buttons/GlossyButton";
import {BuildingAdd} from "react-bootstrap-icons";
import React, {useEffect, useState} from "react";
import ticketCompanyApis from "../api/ticketCompanyApis";
import TicketCompanyPane from "./TicketCompanyPane";
import {TicketCompany} from "../models/ticketCompany";
import NewTicketCompanyPane from "./NewTicketCompanyPane";
import {humanize} from "../functions";

function TicketsPage() {
    const [ticketCompanies, setTicketCompanies] = useState<TicketCompany[]>([]);
    const [dirty, setDirty] = useState(true);
    const [showingNewTicketCompany, setShowingNewTicketCompany] = useState(false);
    const [selectedTicketCompany, setSelectedTicketCompany] = useState<TicketCompany>();

    useEffect(() => {
        ticketCompanyApis.getAllTicketCompanies()
            .then(ticketCompanies => {
                if (dirty) {
                    if (selectedTicketCompany) {
                        const newSelectedTicketCompany = ticketCompanies
                            .find(ticketCompany => ticketCompany.id === selectedTicketCompany.id)
                        setSelectedTicketCompany(newSelectedTicketCompany);
                    }

                    setTicketCompanies(ticketCompanies);
                    setDirty(false);
                }
            })
            .catch(err => console.error(err))
    }, [dirty]);

    function selectTicketCompany(ticketCompany: TicketCompany) {
        setShowingNewTicketCompany(false);
        setSelectedTicketCompany(ticketCompany);
    }

    return (
        <>
            <Row>
                <h1 className="page-title">Ticket</h1>
            </Row>

            <Row>
                <Col md={4}>
                    <GlossyButton icon={BuildingAdd} onClick={() => setShowingNewTicketCompany(true)}
                                  className="new-user-button">
                        Nuova azienda
                    </GlossyButton>

                    <Row className="glossy-background w-100">
                        <Table hover responsive>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Nome</th>
                                <th>Ore rimanenti</th>
                            </tr>
                            </thead>

                            <tbody>
                            {ticketCompanies
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((ticketCompany, i) => {
                                    return (
                                        <tr key={ticketCompany.id} onClick={() => selectTicketCompany(ticketCompany)}
                                            className={(!showingNewTicketCompany && ticketCompany == selectedTicketCompany) ?
                                                "table-selected-row" : ""}>
                                            <td>{i + 1}</td>
                                            <td>{ticketCompany.name}</td>
                                            <td>
                                                {Math.round(ticketCompany.remainingHoursPercentage)}%
                                                ({ticketCompany.remainingHours} di {ticketCompany.orderedHours})
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Row>
                </Col>

                <Col>
                    {showingNewTicketCompany &&
                        <NewTicketCompanyPane setDirty={setDirty} selectTicketCompany={selectTicketCompany}/>}
                    {!showingNewTicketCompany && selectedTicketCompany !== undefined &&
                        <TicketCompanyPane ticketCompany={selectedTicketCompany} setDirtyTicketCompany={setDirty}/>
                    }
                </Col>
            </Row>
        </>
    );
}

export default TicketsPage;