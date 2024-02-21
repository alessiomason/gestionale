import {Col, Form, Row, Table} from "react-bootstrap";
import GlossyButton from "../buttons/GlossyButton";
import {JournalPlus} from "react-bootstrap-icons";
import React, {useEffect, useState} from "react";
import {TicketCompany} from "../../../server/src/tickets/ticketCompanies/ticketCompany";
import ticketCompanyApis from "../api/ticketCompanyApis";
import TicketCompanyPane from "./TicketCompanyPane";

function TicketsPage() {
    const [ticketCompanies, setTicketCompanies] = useState<TicketCompany[]>([]);
    const [dirty, setDirty] = useState(true);
    const [showingNewTicketCompany, setShowingNewTicketCompany] = useState(false);
    const [selectedTicketCompany, setSelectedTicketCompany] = useState<TicketCompany>();

    useEffect(() => {
        ticketCompanyApis.getAllTicketCompanies()
            .then(ticketCompanies => {
                if (dirty) {
                    setTicketCompanies(ticketCompanies);
                    setDirty(false);
                }
            })
            .catch(err => console.error(err))
    }, [dirty]);

    return (
        <>
            <Row>
                <h1 className="page-title">Ticket</h1>
            </Row>

            <Row>
                <Col md={4}>
                    <GlossyButton icon={JournalPlus} onClick={() => {
                    }} className="new-user-button">
                        Nuova azienda
                    </GlossyButton>

                    <Row className="glossy-background w-100">
                        <Table hover responsive>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Nome</th>
                            </tr>
                            </thead>

                            <tbody>
                            {ticketCompanies
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((ticketCompany, i) => {
                                    return (
                                        <tr key={ticketCompany.id} onClick={() => setSelectedTicketCompany(ticketCompany)}>
                                            <td>{i + 1}</td>
                                            <td>{ticketCompany.name}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Row>
                </Col>

                <Col>
                    {showingNewTicketCompany && <></>}
                    {!showingNewTicketCompany && selectedTicketCompany !== undefined &&
                        <TicketCompanyPane ticketCompany={selectedTicketCompany}/>
                    }
                </Col>
            </Row>
        </>
    );
}

export default TicketsPage;