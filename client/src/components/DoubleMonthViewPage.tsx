import React, {useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Col, Row} from "react-bootstrap";
import {CalendarMinus, CalendarPlus} from "react-bootstrap-icons";
import HolidaysTable from "../holiday-plan/HolidaysTable";
import {MonthSelector, SelectMonthButtons} from "../workedHours/MonthSelectingComponents";
import SavingStatusMessage, {SavingStatus} from "./SavingStatusMessage";
import GlossyButton from "../buttons/GlossyButton";
import {User} from "../models/user";
import {upperCaseFirst} from "../functions";
import dayjs from "dayjs";
import "./DoubleMonthViewPage.css";
import PlanningTable from "../planning/PlanningTable";

interface DoubleMonthViewPageProps {
    readonly user: User
    readonly page: "planning" | "holidayPlan"
}

function DoubleMonthViewPage(props: DoubleMonthViewPageProps) {
    const [searchParams] = useSearchParams();
    const searchMonth = searchParams.get("m");
    const searchYear = searchParams.get("y");
    const currentMonth = parseInt(dayjs().format("M"));
    const currentYear = parseInt(dayjs().format("YYYY"));
    const [month, setMonth] = useState(searchMonth ? parseInt(searchMonth) : currentMonth);
    const [year, setYear] = useState(searchYear ? parseInt(searchYear) : currentYear);
    const followingMonth = month === 12 ? 1 : month + 1;
    const yearOfFollowingMonth = month === 12 ? year + 1 : year;
    const [selectingMonth, setSelectingMonth] = useState(false);
    const [showTwoMonths, setShowTwoMonths] = useState(false);
    const [savingStatus, setSavingStatus] = useState<SavingStatus>("");

    let title: string;
    if (showTwoMonths && year === yearOfFollowingMonth) {
        title = upperCaseFirst(dayjs(`${year}-${month}-01`).format("MMMM - ")) +
            dayjs(`${yearOfFollowingMonth}-${followingMonth}-01`).format("MMMM YYYY");
    } else if (showTwoMonths) {
        title = upperCaseFirst(dayjs(`${year}-${month}-01`).format("MMMM YYYY - ")) +
            dayjs(`${yearOfFollowingMonth}-${followingMonth}-01`).format("MMMM YYYY");
    } else {
        title = upperCaseFirst(dayjs(`${year}-${month}-01`).format("MMMM YYYY"));
    }

    return (
        <>
            <Row>
                <Col>
                    <h1 className="page-title">{props.page === "planning" ? "Pianificazione" : "Piano ferie"}</h1>
                </Col>
                <Col className="d-flex justify-content-end me-3">
                    <GlossyButton icon={showTwoMonths ? CalendarPlus : CalendarMinus}
                                  onClick={() => setShowTwoMonths(prevState => !prevState)}>
                        {showTwoMonths ? "Visualizzazione mensile" : "Visualizzazione bimestrale"}</GlossyButton>
                </Col>
            </Row>

            <Row className="glossy-background">
                <Row className="mb-3">
                    <Col/>
                    <Col className="d-flex flex-column justify-content-center">
                        {selectingMonth ?
                            <MonthSelector month={month} setMonth={setMonth} year={year} setYear={setYear}/> :
                            <h3 className="text-center mb-0">{title}</h3>
                        }
                    </Col>
                    <Col/>
                </Row>

                <Row>
                    <Col>
                        <SavingStatusMessage savingStatus={savingStatus} setSavingStatus={setSavingStatus}/>
                    </Col>
                </Row>

                <SelectMonthButtons selectingMonth={selectingMonth} setSelectingMonth={setSelectingMonth} month={month}
                                    setMonth={setMonth} setYear={setYear}/>

                <Row>
                    <Col sm={showTwoMonths ? 6 : 12}
                         className={`holidays-page-first-column ${showTwoMonths ? "shrunk-table-column" : ""}`}>
                        {props.page === "planning" ? <PlanningTable month={month} year={year} user={props.user}
                                                                    setSavingStatus={setSavingStatus}/> :
                            <HolidaysTable month={month} year={year} user={props.user}
                                           setSavingStatus={setSavingStatus}/>}
                    </Col>
                    {showTwoMonths && <Col sm={showTwoMonths ? 6 : 0}
                                           className={`shrunk-table-column ${showTwoMonths ? "holidays-page-second-column" : ""}`}>
                        {props.page === "planning" ?
                            <PlanningTable month={followingMonth} year={yearOfFollowingMonth} user={props.user}
                                           setSavingStatus={setSavingStatus}/> :
                            <HolidaysTable month={followingMonth} year={yearOfFollowingMonth} user={props.user}
                                           setSavingStatus={setSavingStatus}/>}
                    </Col>}
                </Row>
            </Row>
        </>
    );
}

export default DoubleMonthViewPage;