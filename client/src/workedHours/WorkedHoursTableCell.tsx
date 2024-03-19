import React, {useState} from "react";
import dayjs from "dayjs";
import {WorkItem} from "../models/workItem";
import {Job} from "../models/job";
import {Form} from "react-bootstrap";
import "./WorkedHoursTableCell.css";
import workItemApis from "../api/workItemApis";

interface WorkedHoursTableCellProps {
    readonly job: Job
    readonly workday: dayjs.Dayjs
    readonly workItems: WorkItem[] | undefined
}

function WorkedHoursTableCell(props: WorkedHoursTableCellProps) {
    const initialWorkItemHours = props.workItems?.find(workItem =>
        workItem.job.id === props.job.id &&
        workItem.date === props.workday.format("YYYY-MM-DD")
    )?.hours.toString() ?? "";

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
                workItemApis.createOrUpdateWorkItem(props.job.id, props.workday.format("YYYY-MM-DD"), hours)
                    .catch(err => console.error(err))
            }
        }

        setEditing(false);
    }

    if (editing) {
        return (
            <td key={`${props.job.id}-${props.workday.format()}`} onBlur={editWorkItem} className="work-item-input-td">
                <Form.Control size="sm" type="text" maxLength={3} plaintext autoFocus
                              value={workItemHours} onChange={handleInputChange}
                              className="work-item-input-control text-center"/>
            </td>
        );
    } else {
        return (
            <td key={`${props.job.id}-${props.workday.format()}`}
                className={(!props.workday.isBusinessDay() || props.workday.isHoliday()) ? "holiday" : undefined}
                onClick={() => setEditing(true)}>
                {workItemHours}
            </td>
        );
    }
}

export default WorkedHoursTableCell;