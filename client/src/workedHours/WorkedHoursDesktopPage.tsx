import React, {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";
import dayjs from "dayjs";
import {upperCaseFirst} from "../functions";
import {
    Check2Circle,
    ExclamationCircle,
    ThreeDots
} from "react-bootstrap-icons";
import WorkedHoursTable from "./workedHoursTable/WorkedHoursTable";
import {Type} from "../models/user";
import WorkedHoursSelectUser from "./WorkedHoursSelectUser";
import {WorkedHoursPageProps} from "./WorkedHoursPage";
import {MonthSelector, SelectMonthButtons} from "./MonthSelectingComponents";

function WorkedHoursDesktopPage(props: WorkedHoursPageProps) {
    const currentMonth = parseInt(dayjs().format("M"));
    const currentYear = parseInt(dayjs().format("YYYY"));
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [selectingMonth, setSelectingMonth] = useState(false);
    const [selectedUser, setSelectedUser] = useState(props.user);
    const [savingStatus, setSavingStatus] = useState<"" | "saving" | "saved">("");

    useEffect(() => {
        // clear savingStatus after 3 seconds
        if (savingStatus === "saved") {
            setTimeout(() => setSavingStatus(""), 3000);
        }
    }, [savingStatus]);

    return (
        <>
            <Row>
                <h1 className="page-title">Ore</h1>
            </Row>

            <Row className="glossy-background">
                <Row className="mb-3">
                    <Col>
                        <WorkedHoursSelectUser user={props.user} selectedUser={selectedUser}
                                               setSelectedUser={setSelectedUser}/>
                    </Col>

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
                        {selectedUser.id !== props.user.id && <p className="warning d-flex align-items-center">
                            <ExclamationCircle className="mx-1"/>
                            Attenzione! Stai modificando le ore di
                            {selectedUser.type === Type.machine ? " una macchina" : " un altro utente"}, non le tue!
                        </p>}
                    </Col>

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

                <Row className="mt-2">
                    <WorkedHoursTable user={props.user} selectedUser={selectedUser} month={month} year={year}
                                      setSavingStatus={setSavingStatus}/>
                </Row>
            </Row>
        </>
    );
}

export default WorkedHoursDesktopPage;