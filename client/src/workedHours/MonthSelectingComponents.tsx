import React from "react";
import dayjs from "dayjs";
import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {ArrowLeftSquare, ArrowRightSquare, CalendarEvent, CalendarRange, CalendarX} from "react-bootstrap-icons";
import TextButton from "../buttons/TextButton";
import {SetURLSearchParams, useSearchParams} from "react-router-dom";

function setSearchMonth(month: number, searchParams: URLSearchParams, setSearchParams: SetURLSearchParams) {
    const currentMonth = parseInt(dayjs().format("M"));

    let newSearchParams: any = {};
    for (const [key, value] of searchParams.entries()) {
        newSearchParams[key] = value;
    }

    if (month === currentMonth) {
        delete newSearchParams["m"];
    } else {
        newSearchParams["m"] = month.toString();
    }

    setSearchParams(newSearchParams);
}

function setSearchYear(year: number, searchParams: URLSearchParams, setSearchParams: SetURLSearchParams) {
    const currentYear = parseInt(dayjs().format("YYYY"));

    let newSearchParams: any = {};
    for (const [key, value] of searchParams.entries()) {
        newSearchParams[key] = value;
    }

    if (year === currentYear) {
        delete newSearchParams["y"];
    } else {
        newSearchParams["y"] = year.toString();
    }

    setSearchParams(newSearchParams);
}

function setSearchMonthYear(month: number, year: number, searchParams: URLSearchParams, setSearchParams: SetURLSearchParams) {
    const currentMonth = parseInt(dayjs().format("M"));
    const currentYear = parseInt(dayjs().format("YYYY"));

    let newSearchParams: any = {};
    for (const [key, value] of searchParams.entries()) {
        newSearchParams[key] = value;
    }

    if (month === currentMonth) {
        delete newSearchParams["m"];
    } else {
        newSearchParams["m"] = month.toString();
    }

    if (year === currentYear) {
        delete newSearchParams["y"];
    } else {
        newSearchParams["y"] = year.toString();
    }

    setSearchParams(newSearchParams);
}

interface IncreaseDecreaseMonthProps {
    readonly month: number
    readonly setMonth: React.Dispatch<React.SetStateAction<number>>
    readonly setYear: React.Dispatch<React.SetStateAction<number>>
    readonly searchParams: URLSearchParams
    readonly setSearchParams: SetURLSearchParams
}

export function decreaseMonth(props: IncreaseDecreaseMonthProps) {
    if (props.month === 1) {
        props.setMonth(12);
        props.setYear(selectedYear => {
            setSearchMonthYear(12, selectedYear - 1, props.searchParams, props.setSearchParams);
            return selectedYear - 1;
        });
    } else {
        props.setMonth(selectedMonth => {
            setSearchMonth(selectedMonth - 1, props.searchParams, props.setSearchParams);
            return selectedMonth - 1;
        });
    }
}

export function increaseMonth(props: IncreaseDecreaseMonthProps) {
    if (props.month === 12) {
        props.setMonth(1);
        props.setYear(selectedYear => {
            setSearchMonthYear(1, selectedYear + 1, props.searchParams, props.setSearchParams);
            return selectedYear + 1;
        });
    } else {
        props.setMonth(selectedMonth => {
            setSearchMonth(selectedMonth + 1, props.searchParams, props.setSearchParams);
            return selectedMonth + 1;
        });
    }
}

interface MonthSelectorProps {
    readonly month: number
    readonly setMonth: React.Dispatch<React.SetStateAction<number>>
    readonly year: number
    readonly setYear: React.Dispatch<React.SetStateAction<number>>
}

export function MonthSelector(props: MonthSelectorProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentYear = parseInt(dayjs().format("YYYY"));
    let years: number[] = [];
    for (let i = currentYear; i >= 2019; i--) {     // show data up to 2019
        years.push(i);
    }

    function selectMonth(month: number) {
        props.setMonth(month);
        setSearchMonth(month, searchParams, setSearchParams);
    }

    function selectYear(year: number) {
        props.setYear(year);
        setSearchYear(year, searchParams, setSearchParams);
    }

    return (
        <Row>
            <Col>
                <InputGroup>
                    <FloatingLabel controlId="floatingInput" label="Mese">
                        <Form.Select value={props.month}
                                     onChange={ev => selectMonth(parseInt(ev.target.value))}>
                            {[...Array(12)].map((_, i) => {
                                return (
                                    <option key={`month-${i + 1}`} value={i + 1}>
                                        {dayjs(`${props.year}-${i + 1}-01`).format("MMMM")}
                                    </option>
                                );
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </InputGroup>
            </Col>

            <Col>
                <InputGroup>
                    <FloatingLabel controlId="floatingInput" label="Anno">
                        <Form.Select value={props.year}
                                     onChange={ev => selectYear(parseInt(ev.target.value))}>
                            {years.map(year => {
                                return (
                                    <option key={`year-${year}`} value={year}>{year}</option>
                                );
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </InputGroup>
            </Col>
        </Row>
    );
}

interface SelectMonthButtonsProps {
    readonly selectingMonth: boolean
    readonly setSelectingMonth: React.Dispatch<React.SetStateAction<boolean>>
    readonly month: number
    readonly setMonth: React.Dispatch<React.SetStateAction<number>>
    readonly setYear: React.Dispatch<React.SetStateAction<number>>
}

export function SelectMonthButtons(props: SelectMonthButtonsProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentMonth = parseInt(dayjs().format("M"));
    const currentYear = parseInt(dayjs().format("YYYY"));

    return (
        <Row>
            <Col className="d-flex justify-content-between align-items-center">
                <ArrowLeftSquare size={25} className="hoverable"
                                 onClick={() => decreaseMonth({...props, searchParams, setSearchParams})}/>

                <div className="d-flex">
                    <TextButton icon={props.selectingMonth ? CalendarX : CalendarRange}
                                onClick={() => props.setSelectingMonth(prevState => !prevState)}>
                        {props.selectingMonth ? "Chiudi" : "Seleziona un mese"}
                    </TextButton>
                    <TextButton icon={CalendarEvent} onClick={() => {
                        props.setMonth(currentMonth);
                        props.setYear(currentYear);
                        setSearchMonthYear(currentMonth, currentYear, searchParams, setSearchParams);
                    }}>
                        Oggi
                    </TextButton>
                </div>

                <ArrowRightSquare size={25} className="hoverable"
                                  onClick={() => increaseMonth({...props, searchParams, setSearchParams})}/>
            </Col>
        </Row>
    );
}