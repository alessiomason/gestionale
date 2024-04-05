import {InvalidDate} from "./workItems/workItemErrors";

export function humanize(x: number, fractionDigits: number) {
    return x.toFixed(fractionDigits).replace(/\.?0*$/,'');
}

export function checkValidMonth(month: string) {
    // check that month is YYYY-MM
    const splitMonth = month.split("-");
    if (splitMonth.length === 2) {
        const year = parseInt(splitMonth[0]);
        const monthOfYear = parseInt(splitMonth[1]);
        if (year < 0 || Number.isNaN(year) ||
            monthOfYear < 0 || monthOfYear > 12 || Number.isNaN(monthOfYear)) {
            throw new InvalidDate();
        }

        return `${year}-${monthOfYear.toString().padStart(2, "0")}`;
    } else {
        throw new InvalidDate();
    }
}

export function checkValidDate(date: string) {
    // check that date is YYYY-MM-DD
    const splitDate = date.split("-");
    if (splitDate.length === 3) {
        const year = parseInt(splitDate[0]);
        const monthOfYear = parseInt(splitDate[1]);
        const day = parseInt(splitDate[2]);
        if (year < 0 || Number.isNaN(year) ||
            monthOfYear < 0 || monthOfYear > 12 || Number.isNaN(monthOfYear) ||
            day < 0 || day > 31 || Number.isNaN(day)) {
            throw new InvalidDate();
        }

        return `${year}-${monthOfYear.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    } else {
        throw new InvalidDate();
    }
}