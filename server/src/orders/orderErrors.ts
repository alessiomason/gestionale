import {BaseError} from "../errors";

export class OrderNotFound extends BaseError {
    static readonly code = 404;

    constructor() {
        super(OrderNotFound.code, "Ordine non trovato!");
    }
}