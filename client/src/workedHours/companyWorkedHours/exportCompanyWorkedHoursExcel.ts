import ExcelJS from "exceljs";
import dayjs from "dayjs";
import {CompanyHoursItem} from "../../models/companyHoursItem";
import {User} from "../../models/user";
import {downloadExcel} from "../../functions";

function addTotalToRow(row: ExcelJS.Row, firstDayIndex: number, lastDayIndex: number) {
    const firstDayCellAddress = row.getCell(firstDayIndex).address;
    const lastDayCellAddress = row.getCell(lastDayIndex).address;
    row.getCell(lastDayIndex + 1).value = {formula: `SUM(${firstDayCellAddress}:${lastDayCellAddress})`};
}

export async function exportCompanyWorkedHoursExcel(
    month: number,
    year: number,
    workdays: dayjs.Dayjs[],
    companyHours: CompanyHoursItem[],
    users: User[]
) {
    const fileName = `Ore azienda ${year}-${month.toString().padStart(2, "0")}`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(fileName);

    // set column widths
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(1).alignment = {vertical: "middle", horizontal: "center"};
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(2).alignment = {vertical: "middle", horizontal: "center"};
    for (let i = 3; i <= workdays.length + 2; i++) {
        worksheet.getColumn(i).width = 8;
        worksheet.getColumn(i).alignment = {vertical: "middle", horizontal: "center"};
    }
    worksheet.getColumn(workdays.length + 3).width = 8;
    worksheet.getColumn(workdays.length + 3).alignment = {vertical: "middle", horizontal: "right"};

    // header row
    const firstDayOfMonth = `${year}-${month}-01`;
    const hoursTitle = `Ore ${dayjs(firstDayOfMonth).format("MMMM YYYY")}`;
    worksheet.addRow([
        "Collaboratore",
        hoursTitle,
        ...workdays.map(workday => workday.format("dd D")),
        "Totale"
    ]);
    worksheet.getRow(1).font = {bold: true};

    // one section per user
    for (const user of users) {
        const workedHours = workdays.map(workday => {
            const companyHoursItem = companyHours.find(companyHoursItem =>
                companyHoursItem.user.id === user.id && dayjs(companyHoursItem.date).isSame(workday, "day"));
            if (companyHoursItem && companyHoursItem.workedHours !== 0)
                return companyHoursItem.workedHours;
            else return null;
        });
        const extraHours = workdays.map(workday => {
            const companyHoursItem = companyHours.find(companyHoursItem =>
                companyHoursItem.user.id === user.id && dayjs(companyHoursItem.date).isSame(workday, "day"));

            let extraHours: number | null = null;
            // day is holiday, Sunday or Saturday (Saturday is marked as a business day but all hours are extra hours)
            if (workday.isHoliday() || !workday.isBusinessDay() || workday.format("d") === "6") {
                extraHours = companyHoursItem?.workedHours ?? null;
            } else if (companyHoursItem && companyHoursItem.workedHours > 8) {
                extraHours = companyHoursItem.workedHours - companyHoursItem.user.hoursPerDay;
            }

            return extraHours;
        })
        const holidayHours = workdays.map(workday => {
            const companyHoursItem = companyHours.find(companyHoursItem =>
                companyHoursItem.user.id === user.id && dayjs(companyHoursItem.date).isSame(workday, "day"));
            if (companyHoursItem && companyHoursItem.holidayHours !== 0)
                return companyHoursItem.holidayHours;
            else return null;
        });
        const sickHours = workdays.map(workday => {
            const companyHoursItem = companyHours.find(companyHoursItem =>
                companyHoursItem.user.id === user.id && dayjs(companyHoursItem.date).isSame(workday, "day"));
            if (companyHoursItem && companyHoursItem.sickHours !== 0)
                return companyHoursItem.sickHours;
            else return null;
        });
        const donationHours = workdays.map(workday => {
            const companyHoursItem = companyHours.find(companyHoursItem =>
                companyHoursItem.user.id === user.id && dayjs(companyHoursItem.date).isSame(workday, "day"));
            if (companyHoursItem && companyHoursItem.donationHours !== 0)
                return companyHoursItem.donationHours;
            else return null;
        });
        const furloughHours = workdays.map(workday => {
            const companyHoursItem = companyHours.find(companyHoursItem =>
                companyHoursItem.user.id === user.id && dayjs(companyHoursItem.date).isSame(workday, "day"));
            if (companyHoursItem && companyHoursItem.furloughHours !== 0)
                return companyHoursItem.furloughHours;
            else return null;
        });
        const travelHours = workdays.map(workday => {
            const companyHoursItem = companyHours.find(companyHoursItem =>
                companyHoursItem.user.id === user.id && dayjs(companyHoursItem.date).isSame(workday, "day"));
            if (companyHoursItem && companyHoursItem.travelHours !== 0)
                return companyHoursItem.travelHours;
            else return null;
        });
        const expenses = workdays.map(workday => {
            const companyHoursItem = companyHours.find(companyHoursItem =>
                companyHoursItem.user.id === user.id && dayjs(companyHoursItem.date).isSame(workday, "day"));
            if (companyHoursItem && companyHoursItem.expenses !== 0)
                return companyHoursItem.expenses;
            else return null;
        });

        const firstDayIndex = 3;
        const lastDayIndex = workdays.length + 2;
        let userRows: ExcelJS.Row[] = [];

        userRows.push(worksheet.addRow([`${user.surname} ${user.name}`, "Ore lavorate", ...workedHours]));
        userRows.push(worksheet.addRow([null, "Ore straordinario", ...extraHours]));
        userRows.push(worksheet.addRow([null, "Ore ferie/permessi", ...holidayHours]));
        userRows.push(worksheet.addRow([null, "Ore malattia", ...sickHours]));
        userRows.push(worksheet.addRow([null, "Ore donazione", ...donationHours]));
        userRows.push(worksheet.addRow([null, "Ore cassa integrazione", ...furloughHours]));
        userRows.push(worksheet.addRow([null, "Ore viaggio", ...travelHours]));
        userRows.push(worksheet.addRow([null, "Spese documentate", ...expenses]));

        worksheet.mergeCells(`${userRows[0].getCell(1).address}:${userRows[userRows.length - 1].getCell(1).address}`);
        for (const row of userRows) {
            addTotalToRow(row, firstDayIndex, lastDayIndex);
        }

        worksheet.addRow(null);
    }

    await downloadExcel(workbook, fileName);
}