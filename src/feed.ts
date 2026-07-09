import { XMLParser } from "fast-xml-parser";

const fetchFeed = async (feedURL: string) => {

    const response = await fetch(feedURL, {
        headers: {
            "User-Agent": "gator",
        },
    });
    const parser = new XMLParser({
        processEntities: false,
    });

    const xmlText = await response.text();
    const parsedXml = parser.parse(xmlText);
    //console.log("Entire parsed XML:", parsedXml);
    console.log("Channel:", parsedXml.rss.channel);
}

// FOR QUICK TESTING


async function test() {
    try {
        await fetchFeed("https://www.wagslane.dev/index.xml");
        console.log("done");
    } catch (error) {
        console.error(error);
    }
}

test();