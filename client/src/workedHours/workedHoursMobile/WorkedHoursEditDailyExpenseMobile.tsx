import React, {useEffect, useState} from "react";
import {DailyExpense} from "../../models/dailyExpense";
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";
import dailyExpensesApis from "../../api/dailyExpensesApis";
import {User} from "../../models/user";
import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {upperCaseFirst} from "../../functions";
import GlossyButton from "../../buttons/GlossyButton";
import {Calendar, Clock, CurrencyEuro, Floppy} from "react-bootstrap-icons";

interface WorkedHoursEditDailyExpenseMobileProps {
    readonly user: User
    readonly month: number
    readonly year: number
    readonly dailyExpenses: DailyExpense[]
}

function WorkedHoursEditDailyExpenseMobile(props: WorkedHoursEditDailyExpenseMobileProps) {
    const currentDay = parseInt(dayjs().format("D"));
    const [date, setDate] = useState(`${props.year}-${props.month}-${currentDay}`);
    const [holidayHours, setHolidayHours] = useState(0);
    const [sickHours, setSickHours] = useState(0);
    const [donationHours, setDonationHours] = useState(0);
    const [furloughHours, setFurloughHours] = useState(0);
    const [travelHours, setTravelHours] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [destination, setDestination] = useState("");
    const [kms, setKms] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const existingDailyExpense = props.dailyExpenses.find(dailyExpense =>
            dayjs(dailyExpense.date).isSame(dayjs(date), "day")
        );

        if (existingDailyExpense) {
            setHolidayHours(existingDailyExpense.holidayHours);
            setSickHours(existingDailyExpense.sickHours);
            setDonationHours(existingDailyExpense.donationHours);
            setFurloughHours(existingDailyExpense.furloughHours);
            setTravelHours(existingDailyExpense.travelHours);
            setExpenses(existingDailyExpense.expenses);
            setDestination(existingDailyExpense.destination);
            setKms(existingDailyExpense.kms);
        } else {
            setHolidayHours(0);
            setSickHours(0);
            setDonationHours(0);
            setFurloughHours(0);
            setTravelHours(0);
            setExpenses(0);
            setDestination("");
            setKms(0);
        }
    }, [date]);

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        const newDailyExpense = new DailyExpense(
            props.user.id,
            date,
            expenses,
            destination,
            kms,
            undefined,
            travelHours,
            holidayHours,
            sickHours,
            donationHours,
            furloughHours
        );

        dailyExpensesApis.createOrUpdateDailyExpense(newDailyExpense)
            .then(() => navigate("/workedHours"))
            .catch(err => console.error(err))
    }

    return (
        <Form>
            <Row className="glossy-background">
                <Row className="mb-4">
                    <h3 className="text-center mb-0">
                        {upperCaseFirst(dayjs(`${props.year}-${props.month}-01`).format("MMMM YYYY"))}
                    </h3>
                </Row>

                <Row>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Calendar/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Data">
                            <Form.Control type="date" value={date}
                                          onChange={event => setDate(event.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>

                    <InputGroup className="mt-2">
                        <InputGroup.Text><Clock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Ore ferie/permessi">
                            <Form.Control type="number" min={0} step={0.5} placeholder="Ore ferie/permessi"
                                          value={holidayHours}
                                          onChange={ev => setHolidayHours(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Clock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Ore malattia">
                            <Form.Control type="number" min={0} step={0.5} placeholder="Ore malattia" value={sickHours}
                                          onChange={ev => setSickHours(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Clock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Ore donazione">
                            <Form.Control type="number" min={0} step={0.5} placeholder="Ore donazione"
                                          value={donationHours}
                                          onChange={ev => setDonationHours(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Clock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Ore cassa integrazione">
                            <Form.Control type="number" min={0} step={0.5} placeholder="Ore cassa integrazione"
                                          value={furloughHours}
                                          onChange={ev => setFurloughHours(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Clock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Ore viaggio">
                            <Form.Control type="number" min={0} step={0.5} placeholder="Ore viaggio" value={travelHours}
                                          onChange={ev => setTravelHours(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>

                    <InputGroup className="mt-4">
                        <InputGroup.Text><CurrencyEuro/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Spese documentate">
                            <Form.Control type="number" min={0} step={0.5} placeholder="Spese documentate"
                                          value={expenses}
                                          onChange={ev => setExpenses(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Clock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Destinazione">
                            <Form.Control type="text" placeholder="Destinazione" value={destination}
                                          onChange={ev => setDestination(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Clock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Chilometri">
                            <Form.Control type="number" min={0} step={0.5} placeholder="Chilometri" value={kms}
                                          onChange={ev => setKms(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                </Row>
            </Row>

            <Row>
                <Col className="d-flex justify-content-center mb-4">
                    <GlossyButton type="submit" icon={Floppy} onClick={handleSubmit}>Salva</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default WorkedHoursEditDailyExpenseMobile;