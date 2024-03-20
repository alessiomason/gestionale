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

    return knex<DailyExpense>("dailyExpenses")
        .whereRaw("user_id = ?", user.id)
        .andWhereRaw("date LIKE ?", formattedMonth + "-%")
        .select();
}

export async function getDailyExpense(userId: number, date: string) {
    const formattedDate = checkValidDate(date);
    const user = await getUser(userId);
    if (!user) {
        throw new UserNotFound();
    }

    return knex<DailyExpense>("dailyExpenses")
        .whereRaw("user_id = ?", user.id)
        .andWhereRaw("date LIKE ?", formattedDate + "-%")
        .first();
}

export async function createOrUpdateDailyExpense(newDailyExpense: DailyExpense) {
    const user = await getUser(newDailyExpense.userId);
    if (!user) {
        throw new UserNotFound();
    }
    const existingDailyExpense = await getDailyExpense(newDailyExpense.userId, newDailyExpense.date);

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