import dayjs from "dayjs";
import {User} from "../../models/user";
import {MonthWorkItem} from "../../models/workItem";
import ExcelJS from "exceljs";
import {downloadExcel} from "../../functions";

export async function exportMonthlyWorkedHoursExcel(
    month: number,
    year: number,
    monthWorkItems: MonthWorkItem[],
    users: User[]
) {
    const fileName = `Ore mensili ${year}-${month.toString().padStart(2, "0")}`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(fileName);

    // set column widths
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(1).alignment = {vertical: "middle", horizontal: "center"};
    worksheet.getColumn(2).width = 10;
    worksheet.getColumn(2).alignment = {vertical: "middle", horizontal: "center"};
    worksheet.getColumn(3).width = 60;
    worksheet.getColumn(3).alignment = {vertical: "middle", horizontal: "left"};
    worksheet.getColumn(4).width = 10;
    worksheet.getColumn(4).alignment = {vertical: "middle", horizontal: "center"};

    // header row
    const firstDayOfMonth = `${year}-${month}-01`;
    const hoursTitle = `Ore mensili ${dayjs(firstDayOfMonth).format("MMMM YYYY")}`;
    const firstRow = worksheet.addRow([hoursTitle, null, null, null]);
    worksheet.mergeCells(`${firstRow.getCell(1).address}:${firstRow.getCell(4).address}`);
    firstRow.getCell(1).font = {bold: true};

    worksheet.addRow(null);

    // one section per user
    for (let user of users) {
        const userFirstRow = worksheet.addRow([
            null,
            "Commessa",
            "Descrizione",
            "Ore mensili"
        ]);
        userFirstRow.font = {bold: true};

        const userMonthWorkItems = monthWorkItems.filter(monthWorkItem =>
            monthWorkItem.user.id === user.id);
        let userRows: ExcelJS.Row[] = [];

        for (let userMonthWorkItem of userMonthWorkItems) {
            userRows.push(worksheet.addRow([
                userRows.length === 0 ? `${user.surname} ${user.name}` : null,
                userMonthWorkItem.job.id,
                `${userMonthWorkItem.job.client} - ${userMonthWorkItem.job.subject}`,
                userMonthWorkItem.totalHours
            ]))
        }

        const totalRow = worksheet.addRow([
            null,
            "Totale",
            null,
            {formula: `SUM(${userRows[0].getCell(4).address}:${userRows[userRows.length - 1].getCell(4).address})`}
        ]);
        totalRow.font = {bold: true};

        worksheet.mergeCells(`${userRows[0].getCell(1).address}:${userRows[userRows.length - 1].getCell(1).address}`)
        userRows[0].getCell(1).font = {bold: true};

        worksheet.addRow(null);
    }

    await downloadExcel(workbook, fileName);
}