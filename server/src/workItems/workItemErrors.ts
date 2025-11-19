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

export class JobClosed extends BaseError {
    static readonly code = 422;

    constructor() {
        super(JobClosed.code, "Non è possibile aggiungere ore ad una commessa chiusa!");
    }

}