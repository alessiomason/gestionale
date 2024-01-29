import {BaseError} from "../errors";

export class UserNotFound extends BaseError {
    static readonly code = 404

    constructor() {
        super(UserNotFound.code, "User not found!");
    }
}

export class UserWithSameUsernameError extends BaseError {
    static readonly code = 422

    constructor() {
        super(UserWithSameUsernameError.code, "A user with the same username already exists!");
    }
}