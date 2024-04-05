import {checkValidMonth} from "../functions";
import {knex} from "../database/db";
import {CompanyHoursItem} from "./companyHoursItem";
import {User} from "../users/user";
import {DailyExpense} from "../dailyExpenses/dailyExpense";
import {getAllDailyExpenses, getDailyExpense, getDailyExpenses} from "../dailyExpenses/dailyExpenseService";
import {getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";

export async function getCompanyHours(month: string) {
    const formattedMonth = checkValidMonth(month);

    const companyHoursResult = await knex("workItems")
        .join("users", "workItems.userId", "users.id")
        .leftJoin("dailyExpenses", {"dailyExpenses.userId": "workItems.userId", "dailyExpenses.date": "workItems.date"})
        .whereRaw("work_items.date LIKE ?", formattedMonth + "-%")
        .groupBy("users.id", "users.role", "users.type", "users.active", "users.managesTickets",
            "users.email", "users.name", "users.surname", "users.username", "users.phone", "users.hoursPerDay",
            "users.costPerHour", "users.car", "users.costPerKm", "workItems.date", "dailyExpenses.expenses",
            "dailyExpenses.travelHours", "dailyExpenses.holidayHours", "dailyExpenses.sickHours",
            "dailyExpenses.donationHours", "dailyExpenses.furloughHours")
        .select("users.id as userId", "users.role", "users.type", "users.active",
            "users.managesTickets", "users.email", "users.name", "users.surname",
            "users.username", "users.phone", "users.hoursPerDay", "users.costPerHour",
            "users.car", "users.costPerKm", "workItems.date", "dailyExpenses.expenses",
            "dailyExpenses.travelHours", "dailyExpenses.holidayHours", "dailyExpenses.sickHours",
            "dailyExpenses.donationHours", "dailyExpenses.furloughHours",
            knex.raw("SUM(work_items.hours) as workedHours"));

    const companyHours = companyHoursResult.map(companyHoursItem => {
        const user = new User(
            companyHoursItem.userId,
            companyHoursItem.role,
            companyHoursItem.type,
            companyHoursItem.name,
            companyHoursItem.surname,
            companyHoursItem.username,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            parseFloat(companyHoursItem.hoursPerDay),
            parseFloat(companyHoursItem.costPerHour),
            companyHoursItem.active === 1,
            companyHoursItem.managesTickets === 1,
            companyHoursItem.email,
            companyHoursItem.phone,
            companyHoursItem.car,
            parseFloat(companyHoursItem.costPerKm)
        );

        return new CompanyHoursItem(
            user,
            companyHoursItem.date,
            parseFloat(companyHoursItem.workedHours),
            0,
            0,
            0,
            0,
            0,
            0
        );
    })

    const companyDailyExpenses = await getAllDailyExpenses(formattedMonth);

    for (let companyDailyExpense of companyDailyExpenses) {
        const companyHoursItem = companyHours.find(companyWorkedHoursItem =>
        companyWorkedHoursItem.user.id === companyDailyExpense.userId);

        // only attach daily expenses to company worked hours item, otherwise create a new item and push it in the array
        if (companyHoursItem) {
            companyHoursItem.travelHours = companyDailyExpense.travelHours;
            companyHoursItem.holidayHours = companyDailyExpense.holidayHours;
            companyHoursItem.sickHours = companyDailyExpense.sickHours;
            companyHoursItem.donationHours = companyDailyExpense.donationHours;
            companyHoursItem.furloughHours = companyDailyExpense.furloughHours;
            companyHoursItem.expenses = companyDailyExpense.expenses;
        } else {
            const user = await getUser(companyDailyExpense.userId);
            if (!user) throw new UserNotFound();

            const newCompanyHoursItem = new CompanyHoursItem(
                user,
                companyDailyExpense.date,
                0,
                companyDailyExpense.travelHours,
                companyDailyExpense.holidayHours,
                companyDailyExpense.sickHours,
                companyDailyExpense.donationHours,
                companyDailyExpense.furloughHours,
                companyDailyExpense.expenses
            );
            companyHours.push(newCompanyHoursItem);
        }
    }

    return companyHours;
}