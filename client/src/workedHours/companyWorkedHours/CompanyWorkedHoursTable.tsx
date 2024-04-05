import {Table} from "react-bootstrap";
import dayjs from "dayjs";
import workdayClassName from "../workedHoursFunctions";
import React, {useEffect, useState} from "react";
import companyHoursApis from "../../api/companyHoursApis";
import {CompanyHoursItem} from "../../models/companyHoursItem";

interface CompanyWorkedHoursTableProps {
    readonly month: number
    readonly year: number
}

function CompanyWorkedHoursTable(props: CompanyWorkedHoursTableProps) {
    const daysInMonth = dayjs(`${props.year}-${props.month}-01`).daysInMonth();
    let workdays: dayjs.Dayjs[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        workdays.push(dayjs(`${props.year}-${props.month}-${i}`));
    }
    const [companyHours, setCompanyHours] = useState<CompanyHoursItem[]>([]);
    const users = companyHours.map(companyHoursItem => companyHoursItem.user)
        .filter((user, index, users) =>
            users.map(u => u.id).indexOf(user.id) === index);  // distinct

    useEffect(() => {
        companyHoursApis.getCompanyHours(`${props.year}-${props.month}`)
            .then(companyHours => setCompanyHours(companyHours))
            .catch(err => console.error(err))
    }, [props.month, props.year]);

    return (
        <Table responsive className="worked-hours-table">
            <thead>
            <tr>
                <th className="left-aligned">Dipendente</th>
                {workdays.map(workday => {
                    return (
                        <th key={workday.format()} className={workdayClassName(workday, false)}>
                            {workday.format("dd")}<br/>
                            {workday.format("D")}
                        </th>
                    );
                })}
            </tr>
            </thead>
            <tbody>
            {users.map(user => {
                return (
                    <tr key={user.id} className="unhoverable">
                        <td className="px-1">
                            <div className="text-start"><strong>{user.surname} {user.name}</strong></div>
                            <div className="text-end">Ore lavorate</div>
                            <div className="text-end">Ore straordinario</div>
                            <div className="text-end">Ore ferie/permessi</div>
                            <div className="text-end">Ore malattia</div>
                            <div className="text-end">Ore donazione</div>
                            <div className="text-end">Ore cassa integrazione</div>
                            <div className="text-end">Ore viaggio</div>
                            <div className="text-end">Spese documentate</div>
                        </td>

                        {workdays.map(workday => {
                            const companyHoursItem = companyHours.find(companyHoursItem =>
                                companyHoursItem.user.id === user.id && dayjs(companyHoursItem.date).isSame(workday, "day"));

                            let extraHours = 0;
                            // day is holiday, Sunday or Saturday (Saturday is marked as a business day but all hours are extra hours)
                            if (workday.isHoliday() || !workday.isBusinessDay() || workday.format("d") === "6") {
                                extraHours = companyHoursItem?.workedHours ?? 0;
                            } else if (companyHoursItem && companyHoursItem.workedHours > 8) {
                                extraHours = companyHoursItem.workedHours - companyHoursItem.user.hoursPerDay;
                            }

                            return (
                                <td className="px-1">
                                    {companyHoursItem && <>
                                        <div>&nbsp;</div>
                                        <div>{companyHoursItem.workedHours === 0 ? <>&nbsp;</> : companyHoursItem.workedHours}</div>
                                        <div>{extraHours === 0 ? <>&nbsp;</> : extraHours}</div>
                                        <div>{companyHoursItem.holidayHours === 0 ? <>&nbsp;</> : companyHoursItem.holidayHours}</div>
                                        <div>{companyHoursItem.sickHours === 0 ? <>&nbsp;</> : companyHoursItem.sickHours}</div>
                                        <div>{companyHoursItem.donationHours === 0 ? <>&nbsp;</> : companyHoursItem.donationHours}</div>
                                        <div>{companyHoursItem.furloughHours === 0 ? <>&nbsp;</> : companyHoursItem.furloughHours}</div>
                                        <div>{companyHoursItem.travelHours === 0 ? <>&nbsp;</> : companyHoursItem.travelHours}</div>
                                        <div>{companyHoursItem.expenses === 0 ? <>&nbsp;</> : `€ ${companyHoursItem.expenses}`}</div>
                                    </>}
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
            </tbody>
        </Table>
    );
}

export default CompanyWorkedHoursTable;