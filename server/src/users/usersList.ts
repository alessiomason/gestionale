import {User} from "./user";
import {getAllUsers} from "./userService";

class UsersList {
    private users: User[] = []
    private usersWithClearedFields: User[] = []
    private valid = false

    async getAllCachedUsers(isAdministrator: boolean) {
        if (!this.valid || this.users.length === 0) {
            this.users = await getAllUsers(true);
            this.prepareUsersWithClearedFields();
            this.valid = true;

            // invalidate cache after 5 minutes
            setTimeout(this.invalidateCache, 5 * 60 * 1000);
        }

        return isAdministrator ? this.users : this.usersWithClearedFields;
    }

    async getCachedUser(userId: number) {
        const users = await this.getAllCachedUsers(true);
        const user = users.find(u => u.id === userId);

        if (!user) return

        user.registrationToken = undefined;
        user.tokenExpiryDate = undefined;

        return user;
    }

    private prepareUsersWithClearedFields() {
        this.usersWithClearedFields = this.users.map(u => {
            return new User(
                u.id,
                u.role,
                u.type,
                u.name,
                u.surname,
                u.username,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                0,
                0,
                u.active,
                u.managesTickets,
                u.managesOrders,
                null,
                null,
                null,
                null
            );
        })
    }

    invalidateCache = () =>  {
        this.valid = false;
    }
}

const usersList = new UsersList();
export {usersList};