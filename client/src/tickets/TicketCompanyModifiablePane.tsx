import {TicketCompany} from "../models/ticketCompany";
import React, {useEffect, useState} from "react";
import TicketCompanyPane from "./TicketCompanyPane";
import EditTicketCompanyPane from "./EditTicketCompanyPane";

interface TicketCompanyModifiablePaneProps {
    readonly ticketCompany: TicketCompany
    readonly updateSelectedCompany: (updatedTicketCompany: TicketCompany | undefined) => void
}

function TicketCompanyModifiablePane(props: TicketCompanyModifiablePaneProps) {
    const [modifying, setModifying] = useState(false);

    function updateSelectedCompany(updatedTicketCompany: TicketCompany | undefined) {
        props.updateSelectedCompany(updatedTicketCompany);
        setModifying(false);
    }

    useEffect(() => {   // fired if the user selects a different company from the list
        setModifying(false);
    }, [props.ticketCompany.id]);

    if (modifying) {
        return (
            <EditTicketCompanyPane ticketCompany={props.ticketCompany} updateSelectedCompany={updateSelectedCompany}/>
        );
    } else {
        return (
            <TicketCompanyPane ticketCompany={props.ticketCompany}
                               updateSelectedCompany={updateSelectedCompany}
                               setModifying={setModifying}/>
        );
    }
}

export default TicketCompanyModifiablePane;