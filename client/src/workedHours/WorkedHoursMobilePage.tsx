import {WorkedHoursPageProps} from "./WorkedHoursPage";
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import {Row, Table} from "react-bootstrap";
import {upperCaseFirst} from "../functions";
import {JournalPlus} from "react-bootstrap-icons";
import {WorkItem} from "../models/workItem";
import {DailyExpense} from "../models/dailyExpense";
import {Type} from "../models/user";
import workItemApis from "../api/workItemApis";
import dailyExpenseApis from "../api/dailyExpensesApis";
import workdayClassName from "./workedHoursFunctions";
import "./WorkedHoursMobilePage.css";
import GlossyButton from "../buttons/GlossyButton";
import {useNavigate} from "react-router-dom";

function WorkedHoursMobilePage(props: WorkedHoursPageProps) {
    const currentYear = 2023//parseInt(dayjs().format("YYYY"));
    const currentMonth = parseInt(dayjs().format("M"));
    const daysInMonth = dayjs(`${currentYear}-${currentMonth}-01`).daysInMonth();
    let workdays: dayjs.Dayjs[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        workdays.push(dayjs(`${currentYear}-${currentMonth}-${i}`));
    }

    const isMachine = props.user.type === Type.machine;
    const [workItems, setWorkItems] = useState<WorkItem[]>([]);
    const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        workItemApis.getWorkItems(`${currentYear}-${currentMonth}`, props.user.id)
            .then(workItems => {
                setWorkItems(workItems);
            })
            .catch(err => console.error(err))

        if (!isMachine) {
            dailyExpenseApis.getDailyExpenses(`${currentYear}-${currentMonth}`, props.user.id)
                .then(dailyExpenses => setDailyExpenses(dailyExpenses!))
                .catch(err => console.error(err))
        }
    }, []);
    return (
        <>
            <Row>
                <h1 className="page-title">Ore</h1>
            </Row>

            <Row className="glossy-background">
                <Row className="mb-4">
                    <h3 className="text-center mb-0">
                        {upperCaseFirst(dayjs(`${currentYear}-${currentMonth}-01`).format("MMMM YYYY"))}
                    </h3>
                </Row>

                <Row className="mb-3">
                    <GlossyButton icon={JournalPlus} onClick={() => navigate("/editWorkedHours")}>
                        Aggiungi o modifica le ore lavorate
                    </GlossyButton>
                </Row>

                {workdays
                    .sort((a, b) => -1 * a.format().localeCompare(b.format()))
                    .map(workday => {
                        const dayWorkItems = workItems?.filter(workItem =>
                            (dayjs(workItem.date)).isSame(workday, "day")
                        ) ?? [];
                        const dailyExpense = dailyExpenses.find(dailyExpense =>
                            (dayjs(dailyExpense.date)).isSame(workday, "day")
                        );

                        return (
                            <div key={workday.format()}>
                                {(dayWorkItems.length > 0 || dailyExpense) &&
                                    <h3 className={"mt-3 " + workdayClassName(workday, false)}>
                                        {upperCaseFirst(workday.format("dddd D MMMM"))}
                                    </h3>}

                                {dayWorkItems.length > 0 && <Table responsive>
                                    <thead>
                                    <tr>
                                        <th>Commessa</th>
                                        <th className="second-column">Ore giornaliere</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {dayWorkItems.map(workItem => {
                                        return (
                                            <tr key={`${workday.format()} ${workItem.job.id}`}>
                                                <td>{workItem.job.id} - <i>{workItem.job.client}</i> - {workItem.job.subject}
                                                </td>
                                                <td className="second-column">{workItem.hours}</td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </Table>}

                                {dailyExpense && <Table responsive>
                                    <thead>
                                    <tr>
                                        <th>Categoria</th>
                                        <th className="second-column">Ore</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {dailyExpense.holidayHours !== 0 && <tr>
                                        <td>Ferie/permessi</td>
                                        <td className="second-column">{dailyExpense.holidayHours}</td>
                                    </tr>}
                                    {dailyExpense.sickHours !== 0 && <tr>
                                        <td>Malattia</td>
                                        <td className="second-column">{dailyExpense.sickHours}</td>
                                    </tr>}
                                    {dailyExpense.donationHours !== 0 && <tr>
                                        <td>Donazione</td>
                                        <td className="second-column">{dailyExpense.donationHours}</td>
                                    </tr>}
                                    {dailyExpense.furloughHours !== 0 && <tr>
                                        <td>Cassa integrazione</td>
                                        <td className="second-column">{dailyExpense.furloughHours}</td>
                                    </tr>}
                                    {dailyExpense.travelHours !== 0 && <tr>
                                        <td>Viaggio</td>
                                        <td className="second-column">{dailyExpense.travelHours}</td>
                                    </tr>}
                                    {dailyExpense.expenses !== 0 && <tr>
                                        <td>Spese documentate</td>
                                        <td className="second-column">{dailyExpense.expenses}</td>
                                    </tr>}
                                    {dailyExpense.kms !== 0 && <tr>
                                        <td>Chilometri</td>
                                        <td className="second-column">{dailyExpense.kms}</td>
                                    </tr>}
                                    {dailyExpense.tripCost !== 0 && <tr>
                                        <td>Costo del viaggio</td>
                                        <td className="second-column">{dailyExpense.tripCost}</td>
                                    </tr>}
                                    {dailyExpense.destination !== "" && <tr>
                                        <td>Destinazione</td>
                                        <td className="second-column">{dailyExpense.destination}</td>
                                    </tr>}
                                    </tbody>
                                </Table>}
                            </div>
                        );
                    })}
            </Row>
        </>
    );
}

export default WorkedHoursMobilePage;