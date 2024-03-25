import {useMediaQuery} from "react-responsive";
import WorkedHoursDesktopPage from "./WorkedHoursDesktopPage";
import WorkedHoursMobilePage from "./WorkedHoursMobilePage";
import {User} from "../models/user";

export interface WorkedHoursPageProps {
    readonly user: User
}

function WorkedHoursPage(props: WorkedHoursPageProps) {
    const isMobile = useMediaQuery({maxWidth: 767});

    if (isMobile) {
        return (
            <WorkedHoursMobilePage user={props.user}/>
        );
    } else {
        return (
            <WorkedHoursDesktopPage user={props.user}/>
        );
    }
}

export default WorkedHoursPage;