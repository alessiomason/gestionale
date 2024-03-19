import React, {useEffect, useState} from "react";
import {Col, Row, Table} from "react-bootstrap";
import dayjs from "dayjs";
import "./WorkedHoursTable.css";
import {WorkItem} from "../models/workItem";
import workItemApis from "../api/workItemApis";
import WorkedHoursTableCell from "./WorkedHoursTableCell";

interface WorkedHoursTableProps {
    readonly month: number
    readonly year: number
}

function WorkedHoursTable(props: WorkedHoursTableProps) {
    const daysInMonth = dayjs(`${props.year}-${props.month}-01`).daysInMonth();
    let workdays: dayjs.Dayjs[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        workdays.push(dayjs(`${props.year}-${props.month}-${i}`))
    }

    const [workItems, setWorkItems] = useState<WorkItem[]>();

    useEffect(() => {
        workItemApis.getWorkItems(`${props.year}-${props.month}`)
            .then(workItems => setWorkItems(workItems))
            .catch(err => console.error(err))
    }, [props.month, props.year]);

    return (
        <Table responsive className="worked-hours-table">
            <thead>
            <tr>
                <th className="left-aligned">Commessa</th>
                <th className="left-aligned">Descrizione</th>
                {workdays.map(workday => {
                    return (
                        <th key={workday.format()} className={(!workday.isBusinessDay() || workday.isHoliday()) ? "holiday" : undefined}>
                            {workday.format("dd")}<br/>
                            {workday.format("D")}
                        </th>
                    );
                })}
                <th>Totale</th>
            </tr>
            </thead>
            <tbody>
            {
                workItems?.map(workItem => workItem.job)
                    .filter((job, index, jobs) =>
                        jobs.map(j => j.id).indexOf(job.id) === index)  // distinct
                    .sort((a, b) => a.id.localeCompare(b.id))
                    .map(job => {
                        return (
                            <tr key={job.id}>
                                <td className="left-aligned unhoverable">{job.id}</td>
                                <td className="left-aligned unhoverable"><strong>{job.client}</strong> - {job.subject}</td>
                                {workdays.map(workday => {
                                    return (
                                        <WorkedHoursTableCell job={job} workday={workday} workItems={workItems}/>
                                    );
                                })}
                                <td className="unhoverable">0</td>
                            </tr>
                        );
                    })
            }
            </tbody>
        </Table>
    );
}

export default WorkedHoursTable;