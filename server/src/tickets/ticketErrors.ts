import {BaseError} from "../errors";

export class TicketNotFound extends BaseError {
    static readonly code = 404

    constructor() {
        super(TicketNotFound.code, "Ticket non trovato!");
    }
}

export class TicketOrderNotFound extends BaseError {
    static readonly code = 404

    constructor() {
        super(TicketOrderNotFound.code, "Ordine ticket non trovato!");
    }
}

export class TicketCompanyNotFound extends BaseError {
    static readonly code = 404

    constructor() {
        super(TicketCompanyNotFound.code, "Azienda ticket non trovato!");
    }
}