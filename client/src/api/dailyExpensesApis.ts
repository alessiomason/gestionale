import {apiUrl} from "./apisValues";
import {handleApiError} from "./handleApiError";
import {DailyExpense} from "../models/dailyExpense";

async function getDailyExpenses(month: string, userId: number) {
    const response = await fetch(new URL(`dailyExpenses/${month}/${userId}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        const dailyExpenses = await response.json() as DailyExpense[];
        return dailyExpenses.map(dailyExpense => new DailyExpense(
            dailyExpense.userId,
            dailyExpense.date,
            dailyExpense.expenses,
            dailyExpense.destination,
            dailyExpense.kms,
            dailyExpense.tripCost,
            dailyExpense.travelHours,
            dailyExpense.holidayHours,
            dailyExpense.holidayApproved,
            dailyExpense.sickHours,
            dailyExpense.donationHours,
            dailyExpense.furloughHours
        ));
    } else await handleApiError(response);
}

async function createOrUpdateDailyExpense(newDailyExpense: DailyExpense) {
    const response = await fetch(new URL("dailyExpenses", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(newDailyExpense),
    });
    if (response.ok) {
        return true;
    } else await handleApiError(response);
}

const dailyExpenseApis = {getDailyExpenses, createOrUpdateDailyExpense};
export default dailyExpenseApis;