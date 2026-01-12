import {knex} from "../database/db";
import {Job} from "../jobs/job";
import {NewReport, Report} from "./report";
import {User} from "../users/user";
import {ReportWorkingDay} from "./reportWorkingDay";
import {ReportNotFound} from "./reportErrors";
import {getJob} from "../jobs/jobService";
import {JobNotFound} from "../jobs/jobErrors";
import {usersList} from "../users/usersList";
import {UserNotFound} from "../users/userErrors";

function parseReport(report: any) {
    const operator = new User(
        report.operatorId,
        report.role,
        report.type,
        report.name,
        report.surname,
        report.username,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        parseFloat(report.hoursPerDay),
        parseFloat(report.costPerHour),
        report.activeUser === 1,
        report.managesTickets === 1,
        report.managesOrders === 1,
        report.email,
        report.phone,
        report.car,
        parseFloat(report.costPerKm)
    );

    const job = new Job(
        report.jobId,
        report.subject,
        report.client,
        report.finalClient,
        report.orderName,
        parseFloat(report.orderAmount),
        report.startDate,
        report.deliveryDate,
        report.notes,
        !!report.active,
        !!report.inProgress,
        !!report.lost,
        !!report.design,
        !!report.construction,
        report.totalWorkedHours ? parseFloat(report.totalWorkedHours) : 0
    );

    return new Report(
        report.id,
        operator,
        report.date,
        job,
        report.address,
        report.machine,
        report.jobsDone,
        report.jobsToBeDone,
        report.reportVehicle,
        report.reportExpenses,
        report.supplyIncludesIntervention === 1,
        []
    );
}

function parseReportWithWorkingDays(reportWorkingDays: any[]) {
    let fullReport = parseReport(reportWorkingDays[0]);

    fullReport.workingDays = reportWorkingDays.map((workingDay: any) => {
        return new ReportWorkingDay(
            workingDay.workingDayDate,
            workingDay.morningStartTime,
            workingDay.morningEndTime,
            workingDay.afternoonStartTime,
            workingDay.afternoonEndTime,
            parseFloat(workingDay.hours),
            parseFloat(workingDay.travelHours),
            parseFloat(workingDay.kms)
        );
    });

    return fullReport;
}

function parseReports(reports: any) {
    return reports.map((report: any) => parseReport(report));
}

export async function getAllReports() {
    const reports = await knex<Report>("reports")
        .join("jobs", "jobs.id", "reports.jobId")
        .join("users", "users.id", "reports.operatorId")
        .select("reports.*", "jobs.subject", "jobs.client", "jobs.finalClient",
            "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate", "jobs.notes", "jobs.active",
            "jobs.inProgress", "jobs.lost", "jobs.design", "jobs.construction", "users.role", "users.type", "users.name",
            "users.surname", "users.username", "users.hoursPerDay", "users.costPerHour", "users.active AS activeUser",
            "users.managesTickets", "users.managesOrders", "users.email", "users.phone", "users.car", "users.costPerKm");

    return parseReports(reports);
}

export async function getReport(id: number) {
    const reportWorkingDays = await knex("reports")
        .join("jobs", "jobs.id", "reports.jobId")
        .join("users", "users.id", "reports.operatorId")
        .join("reportWorkingDays AS rwd", "rwd.reportId", "reports.id")
        .whereRaw("reports.id = ?", id)
        .select("reports.*", "jobs.subject", "jobs.client", "jobs.finalClient",
            "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate", "jobs.notes", "jobs.active",
            "jobs.inProgress", "jobs.lost", "jobs.design", "jobs.construction", "users.role", "users.type", "users.name",
            "users.surname", "users.username", "users.hoursPerDay", "users.costPerHour", "users.active AS activeUser",
            "users.managesTickets", "users.managesOrders", "users.email", "users.phone", "users.car", "users.costPerKm",
            "rwd.date AS workingDayDate", "rwd.morningStartTime", "rwd.morningEndTime", "rwd.afternoonStartTime",
            "rwd.afternoonEndTime", "rwd.hours", "rwd.travelHours", "rwd.kms") as any[];

    if (!reportWorkingDays) throw new ReportNotFound();

    return parseReportWithWorkingDays(reportWorkingDays);
}

export async function createReport(newReport: NewReport) {
    const job = await getJob(newReport.jobId);
    if (!job) throw new JobNotFound();
    const operator = await usersList.getCachedUser(newReport.operatorId);
    if (!operator) throw new UserNotFound();

    const ids = await knex("reports").returning("id").insert(newReport);

    return new Report(
        ids[0],
        operator,
        newReport.date,
        job,
        newReport.address,
        newReport.machine,
        newReport.jobsDone,
        newReport.jobsToBeDone,
        newReport.reportVehicle,
        newReport.reportExpenses,
        newReport.supplyIncludesIntervention,
        []
    );
}

export async function updateReport(id: number, newReport: NewReport) {
    await knex("reports")
        .where({id})
        .update(newReport);
}

export async function deleteReport(id: number) {
    await knex("reports")
        .where({id})
        .delete();
}