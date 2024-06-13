import React, {useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Col, Row} from "react-bootstrap";
import HolidaysTable from "./HolidaysTable";
import {MonthSelector, SelectMonthButtons} from "../workedHours/MonthSelectingComponents";
import SavingStatusMessage, {SavingStatus} from "../components/SavingStatusMessage";
import {User} from "../models/user";
import {upperCaseFirst} from "../functions";
import dayjs from "dayjs";

interface HolidaysPageProps {
    readonly user: User
}

function HolidaysPage(props: HolidaysPageProps) {
    const [searchParams] = useSearchParams();
    const searchMonth = searchParams.get("m");
    const searchYear = searchParams.get("y");
    const currentMonth = parseInt(dayjs().format("M"));
    const currentYear = parseInt(dayjs().format("YYYY"));
    const [month, setMonth] = useState(searchMonth ? parseInt(searchMonth) : currentMonth);
    const [year, setYear] = useState(searchYear ? parseInt(searchYear) : currentYear);
    const [selectingMonth, setSelectingMonth] = useState(false);
    const [savingStatus, setSavingStatus] = useState<SavingStatus>("");

    return (
        <>
            <Row>
                <h1 className="page-title">Piano ferie</h1>
            </Row>

            <Row className="glossy-background">
                <Row className="mb-3">
                    <Col/>
                    <Col className="d-flex flex-column justify-content-center">
                        {selectingMonth ?
                            <MonthSelector month={month} setMonth={setMonth} year={year} setYear={setYear}/> :
                            <h3 className="text-center mb-0">
                                {upperCaseFirst(dayjs(`${year}-${month}-01`).format("MMMM YYYY"))}
                            </h3>
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

                <HolidaysTable month={month} year={year} user={props.user} setSavingStatus={setSavingStatus}/>
            </Row>
        </>
    );
}

export default HolidaysPage;