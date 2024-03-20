import {BaseError} from "../errors";

export class InvalidDate extends BaseError {
    static readonly code = 422;

    constructor() {
        super(InvalidDate.code, "Formattazione della data non valida!");
    }
}

export class UserCannotReadOtherWorkedHours extends BaseError {
    static readonly code = 401;

    constructor() {
        super(UserCannotReadOtherWorkedHours.code, "Un utente non può accedere alle ore di un altro utente!");
    }
}