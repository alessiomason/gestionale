import {getAllUsers} from "../users/userService";
import {usersList} from "../users/usersList";
import {UserNotFound} from "../users/userErrors";
import {knex} from "../database/db";
import {DailyExpense} from "./dailyExpense";
import {checkValidDate, checkValidMonth} from "../functions";
import {sendEmail} from "../email/emailService";

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
        parseFloat(dailyExpense.furloughHours),
        parseFloat(dailyExpense.bereavementHours),
        parseFloat(dailyExpense.paternityHours)
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

    const dailyExpenses = await knex("dailyExpenses")
        .whereRaw("user_id = ?", userId)
        .andWhereRaw("date LIKE ?", formattedMonth + "-%")
        .select();

    return dailyExpenses.map(dailyExpense => parseDailyExpense(dailyExpense));
}

export async function getDailyExpense(userId: number, date: string) {
    const formattedDate = checkValidDate(date);

    const dailyExpense = await knex("dailyExpenses")
        .whereRaw("user_id = ?", userId)
        .andWhereRaw("date = ?", formattedDate)
        .first();

    if (!dailyExpense) return

    return parseDailyExpense(dailyExpense);
}

export async function createOrUpdateDailyExpense(newDailyExpense: DailyExpense) {
    const user = await usersList.getCachedUser(newDailyExpense.userId);
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

export async function getPendingHolidayHours() {
    const nPending = await knex
        .raw("SELECT COUNT(*) as n FROM daily_expenses WHERE holiday_hours != 0 AND holiday_approved IS NULL");
    return parseInt(nPending[0][0].n);
}

export async function notifyPendingHolidayHours() {
    const nPending = await getPendingHolidayHours();

    if (nPending === 0) return;

    const holidayPlanLink = `${process.env.APP_URL}/holidayPlan`;
    const mailHTML = `
        <h3>Sono presenti ${nPending} richieste di ore ferie/permesso da approvare o rifiutare.</h3>
        <p><a href=${holidayPlanLink}>Clicca qui</a> per accedere alla pagina del piano ferie.</p>
        <p>Questa email è stata generata automaticamente.</p>`;

    const mailText = `
Sono presenti ${nPending} richieste di ore ferie/permesso da approvare o rifiutare.\n
Questa email è stata generata automaticamente.`;

    await sendEmail(process.env.HOLIDAY_PLAN_NOTIFICATION_EMAIL as string,
        "Nuove ore ferie/permesso da approvare", mailHTML, mailText);
}

// Updates all daily expenses that have a trip cost equal to 0 to the current trip cost for the specific user.
// A service function destined to developers alone; useful after importing data.
export async function updateTripCosts() {
    const users = await getAllUsers(true);
    const dailyExpenses = await knex("dailyExpenses").select();

    for (const dailyExpense of dailyExpenses) {
        // only update if cost is zero: only happens with imported data
        if (parseFloat(dailyExpense.tripCost) === 0) {
            const user = users.find(user => dailyExpense.userId === user.id);
            if (!user) throw new UserNotFound();

            const newTripCost = user.costPerKm ? parseFloat(dailyExpense.kms) * user.costPerKm : 0;

            await knex("dailyExpenses")
                .where({userId: dailyExpense.userId, date: dailyExpense.date})
                .update({tripCost: newTripCost});
        }
    }
}