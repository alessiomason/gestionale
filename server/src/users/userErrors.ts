import {BaseError} from "../errors";

export class UserNotFound extends BaseError {
    static code = 404

    constructor() {
        super(UserNotFound.code, "User not found!");
    }
}