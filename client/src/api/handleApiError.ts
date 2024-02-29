export async function handleApiError(response: Response) {
    const errorDetail = await response.json();
    if (response.status === 401) {  // unauthorized (session expired), refresh to go to login page
        window.location.reload();
    } else throw errorDetail.message;
}