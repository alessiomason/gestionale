import {BaseError} from "../errors";

export class PlannedDayNotFound extends BaseError {
    static readonly code = 404;

    constructor() {
        super(PlannedDayNotFound.code, "Ordine non trovato!");
    }
}