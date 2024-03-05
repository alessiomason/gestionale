export function humanize(x: number, fractionDigits: number) {
    return x.toFixed(fractionDigits).replace(/\.?0*$/,'');
}