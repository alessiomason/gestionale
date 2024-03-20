import React, {useEffect, useState} from "react";
import {Table} from "react-bootstrap";
import dayjs from "dayjs";
import "./WorkedHoursTable.css";
import {WorkItem} from "../models/workItem";
import workItemApis from "../api/workItemApis";
import WorkedHoursTableCell from "./WorkedHoursTableCell";
import {User} from "../models/user";
import {Job} from "../models/job";

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
    const [dirtyWorkItems, setDirtyWorkItems] = useState(true);

    let monthExtraHours = 0;
    let monthTotalHours = 0;

    useEffect(() => {
        if (dirtyWorkItems) {
            workItemApis.getWorkItems(`${props.year}-${props.month}`, props.user.id)
                .then(workItems => {
                    setWorkItems(workItems);
                    setDirtyWorkItems(false);
                })
                .catch(err => console.error(err))
        }
    }, [dirtyWorkItems]);

    useEffect(() => {
        setDirtyWorkItems(true);
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
                            {!dirtyWorkItems && workdays.map(workday => {
                                return (
                                    <WorkedHoursTableCell key={`cell-${job.id}-${workday.format("YYYY-MM-DD")}`}
                                                          job={job} workday={workday} workItems={workItems}
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
                <td className="unhoverable"/>
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
                            className={(!workday.isBusinessDay() || workday.isHoliday()) ? "holiday" : undefined}>
                            {extraHours === 0 ? "" : extraHours}
                        </td>
                    );
                })}
                <td>{monthExtraHours}</td>
            </tr>

            <tr>
                <td className="unhoverable"/>
                <td className="left-aligned unhoverable"><strong>Totale ore</strong></td>
                {workdays.map(workday => {
                    const totalHours = workItems?.filter(workItem => workItem.date === workday.format("YYYY-MM-DD"))
                        .map(workItem => workItem.hours)
                        .reduce((totalHours, hours) => totalHours + hours, 0) ?? 0;
                    monthTotalHours += totalHours;

                    return (
                        <td key={`total-hours-${workday.format()}`}
                            className={(!workday.isBusinessDay() || workday.isHoliday()) ? "holiday" : undefined}>
                            <strong>{totalHours === 0 ? "" : totalHours}</strong>
                        </td>
                    );
                })}
                <td><strong>{monthTotalHours}</strong></td>
            </tr>

            <tr>
                <td colSpan={daysInMonth + 3} className="unhoverable"/>
            </tr>
            </tbody>
        </Table>
    );
}

export default WorkedHoursTable;