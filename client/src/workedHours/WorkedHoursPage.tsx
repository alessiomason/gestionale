import React, {useState} from "react";
import {Col, Form, Row} from "react-bootstrap";
import dayjs from "dayjs";
import {upperCaseFirst} from "../functions";
import {ArrowLeftSquare, ArrowRightSquare, CalendarRange, CalendarX} from "react-bootstrap-icons";
import "./WorkedHoursPage.css";
import TextButton from "../buttons/TextButton";
import WorkedHoursTable from "./WorkedHoursTable";

function WorkedHoursPage() {
    const currentMonth = parseInt(dayjs().format("M"));
    const currentYear = parseInt(dayjs().format("YYYY"));
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [selectingMonth, setSelectingMonth] = useState(false);

    function decreaseMonth() {
        if (month === 1) {
            setMonth(12);
            setYear(selectedYear => selectedYear - 1);
        } else {
            setMonth(selectedMonth => selectedMonth - 1);
        }
    }

    function increaseMonth() {
        if (month === 12) {
            setMonth(1);
            setYear(selectedYear => selectedYear + 1);
        } else {
            setMonth(selectedMonth => selectedMonth + 1);
        }
    }

    return (
        <>
            <Row>
                <h1 className="page-title">Ore</h1>
            </Row>

            <Row className="glossy-background">
                <Row className="mb-3">
                    {selectingMonth ?
                        <MonthSelector month={month} setMonth={setMonth} year={year} setYear={setYear}/> :
                        <h3 className="text-center mb-0">
                            {upperCaseFirst(dayjs(`${year}-${month}-01`).format("MMMM YYYY"))}
                        </h3>
                    }
                </Row>

                <Row>
                    <Col className="d-flex justify-content-between align-items-center">
                        <ArrowLeftSquare className="hoverable" onClick={decreaseMonth}/>

                        <TextButton icon={selectingMonth ? CalendarX : CalendarRange} onClick={() => setSelectingMonth(prevState => !prevState)}>
                            Seleziona un mese
                        </TextButton>

                        <ArrowRightSquare className="hoverable" onClick={increaseMonth}/>
                    </Col>
                </Row>

                <Row className="mt-2">
                    <WorkedHoursTable month={month} year={year}/>
                </Row>
            </Row>
        </>
    );
}

interface MonthSelectorProps {
    readonly month: number
    readonly setMonth: React.Dispatch<React.SetStateAction<number>>
    readonly year: number
    readonly setYear: React.Dispatch<React.SetStateAction<number>>
}

function MonthSelector(props: MonthSelectorProps) {
    const currentYear = parseInt(dayjs().format("YYYY"));
    let years: number[] = [];
    for (let i = currentYear; i >= 2019; i--) {     // show data up to 2019
        years.push(i);
    }

    return (
        <>
            <Col/>
            <Col sm={4} className="d-flex justify-content-between">
                <Form.Select className="mx-2" value={props.month}
                             onChange={ev => props.setMonth(parseInt(ev.target.value))}>
                    {[...Array(12)].map((_, i) => {
                        return (
                            <option key={`month-${i + 1}`} value={i + 1}>
                                {dayjs(`${props.year}-${i + 1}-01`).format("MMMM")}
                            </option>
                        );
                    })}
                </Form.Select>

                <Form.Select className="mx-2" value={props.year}
                             onChange={ev => props.setYear(parseInt(ev.target.value))}>
                    {years.map(year => {
                        return (
                            <option key={`year-${year}`} value={year}>{year}</option>
                        );
                    })}
                </Form.Select>
            </Col>
            <Col/>
        </>
    );
}

export default WorkedHoursPage;