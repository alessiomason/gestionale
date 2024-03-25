import {WorkedHoursPageProps} from "./WorkedHoursPage";
import {ButtonGroup, Col, Row} from "react-bootstrap";
import {JournalPlus} from "react-bootstrap-icons";
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import WorkedHoursEditWorkItemMobile from "./WorkedHoursEditWorkItemMobile";
import GlossyButton from "../buttons/GlossyButton";
import WorkedHoursEditDailyExpenseMobile from "./WorkedHoursEditDailyExpenseMobile";
import {WorkItem} from "../models/workItem";
import {DailyExpense} from "../models/dailyExpense";
import workItemApis from "../api/workItemApis";
import dailyExpenseApis from "../api/dailyExpensesApis";
import {Type} from "../models/user";

function WorkedHoursEditMobile(props: WorkedHoursPageProps) {
    const currentYear = 2023//parseInt(dayjs().format("YYYY"));
    const currentMonth = parseInt(dayjs().format("M"));

    const isMachine = props.user.type === Type.machine;
    const [page, setPage] = useState<"workItem" | "dailyExpense">("workItem");
    const [workItems, setWorkItems] = useState<WorkItem[]>([]);
    const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);

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
                <h1 className="page-title">Aggiungi o modifica le ore lavorate</h1>
            </Row>

            <Row>
                <Col className="d-flex justify-content-center mb-3">
                    <ButtonGroup>
                        <GlossyButton icon={JournalPlus} onClick={() => setPage("workItem")}>Ore lavorate</GlossyButton>
                        {!isMachine && <GlossyButton icon={JournalPlus} onClick={() => setPage("dailyExpense")}>Ore
                            giornaliere</GlossyButton>}
                    </ButtonGroup>
                </Col>
            </Row>

            {page === "workItem" ?
                <WorkedHoursEditWorkItemMobile user={props.user} month={currentMonth} year={currentYear} workItems={workItems}/> :
                <WorkedHoursEditDailyExpenseMobile user={props.user} month={currentMonth} year={currentYear}
                                                   dailyExpenses={dailyExpenses}/>
            }
        </>
    );
}

export default WorkedHoursEditMobile;