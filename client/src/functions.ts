export function humanize(x: number, fractionDigits: number) {
    return x.toFixed(fractionDigits).replace(/\.?0*$/, '');
}

// Extremely simple email validation function, useful to eliminate major mistakes.
export function checkValidEmail(email: string) {
    return email.includes("@") && email.includes(".");
}

// Valid password requires 8 characters or more, one lowercase, one uppercase letter and a number.
export function checkValidPassword(password: string) {
    const lowercaseLetters = /[a-z]/g;
    const uppercaseLetters = /[A-Z]/g;
    const numbers = /[0-9]/g;

    return password.length >= 8 && password.match(lowercaseLetters) && password.match(uppercaseLetters) && password.match(numbers);
}