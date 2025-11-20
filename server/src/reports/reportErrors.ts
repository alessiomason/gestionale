import {BaseError} from "../errors";

export class ReportNotFound extends BaseError {
    static readonly code = 404;

    constructor() {
        super(ReportNotFound.code, "Rapportino non trovato!");
    }
}