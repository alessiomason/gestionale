import {BaseError} from "../errors";

export class JobNotFound extends BaseError {
    static readonly code = 404

    constructor() {
        super(JobNotFound.code, "Commessa non trovata!");
    }
}

export class DuplicateJob extends BaseError {
    static readonly code = 409

    constructor() {
        super(DuplicateJob.code, "Una commessa con lo stesso identificativo esiste già!");
    }
}