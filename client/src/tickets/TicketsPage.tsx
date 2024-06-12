import {Col, Row, Table} from "react-bootstrap";
import GlossyButton from "../buttons/GlossyButton";
import {BuildingAdd} from "react-bootstrap-icons";
import React, {useEffect, useState} from "react";
import ticketCompanyApis from "../api/ticketCompanyApis";
import {TicketCompany} from "../models/ticketCompany";
import EditTicketCompanyPane from "./ticket-companies/EditTicketCompanyPane";
import TicketCompanyModifiablePane from "./ticket-companies/TicketCompanyModifiablePane";
import Loading from "../Loading";

function TicketsPage() {
    const [ticketCompanies, setTicketCompanies] = useState<TicketCompany[]>([]);
    const [dirty, setDirty] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showingNewTicketCompanyPane, setShowingNewTicketCompanyPane] = useState(false);
    const [selectedTicketCompany, setSelectedTicketCompany] = useState<TicketCompany>();

    useEffect(() => {
        ticketCompanyApis.getAllTicketCompanies()
            .then(ticketCompanies => {
                if (dirty) {
                    if (selectedTicketCompany) {
                        const newSelectedTicketCompany = ticketCompanies!
                            .find(ticketCompany => ticketCompany.id === selectedTicketCompany.id)
                        setSelectedTicketCompany(newSelectedTicketCompany);
                    }

                    setTicketCompanies(ticketCompanies!);
                    setDirty(false);
                    setLoading(false);
                }
            })
            .catch(err => console.error(err))
    }, [dirty]);

    function selectTicketCompany(ticketCompany: TicketCompany) {
        setShowingNewTicketCompanyPane(false);
        setSelectedTicketCompany(ticketCompany);
    }

    function updateSelectedCompany(updatedTicketCompany: TicketCompany | undefined) {
        setShowingNewTicketCompanyPane(false);
        setSelectedTicketCompany(updatedTicketCompany);

        if (updatedTicketCompany) {
            setTicketCompanies(ticketCompanies => {
                const newTicketCompanies = ticketCompanies;
                const index = newTicketCompanies.findIndex(t => t.id === updatedTicketCompany.id);

                if (index === -1) {
                    newTicketCompanies.push(updatedTicketCompany);
                } else {
                    newTicketCompanies[index] = updatedTicketCompany;
                }
                return newTicketCompanies;
            })
        } else {    // deleted company, refresh
            setDirty(true);
        }
    }

    return (
        <>
            <Row>
                <h1 className="page-title">Assistenza</h1>
            </Row>

            <Row>
                <Col md={4}>
                    <GlossyButton icon={BuildingAdd} onClick={() => setShowingNewTicketCompanyPane(true)}
                                  className="new-user-button">
                        Nuova azienda
                    </GlossyButton>

                    {loading ?
                        <Loading/> :
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
                                            <tr key={ticketCompany.id}
                                                onClick={() => selectTicketCompany(ticketCompany)}
                                                className={(!showingNewTicketCompanyPane && ticketCompany === selectedTicketCompany) ?
                                                    "table-selected-row" : ""}>
                                                <td>{i + 1}</td>
                                                <td>{ticketCompany.name}</td>
                                                <td>
                                                    {Math.round(ticketCompany.remainingHoursPercentage)}%
                                                    ({Math.round(ticketCompany.remainingHours)} di {Math.round(ticketCompany.orderedHours)})
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Row>}
                </Col>

                <Col>
                    {showingNewTicketCompanyPane &&
                        <EditTicketCompanyPane updateSelectedCompany={updateSelectedCompany}/>}
                    {!showingNewTicketCompanyPane && selectedTicketCompany !== undefined &&
                        <TicketCompanyModifiablePane ticketCompany={selectedTicketCompany}
                                                     updateSelectedCompany={updateSelectedCompany}/>
                    }
                </Col>
            </Row>
        </>
    );
}

export default TicketsPage;