import {getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";
import {knex} from "../database/db";
import {checkValidDate, checkValidMonth} from "../workItems/workItemService";
import {DailyExpense} from "./dailyExpense";

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

    return dailyExpenses.map(dailyExpense => new DailyExpense(
        dailyExpense.userId,
        dailyExpense.date,
        parseFloat(dailyExpense.expenses),
        dailyExpense.destination,
        parseFloat(dailyExpense.kms),
        parseFloat(dailyExpense.tripCost),
        parseFloat(dailyExpense.travelHours),
        parseFloat(dailyExpense.holidayHours),
        parseFloat(dailyExpense.sickHours),
        parseFloat(dailyExpense.donationHours),
        parseFloat(dailyExpense.furloughHours)
    ));
}

export async function getDailyExpense(userId: number, date: string) {
    const formattedDate = checkValidDate(date);
    const user = await getUser(userId);
    if (!user) {
        throw new UserNotFound();
    }

    const dailyExpense = await knex("dailyExpenses")
        .whereRaw("user_id = ?", user.id)
        .andWhereRaw("date LIKE ?", formattedDate + "-%")
        .first();

    if (!dailyExpense) return

    return new DailyExpense(
        dailyExpense.userId,
        dailyExpense.date,
        parseFloat(dailyExpense.expenses),
        dailyExpense.destination,
        parseFloat(dailyExpense.kms),
        parseFloat(dailyExpense.tripCost),
        parseFloat(dailyExpense.travelHours),
        parseFloat(dailyExpense.holidayHours),
        parseFloat(dailyExpense.sickHours),
        parseFloat(dailyExpense.donationHours),
        parseFloat(dailyExpense.furloughHours)
    )
}

export async function createOrUpdateDailyExpense(newDailyExpense: DailyExpense) {
    const user = await getUser(newDailyExpense.userId);
    if (!user) {
        throw new UserNotFound();
    }
    const existingDailyExpense = await getDailyExpense(newDailyExpense.userId, newDailyExpense.date);

    newDailyExpense.userId = user.id;
    newDailyExpense.tripCost = user.costPerKm ? newDailyExpense.kms * user.costPerKm : undefined;

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