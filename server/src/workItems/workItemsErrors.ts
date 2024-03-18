import {BaseError} from "../errors";

export class InvalidDate extends BaseError {
    static readonly code = 422;

    constructor() {
        super(InvalidDate.code, "Formattazione della data non valida!");
    }
}