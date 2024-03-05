export function humanize(x: number, fractionDigits: number) {
    return x.toFixed(fractionDigits).replace(/\.?0*$/,'');
}

// Extremely simple email validation function, useful to eliminate major mistakes.
export function checkValidEmail(email: string) {
    return email.includes("@") && email.includes(".");
}