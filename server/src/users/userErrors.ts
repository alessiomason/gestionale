import {BaseError} from "../errors";

export class UserIdError extends BaseError {
    static code = 500

    constructor(message: string) {
        super(UserIdError.code, message);
    }
}

export class UserNotFound extends BaseError {
    static code = 404

    constructor() {
        super(UserNotFound.code, "User not found!");
    }
}