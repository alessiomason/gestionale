import {User} from "./models/user";

export function humanize(x: number, fractionDigits: number) {
    return x.toFixed(fractionDigits)
        .replace(/\.?0*$/, '')
        .replace(/\./g, ',');
}

export function upperCaseFirst(str: string) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
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

export function compareUsers(a: User, b: User) {
    // sort active first
    if (!a.active && b.active) {
        return 1;
    } else if (a.active && !b.active) {
        return -1;
    }

    // sort by surname and name
    const surnameComparison = a.surname.localeCompare(b.surname);
    if (surnameComparison !== 0) {
        return surnameComparison;
    } else {
        return a.name.localeCompare(b.name);
    }
}