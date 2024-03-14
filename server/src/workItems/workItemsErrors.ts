import {BaseError} from "../errors";

export class InvalidMonth extends BaseError {
    static readonly code = 422;

    constructor() {
        super(InvalidMonth.code, "Formattazione del mese non valida!");
    }
}