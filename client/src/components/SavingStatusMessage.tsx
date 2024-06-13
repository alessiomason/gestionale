import React, {useEffect} from "react";
import {Check2Circle, ThreeDots} from "react-bootstrap-icons";

export type SavingStatus = "" | "saving" | "saved";

interface SavingStatusRowProps {
    readonly savingStatus: SavingStatus
    readonly setSavingStatus: React.Dispatch<React.SetStateAction<SavingStatus>>
}

function SavingStatusMessage(props: SavingStatusRowProps) {
    useEffect(() => {
        // clear savingStatus after 3 seconds
        if (props.savingStatus === "saved") {
            setTimeout(() => props.setSavingStatus(""), 3000);
        }
    }, [props.savingStatus]);

    return (
        <>
            {/* this forces the whole Row to always the same height, so that it does not change every time savingStatus is empty */}
            {props.savingStatus === "" && <p>&nbsp;</p>}

            {props.savingStatus !== "" && <p className="success d-flex justify-content-end align-items-center">
                {props.savingStatus === "saving" ?
                    <><ThreeDots className="mx-1"/>Salvataggio in corso...</> :
                    <><Check2Circle className="mx-1"/>Salvato</>}
            </p>}
        </>
    );
}

export default SavingStatusMessage;