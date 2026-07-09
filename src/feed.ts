import { XMLParser } from "fast-xml-parser";
import { CommandError} from "./commandHandler.js"

type FeedItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
}

const isValidItem = (item: unknown): item is FeedItem => {
    
    if (typeof item !== "object" || item === null) {
        return false;
    } 

    const i = item as Record<string, unknown>;
    return (
        typeof i.title === "string" && i.title !== "" &&
        typeof i.link === "string" && i.link !== "" &&
        typeof i.description === "string" && i.description !== "" &&
        typeof i.pubDate === "string" && i.pubDate !== ""
    );
}

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
    const rawItem = parsedXml.rss.channel.item;

    let items = [];

    if (rawItem) {
        if (Array.isArray(rawItem)) {
            items = rawItem;
        } else {
            items = [rawItem];
        }
    }
    const mappedItems: FeedItem[] = items
        .filter(isValidItem)
        .map((item) => ({
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
    }));
    
    const channelObject = {
        channel: {
            title: parsedXml.rss.channel.title,
            link: parsedXml.rss.channel.link,
            description: parsedXml.rss.channel.description
        },
        items: mappedItems,
    }
    return channelObject;
}

export async function aggregator() {
    try {
        const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
        console.log("fetching completed");
        console.log(feed);
    } catch (error) {
        throw new CommandError("couldn't fetch data", 1);
    }
}