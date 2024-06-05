import {getAllUsers, getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";
import {knex} from "../database/db";
import {DailyExpense} from "./dailyExpense";
import {checkValidDate, checkValidMonth} from "../functions";

function parseDailyExpense(dailyExpense: any) {
    return new DailyExpense(
        dailyExpense.userId,
        dailyExpense.date,
        parseFloat(dailyExpense.expenses),
        dailyExpense.destination,
        parseFloat(dailyExpense.kms),
        parseFloat(dailyExpense.tripCost),
        parseFloat(dailyExpense.travelHours),
        parseFloat(dailyExpense.holidayHours),
        (dailyExpense.holidayApproved === undefined || dailyExpense.holidayApproved === null) ?
            null : !!dailyExpense.holidayApproved,
        parseFloat(dailyExpense.sickHours),
        parseFloat(dailyExpense.donationHours),
        parseFloat(dailyExpense.furloughHours)
    );
}

export async function getAllDailyExpenses(month: string) {
    const formattedMonth = checkValidMonth(month);

    const dailyExpenses = await knex("dailyExpenses")
        .whereRaw("date LIKE ?", formattedMonth + "-%")
        .select();

    return dailyExpenses.map(dailyExpense => parseDailyExpense(dailyExpense));
}

export async function getDailyExpenses(userId: number, month: string) {
    const formattedMonth = checkValidMonth(month);
    const user = await getUser(userId);
    if (!user) {
        throw new UserNotFound();
    }

    const dailyExpenses = await knex("dailyExpenses")
        .whereRaw("user_id = ?", user.id)
        .andWhereRaw("date LIKE ?", formattedMonth + "-%")
        .select();

    return dailyExpenses.map(dailyExpense => parseDailyExpense(dailyExpense));
}

export async function getDailyExpense(userId: number, date: string) {
    const formattedDate = checkValidDate(date);
    const user = await getUser(userId);
    if (!user) {
        throw new UserNotFound();
    }

    const dailyExpense = await knex("dailyExpenses")
        .whereRaw("user_id = ?", user.id)
        .andWhereRaw("date = ?", formattedDate)
        .first();

    if (!dailyExpense) return

    return parseDailyExpense(dailyExpense);
}

export async function createOrUpdateDailyExpense(newDailyExpense: DailyExpense) {
    const user = await getUser(newDailyExpense.userId);
    if (!user) {
        throw new UserNotFound();
    }
    const existingDailyExpense = await getDailyExpense(newDailyExpense.userId, newDailyExpense.date);

    newDailyExpense.userId = user.id;
    newDailyExpense.tripCost = user.costPerKm ? newDailyExpense.kms * user.costPerKm : undefined;

    if (newDailyExpense.holidayHours === 0 || newDailyExpense.holidayHours !== existingDailyExpense?.holidayHours) {
        newDailyExpense.holidayApproved = null;
    }

    if (existingDailyExpense) {
        if (newDailyExpense.isEmpty()) {    // delete
            await knex("dailyExpenses")
                .where({
                    userId: newDailyExpense.userId,
                    date: newDailyExpense.date
                })
                .delete();
        } else {                            // update
            await knex("dailyExpenses")
                .where({
                    userId: newDailyExpense.userId,
                    date: newDailyExpense.date
                })
                .update(newDailyExpense);
        }
    } else {                                // create
        await knex("dailyExpenses")
            .insert(newDailyExpense);
    }
}

// Updates all daily expenses that have a trip cost equal to 0 to the current trip cost for the specific user.
// A service function destined to developers alone; useful after importing data.
export async function updateTripCosts() {
    const users = await getAllUsers();
    const dailyExpenses = await knex("dailyExpenses").select();

    for (const dailyExpense of dailyExpenses) {
        // only update if cost is zero: only happens with imported data
        if (parseFloat(dailyExpense.tripCost) === 0) {
            const user = users.find(user => dailyExpense.userId === user.id);
            if (!user) throw new UserNotFound();

            const newTripCost = user.costPerKm ? parseFloat(dailyExpense.kms) * user.costPerKm : undefined;
            await knex("tripCosts")
                .where({userId: dailyExpense.userId, date: dailyExpense.date})
                .update({tripCost: newTripCost});
        }
    }
}