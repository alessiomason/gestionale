import {BaseError} from "../errors";

export class OrderNotFound extends BaseError {
    static readonly code = 404;

    constructor() {
        super(OrderNotFound.code, "Ordine non trovato!");
    }
}

export class DuplicateOrder extends BaseError {
    static readonly code = 409;

    constructor() {
        super(DuplicateOrder.code, "Un ordine con lo stesso identificativo esiste già!");
    }
}