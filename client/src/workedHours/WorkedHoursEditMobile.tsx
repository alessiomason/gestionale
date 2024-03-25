import {WorkedHoursPageProps} from "./WorkedHoursPage";
import {Button, ButtonGroup, Col, FloatingLabel, Form, InputGroup, Row, ToggleButton} from "react-bootstrap";
import {Calendar, Check2Circle, Clock, CurrencyEuro, JournalPlus, ThreeDots} from "react-bootstrap-icons";
import {upperCaseFirst} from "../functions";
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import WorkedHoursEditWorkItemMobile from "./WorkedHoursEditWorkItemMobile";
import GlossyButton from "../buttons/GlossyButton";
import WorkedHoursEditDailyExpenseMobile from "./WorkedHoursEditDailyExpenseMobile";

function WorkedHoursEditMobile(props: WorkedHoursPageProps) {
    const [savingStatus, setSavingStatus] = useState<"" | "saving" | "saved">("");
    const currentYear = 2023//parseInt(dayjs().format("YYYY"));
    const currentMonth = parseInt(dayjs().format("M"));
    const daysInMonth = dayjs(`${currentYear}-${currentMonth}-01`).daysInMonth();
    let workdays: dayjs.Dayjs[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        workdays.push(dayjs(`${currentYear}-${currentMonth}-${i}`));
    }

    const [page, setPage] = useState<"workItem" | "dailyExpense">("workItem");

    useEffect(() => {
        // clear savingStatus after 3 seconds
        if (savingStatus === "saved") {
            setTimeout(() => setSavingStatus(""), 3000);
        }
    }, [savingStatus]);

    return (
        <>
            <Row>
                <Col>
                    <h1 className="page-title">Aggiungi o modifica le ore lavorate</h1>
                </Col>
                <Col className="d-flex justify-content-end">
                    {savingStatus !== "" && <p className="success d-flex justify-content-end align-items-center">
                        {savingStatus === "saving" ?
                            <><ThreeDots className="mx-1"/>Salvataggio in corso...</> :
                            <><Check2Circle className="mx-1"/>Salvato</>}
                    </p>}
                </Col>
            </Row>

            <Row>
                <Col className="d-flex justify-content-center mb-3">
                    <ButtonGroup>
                        <GlossyButton icon={JournalPlus} onClick={() => setPage("workItem")}>Ore lavorate</GlossyButton>
                        <GlossyButton icon={JournalPlus} onClick={() => setPage("dailyExpense")}>Ore giornaliere</GlossyButton>
                    </ButtonGroup>
                </Col>
            </Row>

            {page === "workItem" ?
                <WorkedHoursEditWorkItemMobile month={currentMonth} year={currentYear} setSavingStatus={setSavingStatus}/> :
                <WorkedHoursEditDailyExpenseMobile month={currentMonth} year={currentYear} setSavingStatus={setSavingStatus}/>
            }
        </>
    );
}

export default WorkedHoursEditMobile;