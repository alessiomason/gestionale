import dayjs from "dayjs";

function workdayClassName(workday: dayjs.Dayjs, hoverable: boolean) {
    let className = undefined;

    if (workday.isSame(dayjs(), "day")) {
        className = "today";
    } else if (!workday.isBusinessDay() || workday.isHoliday()) {
        className = "holiday";
    }

    if (!hoverable) {
        if (className) {
            className += " unhoverable";
        } else {
            className = "unhoverable";
        }
    }

    return className;
}

export default workdayClassName;