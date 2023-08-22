const fs = require('fs');

function isWithinLastSixMonths(dateStr) {
    const inputDate = new Date(dateStr);
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate);
    
    // Subtract 6 months from current date
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return inputDate > sixMonthsAgo;
}

function jsonToRss(jsonData, rssTitle, rssLink, rssDescription) {
    let rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${rssTitle}</title>
<link>${rssLink}</link>
<description>${rssDescription}</description>
<atom:link href="${rssLink}" rel="self" type="application/rss+xml" />
`;

    for (const entry of jsonData) {
        if (!isWithinLastSixMonths(entry.date)) {
            continue;  // skip this entry if older than 6 months
        }
        
        const version = entry.version;
        const date = entry.date;

        let description = `Changes in Version ${version}:\n\n`;

        for (const lib of entry.libraries) {
            const library = lib.library;

            description += `Library: ${library}\n`;

            for (const change of lib.changes) {
                const changeType = change.type;
                const changeText = change.text;

                description += `Type: ${changeType}, Description: ${changeText}\n`;
            }

            description += `\n`;
        }

        const guid = version;

        rssFeed += `<item>
<title>Version ${version} Changes</title>
<pubDate>${new Date(date).toUTCString()}</pubDate>
<description><![CDATA[${description}]]></description>
<guid>${guid}</guid>
</item>
`;
    }

    rssFeed += `
</channel>
</rss>`;

    return rssFeed;
}


fs.readFile('de.marianzeis.ui5libdiff/webapp/data/consolidated.json', 'utf-8', (err, data) => {
    if (err) {
        console.error("Error reading the file:", err);
        return;
    }

    const jsonData = JSON.parse(data);
    const rssFeed = jsonToRss(jsonData, "Changelog Feed", "https://www.example.com", "Changes for each version of the software.");

    fs.writeFile('de.marianzeis.ui5libdiff/webapp/rss_feed.xml', rssFeed, (err) => {
        if (err) {
            console.error("Error writing the file:", err);
        } else {
            console.log("RSS feed written to rss_feed.xml");
        }
    });
});
