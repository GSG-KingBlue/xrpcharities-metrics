export function dateToStringForLocale(dateToFormat: Date): string {
    return dateToFormat.toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale);
}

export function dateToStringEuropeForLocale(dateToFormat: Date): string {
    return dateToFormat.toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale, {timeZone: 'Europe/Berlin'} );
}

export function dateToStringEuropeForAPI(dateToFormat: Date): string {
    return dateToFormat.toLocaleString("en-US", {timeZone: 'Europe/Berlin'} );
}

export function initializeDateAsGMT2(date: Date): Date {    
    return new Date(date.toUTCString() + '+0200');
}

export function initializeStringDateAsGMT2(date: string): Date {    
    return new Date(new Date(date).toUTCString() + '+0200');
}
