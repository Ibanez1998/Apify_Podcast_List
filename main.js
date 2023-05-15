const Apify = require('apify');
const puppeteer = require('puppeteer');

Apify.main(async () => {
    const browser = await Apify.launchPuppeteer();
    const page = await browser.newPage();
    await page.goto('https://podcasts.apple.com/us/genre/podcasts/id26');

    const results = [];
    const podcastLinks = await page.$$('.top-level-genre a');

    for (let link of podcastLinks) {
        const podcastPage = await browser.newPage();
        const podcastUrl = await link.getProperty('href').then(a => a.jsonValue());
        await podcastPage.goto(podcastUrl);

        const title = await podcastPage.$eval('header h1', h1 => h1.textContent);
        const category = await podcastPage.$eval('nav li a', a => a.textContent);
        const host = await podcastPage.$eval('.product-header__identity podcast-footer__credits', div => div.textContent);

        const episodes = await podcastPage.$$('.tracks__items .table__row--secondary');
        const frequency = 'Unknown'; // Not available on Apple Podcasts
        const totalShows = episodes.length;

        results.push({
            title,
            category,
            host,
            frequency,
            totalShows,
        });

        await podcastPage.close();
    }

    await Apify.setValue('OUTPUT', results);

    console.log('Scraping finished.');

    await browser.close();
});
