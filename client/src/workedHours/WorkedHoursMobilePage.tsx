import {WorkedHoursPageProps} from "./WorkedHoursPage";
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import {Col, Row, Table} from "react-bootstrap";
import {upperCaseFirst} from "../functions";
import {Check2Circle, JournalPlus, ThreeDots} from "react-bootstrap-icons";
import {WorkItem} from "../models/workItem";
import {DailyExpense} from "../models/dailyExpense";
import {Type} from "../models/user";
import workItemApis from "../api/workItemApis";
import dailyExpenseApis from "../api/dailyExpensesApis";
import {Job} from "../models/job";
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
                        const inWorkItems = workItems?.find(workItem =>
                            (dayjs(workItem.date)).isSame(workday, "day")
                        );
                        const inDailyExpenses = dailyExpenses.find(dailyExpense =>
                            (dayjs(dailyExpense.date)).isSame(workday, "day")
                        );

                        return (
                            <>
                                {(inWorkItems || inDailyExpenses) &&
                                    <h3 className={"mt-3 " + workdayClassName(workday, false)}>
                                        {upperCaseFirst(workday.format("dddd D MMMM"))}
                                    </h3>}

                                {inWorkItems && <Table responsive>
                                    <thead>
                                    <tr>
                                        <th>Commessa</th>
                                        <th className="second-column">Ore giornaliere</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {workItems?.filter(workItem =>
                                        dayjs(workItem.date).isSame(workday, "day")
                                    ).map(workItem => {
                                        return (
                                            <tr>
                                                <td>{workItem.job.id} - <i>{workItem.job.client}</i> - {workItem.job.subject}
                                                </td>
                                                <td className="second-column">{workItem.hours}</td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </Table>}

                                {inDailyExpenses && <Table responsive>
                                    <thead>
                                    <tr>
                                        <th>Categoria</th>
                                        <th className="second-column">Ore</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {dailyExpenses.filter(dailyExpense =>
                                        dayjs(dailyExpense.date).isSame(workday, "day")
                                    ).map(dailyExpense => {
                                        return (
                                            <>
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
                                            </>
                                        );
                                    })}
                                    </tbody>
                                </Table>}
                            </>
                        );
                    })}
            </Row>
        </>
    );
}

export default WorkedHoursMobilePage;