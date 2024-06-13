import React, {useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Col, Row} from "react-bootstrap";
import {ExclamationCircle} from "react-bootstrap-icons";
import {WorkedHoursPageProps} from "./WorkedHoursPage";
import WorkedHoursTable from "./workedHoursTable/WorkedHoursTable";
import WorkedHoursSelectUser from "./WorkedHoursSelectUser";
import {MonthSelector, SelectMonthButtons} from "./MonthSelectingComponents";
import SavingStatusMessage, {SavingStatus} from "../components/SavingStatusMessage";
import {Type} from "../models/user";
import {upperCaseFirst} from "../functions";
import dayjs from "dayjs";

function WorkedHoursDesktopPage(props: WorkedHoursPageProps) {
    const [searchParams] = useSearchParams();
    const searchMonth = searchParams.get("m");
    const searchYear = searchParams.get("y");
    const currentMonth = parseInt(dayjs().format("M"));
    const currentYear = parseInt(dayjs().format("YYYY"));

    const [month, setMonth] = useState(searchMonth ? parseInt(searchMonth) : currentMonth);
    const [year, setYear] = useState(searchYear ? parseInt(searchYear) : currentYear);
    const [selectingMonth, setSelectingMonth] = useState(false);
    const [selectedUser, setSelectedUser] = useState(props.user);
    const [savingStatus, setSavingStatus] = useState<SavingStatus>("");

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
                        <SavingStatusMessage savingStatus={savingStatus} setSavingStatus={setSavingStatus}/>
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