import React, {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Col, Row} from "react-bootstrap";
import {Check2Circle, ThreeDots} from "react-bootstrap-icons";
import HolidaysTable from "./HolidaysTable";
import {MonthSelector, SelectMonthButtons} from "../workedHours/MonthSelectingComponents";
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
    const [savingStatus, setSavingStatus] = useState<"" | "saving" | "saved">("saved");

    useEffect(() => {
        // clear savingStatus after 3 seconds
        if (savingStatus === "saved") {
            setTimeout(() => setSavingStatus(""), 3000);
        }
    }, [savingStatus]);

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
                        {/* this forces the whole Row to always the same height, so that it does not change every time savingStatus is empty */}
                        {savingStatus === "" && <p>&nbsp;</p>}

                        {savingStatus !== "" && <p className="success d-flex justify-content-end align-items-center">
                            {savingStatus === "saving" ?
                                <><ThreeDots className="mx-1"/>Salvataggio in corso...</> :
                                <><Check2Circle className="mx-1"/>Salvato</>}
                        </p>}
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