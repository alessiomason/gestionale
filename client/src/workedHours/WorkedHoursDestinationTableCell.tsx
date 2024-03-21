import React, {useState} from "react";
import dayjs from "dayjs";
import {WorkItem} from "../models/workItem";
import {Job} from "../models/job";
import {Form} from "react-bootstrap";
import "./WorkedHoursTableCell.css";
import workItemApis from "../api/workItemApis";
import {DailyExpense} from "../models/dailyExpense";
import dailyExpensesApis from "../api/dailyExpensesApis";
import {User} from "../models/user";

interface WorkedHoursDestinationTableCellProps {
    readonly workday: dayjs.Dayjs
    readonly dailyExpense: DailyExpense | undefined
    readonly user: User
    readonly setSavingStatus: React.Dispatch<React.SetStateAction<"" | "saving" | "saved">>
    readonly createOrUpdateLocalDailyExpense: (newDailyExpense: DailyExpense) => void
}

function WorkedHoursDestinationTableCell(props: WorkedHoursDestinationTableCellProps) {
    const date = props.workday.format("YYYY-MM-DD");
    const initialDestination = props.dailyExpense?.destination ?? "";
    const [destination, setDestination] = useState(initialDestination);
    const [editing, setEditing] = useState(false);

    function editDailyExpense() {
        if (destination !== initialDestination) {
            props.setSavingStatus("saving");

            const newDailyExpense = props.dailyExpense ?? new DailyExpense(
                props.user.id,
                date,
                0,
                "",
                0,
                undefined,
                0,
                0,
                0,
                0,
                0
            );
            newDailyExpense.destination = destination;

            dailyExpensesApis.createOrUpdateDailyExpense(newDailyExpense)
                .then(() => props.setSavingStatus("saved"))
                .catch(err => console.error(err))
            props.createOrUpdateLocalDailyExpense(newDailyExpense);
        }

        setEditing(false);
    }

    if (editing) {
        return (
            <td key={`td-destination-${date}`} onBlur={editDailyExpense} className="work-item-input-td">
                <Form.Control size="sm" type="text" plaintext autoFocus
                              value={destination} onChange={ev => setDestination(ev.target.value)}
                              className="work-item-input-control vertical-text"/>
            </td>
        );
    } else {
        return (
            <td key={`td-destination-${date}`}
                className={(!props.workday.isBusinessDay() || props.workday.isHoliday()) ? "holiday" : undefined}
                onClick={() => setEditing(true)}>
                <div className="vertical-text">{destination}</div>
            </td>
        );
    }
}

export default WorkedHoursDestinationTableCell;