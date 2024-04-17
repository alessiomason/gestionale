import React, {useState} from "react";
import dayjs from "dayjs";
import {Form} from "react-bootstrap";
import "./WorkedHoursTableCell.css";
import {DailyExpense} from "../../models/dailyExpense";
import dailyExpensesApis from "../../api/dailyExpensesApis";
import {User} from "../../models/user";
import workdayClassName from "../workedHoursFunctions";

interface WorkedHoursDailyTableCellProps {
    readonly workday: dayjs.Dayjs
    readonly dailyExpense: DailyExpense | undefined
    readonly field: "expenses" | "kms" | "travelHours" | "holidayHours" | "sickHours" | "donationHours" | "furloughHours"
    readonly selectedUser: User
    readonly setSavingStatus: React.Dispatch<React.SetStateAction<"" | "saving" | "saved">>
    readonly createOrUpdateLocalDailyExpense: (newDailyExpense: DailyExpense) => void
}

function WorkedHoursDailyTableCell(props: WorkedHoursDailyTableCellProps) {
    const date = props.workday.format("YYYY-MM-DD");
    const fieldValue = props.dailyExpense?.get(props.field);
    const initialCellContent = (!fieldValue || fieldValue === 0) ? "" : fieldValue.toString();
    const [cellContent, setCellContent] = useState(initialCellContent);
    const [cellContentBeforeEditing, setCellContentBeforeEditing] = useState(initialCellContent);
    const [editing, setEditing] = useState(false);

    function startEditing() {
        setCellContentBeforeEditing(cellContent);
        setEditing(true);
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const input = event.target.value;

        if (input === "") {
            setCellContent("");
        } else if ((input.match(/[.,]/g)?.length ?? 0) <= 1) {  // maximum 1 "." or ","
            const lastInput = input[input.length - 1];

            // lastInput has to be a valid number
            if (!Number.isNaN(parseInt(lastInput)) || lastInput === "." || lastInput === ",") {
                setCellContent(input.replace(/,/g, "."));
            }
        }
    }

    function editDailyExpense() {
        if (cellContent !== initialCellContent) {
            let numericCellContent = parseFloat(cellContent);
            if (cellContent === "") {
                numericCellContent = 0;
            }

            if (!Number.isNaN(numericCellContent)) {
                props.setSavingStatus("saving");

                const newDailyExpense = props.dailyExpense ?? new DailyExpense(
                    props.selectedUser.id,
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
                newDailyExpense.set(props.field, numericCellContent);
                if (props.field === "kms") {
                    newDailyExpense.tripCost = props.selectedUser.costPerKm ? newDailyExpense.kms * props.selectedUser.costPerKm : undefined;
                }

                dailyExpensesApis.createOrUpdateDailyExpense(newDailyExpense)
                    .then(() => props.setSavingStatus("saved"))
                    .catch(err => console.error(err))
                props.createOrUpdateLocalDailyExpense(newDailyExpense);
            }
        }

        setEditing(false);
    }

    function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            editDailyExpense();
        } else if (event.key === "Escape") {
            setCellContent(cellContentBeforeEditing);
            setEditing(false);
        }
    }

    if (editing) {
        return (
            <td key={`td-${props.field}-${date}`} onBlur={editDailyExpense} className="work-item-input-td">
                <Form.Control size="sm" type="text" maxLength={4} plaintext autoFocus
                              value={cellContent} onChange={handleInputChange} onKeyDown={handleKeyPress}
                              className="work-item-input-control text-center"/>
            </td>
        );
    } else {
        return (
            <td key={`td-${props.field}-${date}`} className={workdayClassName(props.workday, true)}
                onClick={startEditing}>
                {cellContent}
            </td>
        );
    }
}

export default WorkedHoursDailyTableCell;