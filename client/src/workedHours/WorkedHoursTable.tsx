import React, {useEffect, useState} from "react";
import {Table} from "react-bootstrap";
import dayjs from "dayjs";
import "./WorkedHoursTable.css";
import {WorkItem} from "../models/workItem";
import workItemApis from "../api/workItemApis";
import WorkedHoursWorkItemTableCell from "./WorkedHoursWorkItemTableCell";
import {User} from "../models/user";
import {Job} from "../models/job";
import {DailyExpense} from "../models/dailyExpense";
import dailyExpenseApis from "../api/dailyExpensesApis";
import WorkedHoursDailyTableCell from "./WorkedHoursDailyTableCell";
import WorkedHoursDestinationTableCell from "./WorkedHoursDestinationTableCell";

interface WorkedHoursTableProps {
    readonly user: User
    readonly month: number
    readonly year: number
    readonly setSavingStatus: React.Dispatch<React.SetStateAction<"" | "saving" | "saved">>
}

function WorkedHoursTable(props: WorkedHoursTableProps) {
    const daysInMonth = dayjs(`${props.year}-${props.month}-01`).daysInMonth();
    let workdays: dayjs.Dayjs[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        workdays.push(dayjs(`${props.year}-${props.month}-${i}`))
    }

    const [workItems, setWorkItems] = useState<WorkItem[]>();
    const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
    const [dirty, setDirty] = useState(true);

    let monthExtraHours = 0;
    let monthTotalHours = 0;
    let monthHolidayHours = 0;
    let monthSickHours = 0;
    let monthDonationHours = 0;
    let monthFurloughHours = 0;
    let monthTravelHours = 0;
    let monthExpenses = 0;
    let monthKms = 0;
    let monthTripCost = 0;

    useEffect(() => {
        if (dirty) {
            workItemApis.getWorkItems(`${props.year}-${props.month}`, props.user.id)
                .then(workItems => {
                    setWorkItems(workItems);
                    setDirty(false);
                })
                .catch(err => console.error(err))

            dailyExpenseApis.getDailyExpenses(`${props.year}-${props.month}`, props.user.id)
                .then(dailyExpenses => setDailyExpenses(dailyExpenses!))
                .catch(err => console.error(err))
        }
    }, [dirty]);

    useEffect(() => {
        setDirty(true);
    }, [props.month, props.year, props.user.id]);

    function createOrUpdateLocalWorkItem(job: Job, date: string, hours: number) {
        setWorkItems(workItems => {
            const newWorkItems = workItems ? Array(...workItems) : [];
            const newWorkItem = new WorkItem(props.user.id, job, date, hours);

            const existingWorkItemIndex = workItems?.findIndex(workItem =>
                workItem.job.id === job.id && workItem.date === date
            ) ?? -1;

            if (existingWorkItemIndex !== -1) {
                if (hours === 0) {  // delete
                    newWorkItems.splice(existingWorkItemIndex, 1);
                } else {            // update
                    newWorkItems[existingWorkItemIndex] = newWorkItem;
                }
            } else {                // create
                newWorkItems.push(newWorkItem);
            }

            return newWorkItems;
        })
    }

    function createOrUpdateLocalDailyExpense(newDailyExpense: DailyExpense) {
        setDailyExpenses(dailyExpenses => {
            const newDailyExpenses = dailyExpenses ? Array(...dailyExpenses) : [];

            const existingDailyExpenseIndex = dailyExpenses?.findIndex(dailyExpense =>
                dailyExpense.date === newDailyExpense.date
            ) ?? -1;

            if (existingDailyExpenseIndex !== -1) {
                if (newDailyExpense.isEmpty()) {    // delete
                    newDailyExpenses.splice(existingDailyExpenseIndex, 1);
                } else {                            // update
                    newDailyExpenses[existingDailyExpenseIndex] = newDailyExpense;
                }
            } else {                                // create
                newDailyExpenses.push(newDailyExpense);
            }

            return newDailyExpenses;
        })
    }

    return (
        <Table responsive className="worked-hours-table">
            <thead>
            <tr>
                <th className="left-aligned">Commessa</th>
                <th className="left-aligned">Descrizione</th>
                {workdays.map(workday => {
                    return (
                        <th key={workday.format()}
                            className={(!workday.isBusinessDay() || workday.isHoliday()) ? "holiday" : undefined}>
                            {workday.format("dd")}<br/>
                            {workday.format("D")}
                        </th>
                    );
                })}
                <th>Totale</th>
            </tr>
            </thead>
            <tbody>
            {workItems?.map(workItem => workItem.job)
                .filter((job, index, jobs) =>
                    jobs.map(j => j.id).indexOf(job.id) === index)  // distinct
                .sort((a, b) => a.id.localeCompare(b.id))
                .map(job => {
                    return (
                        <tr key={job.id}>
                            <td className="left-aligned unhoverable">{job.id}</td>
                            <td className="left-aligned unhoverable"><strong>{job.client}</strong> - {job.subject}
                            </td>
                            {!dirty && workdays.map(workday => {
                                const workItem = workItems?.find(workItem =>
                                    workItem.job.id === job.id && workItem.date === workday.format("YYYY-MM-DD")
                                )

                                return (
                                    <WorkedHoursWorkItemTableCell key={`cell-${job.id}-${workday.format("YYYY-MM-DD")}`}
                                                                  job={job} workday={workday} workItem={workItem}
                                                                  user={props.user}
                                                                  setSavingStatus={props.setSavingStatus}
                                                                  createOrUpdateLocalWorkItem={createOrUpdateLocalWorkItem}/>
                                );
                            })}
                            <td className="unhoverable">
                                <strong>
                                    {workItems?.filter(workItem => workItem.job.id === job.id)
                                        .map(workItem => workItem.hours)
                                        .reduce((totalHours, hours) => totalHours + hours, 0) ?? 0}
                                </strong>
                            </td>
                        </tr>
                    );
                })}

            <tr>
                <td colSpan={daysInMonth + 3} className="unhoverable"/>
            </tr>

            <tr>
                <td className="unhoverable vertical-center" rowSpan={2}>Totali</td>
                <td className="left-aligned unhoverable">Straordinari</td>
                {workdays.map(workday => {
                    const totalHours = workItems?.filter(workItem => workItem.date === workday.format("YYYY-MM-DD"))
                        .map(workItem => workItem.hours)
                        .reduce((totalHours, hours) => totalHours + hours, 0) ?? 0;
                    let extraHours = 0;
                    // day is holiday, Sunday or Saturday (Saturday is marked as a business day but all hours are extra hours)
                    if (workday.isHoliday() || !workday.isBusinessDay() || workday.format("d") === "6") {
                        extraHours = totalHours;
                    } else if (totalHours > 8) {
                        extraHours = totalHours - props.user.hoursPerDay;
                    }

                    monthExtraHours += extraHours;

                    return (
                        <td key={`extra-hours-${workday.format()}`}
                            className={(!workday.isBusinessDay() || workday.isHoliday()) ? "holiday unhoverable" : "unhoverable"}>
                            {extraHours === 0 ? "" : extraHours}
                        </td>
                    );
                })}
                <td className="unhoverable">{monthExtraHours}</td>
            </tr>

            <tr>
                <td className="left-aligned unhoverable"><strong>Totale ore</strong></td>
                {workdays.map(workday => {
                    const totalHours = workItems?.filter(workItem => workItem.date === workday.format("YYYY-MM-DD"))
                        .map(workItem => workItem.hours)
                        .reduce((totalHours, hours) => totalHours + hours, 0) ?? 0;
                    monthTotalHours += totalHours;

                    return (
                        <td key={`total-hours-${workday.format()}`}
                            className={(!workday.isBusinessDay() || workday.isHoliday()) ? "holiday unhoverable" : "unhoverable"}>
                            <strong>{totalHours === 0 ? "" : totalHours}</strong>
                        </td>
                    );
                })}
                <td className="unhoverable"><strong>{monthTotalHours}</strong></td>
            </tr>

            <tr>
                <td colSpan={daysInMonth + 3} className="unhoverable"/>
            </tr>

            <tr>
                <td className="unhoverable vertical-center" rowSpan={5}>Ore personali</td>
                <td className="left-aligned unhoverable">Ferie/permessi</td>
                {!dirty && workdays.map(workday => {
                    const dailyExpense = dailyExpenses.find(dailyExpense =>
                        dailyExpense.date === workday.format("YYYY-MM-DD")
                    );
                    monthHolidayHours += dailyExpense?.holidayHours ?? 0;

                    return (
                        <WorkedHoursDailyTableCell key={`cell-holidayHours-${workday.format("YYYY-MM-DD")}`}
                                                   workday={workday} dailyExpense={dailyExpense} field={"holidayHours"}
                                                   user={props.user} setSavingStatus={props.setSavingStatus}
                                                   createOrUpdateLocalDailyExpense={createOrUpdateLocalDailyExpense}/>
                    );
                })}
                <td className="unhoverable">{monthHolidayHours}</td>
            </tr>

            <tr>
                <td className="left-aligned unhoverable">Malattia</td>
                {!dirty && workdays.map(workday => {
                    const dailyExpense = dailyExpenses.find(dailyExpense =>
                        dailyExpense.date === workday.format("YYYY-MM-DD")
                    );
                    monthSickHours += dailyExpense?.sickHours ?? 0;

                    return (
                        <WorkedHoursDailyTableCell key={`cell-sickHours-${workday.format("YYYY-MM-DD")}`}
                                                   workday={workday} dailyExpense={dailyExpense} field={"sickHours"}
                                                   user={props.user} setSavingStatus={props.setSavingStatus}
                                                   createOrUpdateLocalDailyExpense={createOrUpdateLocalDailyExpense}/>
                    );
                })}
                <td className="unhoverable">{monthSickHours}</td>
            </tr>

            <tr>
                <td className="left-aligned unhoverable">Donazione</td>
                {!dirty && workdays.map(workday => {
                    const dailyExpense = dailyExpenses.find(dailyExpense =>
                        dailyExpense.date === workday.format("YYYY-MM-DD")
                    );
                    monthDonationHours += dailyExpense?.donationHours ?? 0;

                    return (
                        <WorkedHoursDailyTableCell key={`cell-donationHours-${workday.format("YYYY-MM-DD")}`}
                                                   workday={workday} dailyExpense={dailyExpense} field={"donationHours"}
                                                   user={props.user} setSavingStatus={props.setSavingStatus}
                                                   createOrUpdateLocalDailyExpense={createOrUpdateLocalDailyExpense}/>
                    );
                })}
                <td className="unhoverable">{monthDonationHours}</td>
            </tr>

            <tr>
                <td className="left-aligned unhoverable">Cassa integrazione</td>
                {!dirty && workdays.map(workday => {
                    const dailyExpense = dailyExpenses.find(dailyExpense =>
                        dailyExpense.date === workday.format("YYYY-MM-DD")
                    );
                    monthFurloughHours += dailyExpense?.furloughHours ?? 0;

                    return (
                        <WorkedHoursDailyTableCell key={`cell-furloughHours-${workday.format("YYYY-MM-DD")}`}
                                                   workday={workday} dailyExpense={dailyExpense} field={"furloughHours"}
                                                   user={props.user} setSavingStatus={props.setSavingStatus}
                                                   createOrUpdateLocalDailyExpense={createOrUpdateLocalDailyExpense}/>
                    );
                })}
                <td className="unhoverable">{monthFurloughHours}</td>
            </tr>

            <tr>
                <td className="left-aligned unhoverable">Viaggio</td>
                {!dirty && workdays.map(workday => {
                    const dailyExpense = dailyExpenses.find(dailyExpense =>
                        dailyExpense.date === workday.format("YYYY-MM-DD")
                    );
                    monthTravelHours += dailyExpense?.travelHours ?? 0;

                    return (
                        <WorkedHoursDailyTableCell key={`cell-travelHours-${workday.format("YYYY-MM-DD")}`}
                                                   workday={workday} dailyExpense={dailyExpense} field={"travelHours"}
                                                   user={props.user} setSavingStatus={props.setSavingStatus}
                                                   createOrUpdateLocalDailyExpense={createOrUpdateLocalDailyExpense}/>
                    );
                })}
                <td className="unhoverable">{monthTravelHours}</td>
            </tr>

            <tr>
                <td colSpan={daysInMonth + 3} className="unhoverable"/>
            </tr>

            <tr>
                <td className="unhoverable vertical-center" rowSpan={5}>Viaggi</td>
                <td className="left-aligned unhoverable">Spese documentate</td>
                {!dirty && workdays.map(workday => {
                    const dailyExpense = dailyExpenses.find(dailyExpense =>
                        dailyExpense.date === workday.format("YYYY-MM-DD")
                    );
                    monthExpenses += dailyExpense?.expenses ?? 0;

                    return (
                        <WorkedHoursDailyTableCell key={`cell-expenses-${workday.format("YYYY-MM-DD")}`}
                                                   workday={workday} dailyExpense={dailyExpense} field={"expenses"}
                                                   user={props.user} setSavingStatus={props.setSavingStatus}
                                                   createOrUpdateLocalDailyExpense={createOrUpdateLocalDailyExpense}/>
                    );
                })}
                <td className="unhoverable">{monthExpenses}</td>
            </tr>

            <tr>
                <td className="left-aligned unhoverable">Chilometri</td>
                {!dirty && workdays.map(workday => {
                    const dailyExpense = dailyExpenses.find(dailyExpense =>
                        dailyExpense.date === workday.format("YYYY-MM-DD")
                    );
                    monthKms += dailyExpense?.kms ?? 0;

                    return (
                        <WorkedHoursDailyTableCell key={`cell-kms-${workday.format("YYYY-MM-DD")}`}
                                                   workday={workday} dailyExpense={dailyExpense} field={"kms"}
                                                   user={props.user} setSavingStatus={props.setSavingStatus}
                                                   createOrUpdateLocalDailyExpense={createOrUpdateLocalDailyExpense}/>
                    );
                })}
                <td className="unhoverable">{monthKms}</td>
            </tr>

            <tr>
                <td className="left-aligned unhoverable">Costo del viaggio</td>
                {!dirty && workdays.map(workday => {
                    const dailyTripCost = dailyExpenses.find(dailyExpense =>
                        dailyExpense.date === workday.format("YYYY-MM-DD")
                    )?.tripCost;
                    monthTripCost += dailyTripCost ?? 0;

                    return (
                        <td key={`td-tripCost-${workday.format("YYYY-MM-DD")}`}
                            className={(!workday.isBusinessDay() || workday.isHoliday()) ? "holiday unhoverable" : "unhoverable"}>
                            {(!dailyTripCost || dailyTripCost === 0) ? "" : ("€ " + dailyTripCost)}
                        </td>
                    );
                })}
                <td className="unhoverable">{monthTripCost}</td>
            </tr>

            <tr>
                <td className="left-aligned unhoverable">Destinazione</td>
                {!dirty && workdays.map(workday => {
                    const dailyExpense = dailyExpenses.find(dailyExpense =>
                        dailyExpense.date === workday.format("YYYY-MM-DD")
                    );

                    return (
                        <WorkedHoursDestinationTableCell key={`cell-destination-${workday.format("YYYY-MM-DD")}`}
                                                         workday={workday} dailyExpense={dailyExpense}
                                                         user={props.user} setSavingStatus={props.setSavingStatus}
                                                         createOrUpdateLocalDailyExpense={createOrUpdateLocalDailyExpense}/>
                    );
                })}
                <td className="unhoverable"/>
            </tr>
            </tbody>
        </Table>
    );
}

export default WorkedHoursTable;