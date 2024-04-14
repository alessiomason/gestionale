import {Col, Row} from "react-bootstrap";
import {MonthSelector, SelectMonthButtons} from "../MonthSelectingComponents";
import {upperCaseFirst} from "../../functions";
import dayjs from "dayjs";
import React, {useState} from "react";
import CompanyWorkedHoursTable from "./CompanyWorkedHoursTable";

function CompanyWorkedHoursPage() {
    const currentMonth = parseInt(dayjs().format("M"));
    const currentYear = parseInt(dayjs().format("YYYY"));
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [selectingMonth, setSelectingMonth] = useState(false);

    return (
        <>
            <Row>
                <h1 className="page-title">Ore azienda</h1>
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

                <SelectMonthButtons selectingMonth={selectingMonth} setSelectingMonth={setSelectingMonth} month={month}
                                    setMonth={setMonth} setYear={setYear}/>

                <CompanyWorkedHoursTable month={month} year={year}/>
            </Row>
        </>
    );
}

export default CompanyWorkedHoursPage;