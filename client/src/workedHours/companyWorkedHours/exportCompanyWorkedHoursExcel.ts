import ExcelJS from "exceljs";
import dayjs from "dayjs";
import {CompanyHoursItem} from "../../models/companyHoursItem";
import {User} from "../../models/user";

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

    // Set column widths
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(1).alignment = {vertical: "middle", horizontal: "center"};
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(2).alignment = {vertical: "middle", horizontal: "center"};
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(2).alignment = {vertical: "middle", horizontal: "center"};
    for (let i = 3; i <= workdays.length + 2; i++) {
        worksheet.getColumn(i).width = 8;
        worksheet.getColumn(i).alignment = {vertical: "middle", horizontal: "center"};
    }

    // header row
    const firstDayOfMonth = `${year}-${month}-01`;
    const hoursTitle = `Ore ${dayjs(firstDayOfMonth).format("MMMM")} ${year}`;
    worksheet.addRow(["Dipendente", hoursTitle, ...workdays.map(workday => workday.format("dd D"))]);
    worksheet.getRow(1).font = {bold: true};

    // one section per user
    users.forEach(user => {
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

        const firstRow = worksheet.addRow([`${user.surname} ${user.name}`, "Ore lavorate", ...workedHours]);
        worksheet.addRow([null, "Ore straordinario", ...extraHours]);
        worksheet.addRow([null, "Ore ferie/permessi", ...holidayHours]);
        worksheet.addRow([null, "Ore malattia", ...sickHours]);
        worksheet.addRow([null, "Ore donazione", ...donationHours]);
        worksheet.addRow([null, "Ore cassa integrazione", ...furloughHours]);
        worksheet.addRow([null, "Ore viaggio", ...travelHours]);
        const lastRow = worksheet.addRow([null, "Spese documentate", ...expenses]);
        worksheet.mergeCells(`${firstRow.getCell(1).address}:${lastRow.getCell(1).address}`);

        worksheet.addRow(null);
    })

    // download file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";
    const blob = new Blob([buffer], {type: fileType});

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.xlsx`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}