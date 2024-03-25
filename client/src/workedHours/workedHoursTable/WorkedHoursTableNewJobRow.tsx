import React, {useState} from "react";
import {Job} from "../../models/job";
import TextButton from "../../buttons/TextButton";
import {JournalPlus} from "react-bootstrap-icons";
import "./WorkedHoursTableNewJobRow.css";
import WorkedHoursNewJobModal from "../WorkedHoursNewJobModal";

interface WorkedHoursTableNewJobRowProps {
    readonly daysInMonth: number
    readonly setAddedJobs: React.Dispatch<React.SetStateAction<Job[]>>
}

function WorkedHoursTableNewJobRow(props: WorkedHoursTableNewJobRowProps) {
    const [showNewJobModal, setShowNewJobModal] = useState(false);

    function selectJob(job: Job) {
        props.setAddedJobs(addedJobs => {
            const newAddedJobs = Array(...addedJobs);
            newAddedJobs.push(job);
            return newAddedJobs;
        });
    }

    return (
        <>
            <WorkedHoursNewJobModal show={showNewJobModal} setShow={setShowNewJobModal} selectJob={selectJob}/>

            <tr>
                <td className="unhoverable"/>
                <td className="unhoverable">
                    <TextButton icon={JournalPlus} className="smaller-button"
                                onClick={() => setShowNewJobModal(true)}>Nuova commessa</TextButton>
                </td>

                <td colSpan={props.daysInMonth} className="unhoverable"/>
                <td className="unhoverable"/>
            </tr>
        </>
    );
}

export default WorkedHoursTableNewJobRow;