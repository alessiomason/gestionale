import {Type, User} from "./models/user";
import ExcelJS from "exceljs";

export function humanize(x: number, fractionDigits: number) {
    return x.toFixed(fractionDigits)
        .replace(/\.?0*$/, '')
        .replace(/\./g, ',');
}

export function upperCaseFirst(str: string) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

// Extremely simple email validation function, useful to eliminate major mistakes.
export function checkValidEmail(email: string) {
    return email.includes("@") && email.includes(".");
}

// Valid password requires 8 characters or more, one lowercase, one uppercase letter and a number.
export function checkValidPassword(password: string) {
    const lowercaseLetters = /[a-z]/g;
    const uppercaseLetters = /[A-Z]/g;
    const numbers = /[0-9]/g;

    return password.length >= 8 && password.match(lowercaseLetters) && password.match(uppercaseLetters) && password.match(numbers);
}

// Compares users, sorting active users first, machines last and then sorting by surname and name.
export function compareUsers(a: User, b: User) {
    // sort active first
    if (!a.active && b.active) return 1;
    else if (a.active && !b.active) return -1;

    // sort machines last
    if (a.type === Type.machine && b.type !== Type.machine) return 1;
    if (a.type !== Type.machine && b.type === Type.machine) return -1;

    // sort by surname and name
    const surnameComparison = a.surname.localeCompare(b.surname);
    return surnameComparison !== 0 ? surnameComparison : a.name.localeCompare(b.name);
}

// Exports an Excel file and downloads it.
export async function downloadExcel(workbook: ExcelJS.Workbook, fileName: string) {
    const buffer = await workbook.xlsx.writeBuffer();
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8";
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