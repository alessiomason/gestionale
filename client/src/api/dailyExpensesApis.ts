import {apiUrl} from "./apisValues";
import {handleApiError} from "./handleApiError";
import {DailyExpense} from "../models/dailyExpense";

function rebuildDailyExpense(dailyExpense: DailyExpense) {
    return new DailyExpense(
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
    );
}

async function getAllDailyExpenses(month: string) {
    const response = await fetch(new URL(`dailyExpenses/${month}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        const dailyExpenses = await response.json() as DailyExpense[];
        return dailyExpenses.map(dailyExpense => rebuildDailyExpense(dailyExpense));
    } else await handleApiError(response);
}

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
        return dailyExpenses.map(dailyExpense => rebuildDailyExpense(dailyExpense));
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

async function getPendingHolidayHours() {
    const response = await fetch(new URL("dailyExpenses/pending", apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

const dailyExpenseApis = {getAllDailyExpenses, getDailyExpenses, createOrUpdateDailyExpense, getPendingHolidayHours};
export default dailyExpenseApis;