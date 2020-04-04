const puppeteer = require('puppeteer');
const shell = require('shelljs');
let dates = [];

async function screenshotDOMElement(selector, page, path = 'page', padding = 0) {
    const rect = await page.evaluate(selector => {
        const element = document.querySelector(selector);
        const {x, y, width, height} = element.getBoundingClientRect();
        return {left: x, top: y, width, height, id: element.id};
    }, selector);

    return await page.screenshot({
        path: `${path}.png`,
        clip: {
            x: rect.left - padding,
            y: rect.top - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2
        }
    });
}

(async () => {
    const browser = await puppeteer.launch({
        // headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 1800,
    });
    await page.goto('https://ezakupy.tesco.pl/groceries/pl-PL/slots/delivery');
    await page.waitForSelector('#email');

    shell.env["TEST"] = "Test Variable";
    shell.exec('export TEST="Test Variable2"');

    // Login
    await page.type('#email', process.env.EMAIL);
    await page.type('#password', process.env.PASS);
    await page.click('.smart-submit-button .button');

    // Check dates tabs
    const tabsSelector = '.tabs .slot-selector--week-tabheader';
    await page.waitForSelector(tabsSelector)
        .catch(() => console.error(`Tabs were NOT found`));
    const tabsCount = (await page.$$(tabsSelector)).length;

    // Select each tab
    for (let i = 1; i < tabsCount + 1; i++) {
        await page.waitFor(2000);
        await page.click(`${tabsSelector}:nth-of-type(${i}) .slot-selector--week-tabheader-link`);
        await page.waitForSelector('.slot-selector .overlay-spinner--overlay:not(.open)', { timeout: 12000 })
            .catch(() => console.error(`NOT found .overlay-spinner--overlay:not(.open)`));
        await page.waitForSelector(`${tabsSelector}:nth-of-type(${i}).active`, { timeout: 12000 })
            .catch(() => console.error(`Tab ${i} NOT activated :(`));

        // check available listed dates
        const resultsSelector = '.slot-selector--week-tab .slot-grid__table';
        await page.waitForSelector(resultsSelector, { timeout: 4000 })
            .catch(() => {});

        const dateLinkSelector = '.slot-grid__table .available-slot--button';
        const foundDates = await page.evaluate(dateLinkSelector => {
            const anchors = Array.from(document.querySelectorAll(dateLinkSelector));
            return anchors.map(anchor => {
                const date = anchor.textContent.split(',')[0].trim();
                return date;
            });
        }, dateLinkSelector);

        if (foundDates.length) {
            await screenshotDOMElement('.slot-selector', page,'dates');
        }

        dates = [...dates, ...foundDates];
    }

    // deduplicate
    dates = [...new Set(dates)];

    // Results
    if (dates.length) {
        const previousDates = process.env.PREVIOUS_DATES || '';
        const isDateChanged = !previousDates || dates.some((date) => !previousDates.includes(date));

        if (isDateChanged) {
            console.log(dates.join('\n'));
        } else {
            console.error('Dates not changed - ', dates.join(', '));
            process.exit(1);
        }
    } else {
        console.error('No available dates');
        process.exit(1);
    }

    await browser.close();
})();
