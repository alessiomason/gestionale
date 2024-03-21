import React, {useState} from "react";
import dayjs from "dayjs";
import {WorkItem} from "../models/workItem";
import {Job} from "../models/job";
import {Form} from "react-bootstrap";
import "./WorkedHoursTableCell.css";
import workItemApis from "../api/workItemApis";
import {User} from "../models/user";
import workdayClassName from "./workedHoursFunctions";

interface WorkedHoursWorkItemTableCellProps {
    readonly workday: dayjs.Dayjs
    readonly user: User
    readonly job: Job
    readonly workItem: WorkItem | undefined
    readonly setSavingStatus: React.Dispatch<React.SetStateAction<"" | "saving" | "saved">>
    readonly createOrUpdateLocalWorkItem: (job: Job, date: string, hours: number) => void
}

function WorkedHoursWorkItemTableCell(props: WorkedHoursWorkItemTableCellProps) {
    const date = props.workday.format("YYYY-MM-DD");
    const initialWorkItemHours = props.workItem?.hours.toString() ?? "";

    const [workItemHours, setWorkItemHours] = useState(initialWorkItemHours);
    const [editing, setEditing] = useState(false);

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const input = event.target.value;

        if (input === "") {
            setWorkItemHours("");
        } else if ((input.match(/[.,]/g)?.length ?? 0) <= 1) {  // maximum 1 "." or ","
            const lastInput = input[input.length - 1];

            // lastInput has to be a valid number
            if (!Number.isNaN(parseInt(lastInput)) || lastInput === "." || lastInput === ",") {
                setWorkItemHours(input);
            }
        }
    }

    function editWorkItem() {
        if (workItemHours !== initialWorkItemHours) {
            let hours = parseFloat(workItemHours);
            if (workItemHours === "") {
                hours = 0;
            }

            if (!Number.isNaN(hours)) {
                props.setSavingStatus("saving");
                workItemApis.createOrUpdateWorkItem(props.user.id, props.job.id, date, hours)
                    .then(() => props.setSavingStatus("saved"))
                    .catch(err => console.error(err))
                props.createOrUpdateLocalWorkItem(props.job, date, hours);
            }
        }

        setEditing(false);
    }

    function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            editWorkItem();
        } else if (event.key === "Escape") {
            setWorkItemHours("");
            setEditing(false);
        }
    }

    if (editing) {
        return (
            <td key={`td-${props.job.id}-${date}`} onBlur={editWorkItem} className="work-item-input-td">
                <Form.Control size="sm" type="text" maxLength={3} plaintext autoFocus
                              value={workItemHours} onChange={handleInputChange} onKeyDown={handleKeyPress}
                              className="work-item-input-control text-center"/>
            </td>
        );
    } else {
        return (
            <td key={`td-${props.job.id}-${date}`} className={workdayClassName(props.workday, true)}
                onClick={() => setEditing(true)}>
                {workItemHours}
            </td>
        );
    }
}

export default WorkedHoursWorkItemTableCell;