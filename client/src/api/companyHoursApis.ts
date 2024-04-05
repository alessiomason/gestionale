import {apiUrl} from "./apisValues";
import {handleApiError} from "./handleApiError";

async function getCompanyHours(month: string) {
    const response = await fetch(new URL(`companyHours/${month}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

const companyHoursApis = {getCompanyHours};
export default companyHoursApis;