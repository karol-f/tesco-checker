const isSameDay = require('date-fns/isSameDay');

let dates = (process.env.DATES && process.env.DATES.split('\n'));

(async () => {
    if (dates && dates.length) {
        const previousDates = process.env.PREVIOUS_DATES || '';
        const lastFoundTimestamp = parseInt(process.env.LAST_FOUND_DATES_TIMESTAMP, 10);

        const isDatesSameDay = lastFoundTimestamp && isSameDay(new Date(lastFoundTimestamp * 1000), new Date());

        if (isDatesSameDay) {
            const merged = [...previousDates.split('\n'), ...dates].filter(Boolean);
            const mergedAndDeduplicated = [...new Set(merged)];
            console.log(mergedAndDeduplicated.join('\n'));
        } else {
            console.log(dates.join('\n'));
        }
    } else {
        console.error('No dates to merge.');
    }
})();
