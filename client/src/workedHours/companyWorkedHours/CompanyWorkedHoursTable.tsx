import {Col, Row, Table} from "react-bootstrap";
import dayjs from "dayjs";
import workdayClassName from "../workedHoursFunctions";
import React, {useEffect, useState} from "react";
import companyHoursApis from "../../api/companyHoursApis";
import {CompanyHoursItem} from "../../models/companyHoursItem";
import {exportCompanyWorkedHoursExcel} from "./exportCompanyWorkedHoursExcel";
import {compareUsers} from "../../functions";
import GlossyButton from "../../buttons/GlossyButton";
import {FileEarmarkSpreadsheet} from "react-bootstrap-icons";
import "./CompanyWorkedHoursTable.css";
import {useNavigate} from "react-router-dom";

interface CompanyWorkedHoursTableProps {
    readonly month: number
    readonly year: number
}

function CompanyWorkedHoursTable(props: CompanyWorkedHoursTableProps) {
    const navigate = useNavigate();
    const currentMonth = parseInt(dayjs().format("M"));
    const currentYear = parseInt(dayjs().format("YYYY"));
    const daysInMonth = dayjs(`${props.year}-${props.month}-01`).daysInMonth();
    let workdays: dayjs.Dayjs[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        workdays.push(dayjs(`${props.year}-${props.month}-${i}`));
    }

    const [companyHours, setCompanyHours] = useState<CompanyHoursItem[]>([]);
    const users = companyHours.map(companyHoursItem => companyHoursItem.user)
        .filter((user, index, users) =>
            users.map(u => u.id).indexOf(user.id) === index)    // distinct
        .sort(compareUsers);

    useEffect(() => {
        companyHoursApis.getCompanyHours(`${props.year}-${props.month}`)
            .then(companyHours => setCompanyHours(companyHours))
            .catch(err => console.error(err))
    }, [props.month, props.year]);

    return (
        <>
            <Row className="mt-2">
                <Table responsive className="worked-hours-table company-worked-hours-table">
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
                        <th>Totale</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => {
                        let totalWorkedHours = 0;
                        let totalExtraHours = 0;
                        let totalHolidayHours = 0;
                        let totalSickHours = 0;
                        let totalDonationHours = 0;
                        let totalFurloughHours = 0;
                        let totalTravelHours = 0;
                        let totalExpenses = 0;

                        let userHoursLink = `/workedHours?u=${user.id}`;
                        if (props.month !== currentMonth) userHoursLink += `&m=${props.month}`;
                        if (props.year !== currentYear) userHoursLink += `&y=${props.year}`;

                        return (
                            <tr key={user.id} className="unhoverable">
                                <td className="px-1">
                                    <div className="text-start clickable" role="button"
                                         onClick={() => navigate(userHoursLink)}>
                                        <strong>{user.surname} {user.name}</strong>
                                    </div>
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

                                    totalWorkedHours += companyHoursItem?.workedHours ?? 0;
                                    totalExtraHours += extraHours;
                                    totalHolidayHours += companyHoursItem?.holidayHours ?? 0;
                                    totalSickHours += companyHoursItem?.sickHours ?? 0;
                                    totalDonationHours += companyHoursItem?.donationHours ?? 0;
                                    totalFurloughHours += companyHoursItem?.furloughHours ?? 0;
                                    totalTravelHours += companyHoursItem?.travelHours ?? 0;
                                    totalExpenses += companyHoursItem?.expenses ?? 0;

                                    return (
                                        <td key={`user-${user.id}-${workday.format()}`}
                                            className={workdayClassName(workday, false)}>
                                            <div>&nbsp;</div>
                                            <div>{(companyHoursItem && companyHoursItem.workedHours !== 0) ? companyHoursItem.workedHours : <>&nbsp;</>}</div>
                                            <div>{extraHours === 0 ? <>&nbsp;</> : extraHours}</div>
                                            <div>{(companyHoursItem && companyHoursItem.holidayHours !== 0) ? companyHoursItem.holidayHours : <>&nbsp;</>}</div>
                                            <div>{(companyHoursItem && companyHoursItem.sickHours !== 0) ? companyHoursItem.sickHours : <>&nbsp;</>}</div>
                                            <div>{(companyHoursItem && companyHoursItem.donationHours !== 0) ? companyHoursItem.donationHours : <>&nbsp;</>}</div>
                                            <div>{(companyHoursItem && companyHoursItem.furloughHours !== 0) ? companyHoursItem.furloughHours : <>&nbsp;</>}</div>
                                            <div>{(companyHoursItem && companyHoursItem.travelHours !== 0) ? companyHoursItem.travelHours : <>&nbsp;</>}</div>
                                            <div>{(companyHoursItem && companyHoursItem.expenses !== 0) ? `€ ${companyHoursItem.expenses}` : <>&nbsp;</>}</div>
                                        </td>
                                    );
                                })}

                                <td>
                                    <div>&nbsp;</div>
                                    <div>{totalWorkedHours === 0 ? <>&nbsp;</> : totalWorkedHours}</div>
                                    <div>{totalExtraHours === 0 ? <>&nbsp;</> : totalExtraHours}</div>
                                    <div>{totalHolidayHours === 0 ? <>&nbsp;</> : totalHolidayHours}</div>
                                    <div>{totalSickHours === 0 ? <>&nbsp;</> : totalSickHours}</div>
                                    <div>{totalDonationHours === 0 ? <>&nbsp;</> : totalDonationHours}</div>
                                    <div>{totalFurloughHours === 0 ? <>&nbsp;</> : totalFurloughHours}</div>
                                    <div>{totalTravelHours === 0 ? <>&nbsp;</> : totalTravelHours}</div>
                                    <div>{totalExpenses === 0 ? <>&nbsp;</> : `€ ${totalExpenses}`}</div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </Table>
            </Row>

            <Row className="mt-3">
                <Col className="d-flex justify-content-center">
                    <GlossyButton
                        icon={FileEarmarkSpreadsheet}
                        onClick={() => exportCompanyWorkedHoursExcel(props.month, props.year, workdays, companyHours, users)}>
                        Esporta Excel
                    </GlossyButton>
                </Col>
            </Row>
        </>
    );
}

export default CompanyWorkedHoursTable;