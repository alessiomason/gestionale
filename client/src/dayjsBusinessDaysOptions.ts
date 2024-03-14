import dayjs from "dayjs";

const currentYear = parseInt(dayjs().format("YYYY"));

let holidays = [];
// add recurring Italian holidays since 2019 through next year
for (let year = 2019; year <= currentYear + 1; year++) {
    holidays.push(`${year}-01-01`);
    holidays.push(`${year}-01-06`);
    holidays.push(`${year}-04-25`);
    holidays.push(`${year}-05-01`);
    holidays.push(`${year}-06-02`);
    holidays.push(`${year}-08-15`);
    holidays.push(`${year}-11-01`);
    holidays.push(`${year}-12-08`);
    holidays.push(`${year}-12-25`);
    holidays.push(`${year}-12-26`);
}

// add Easter Days and Easter Mondays as holidays
holidays.push(
    "2019-04-21", "2019-04-22",
    "2020-04-12", "2020-04-13",
    "2021-04-04", "2021-04-05",
    "2022-04-17", "2022-04-18",
    "2023-04-09", "2023-04-10",
    "2024-03-31", "2024-04-01",
    "2025-04-20", "2025-04-21",
    "2026-04-05", "2026-04-06",
    "2027-03-28", "2027-03-29",
    "2028-04-16", "2028-04-17",
    "2029-04-01", "2029-04-02",
    "2030-04-21", "2030-04-22"
);

export const dayjsBusinessDaysOptions = {
    holidays: holidays,
    holidayFormat: "YYYY-MM-DD",
    workingWeekdays: [1, 2, 3, 4, 5, 6]     // working days: Monday through Saturday
}