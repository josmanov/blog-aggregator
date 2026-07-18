import { XMLParser } from "fast-xml-parser";
import { CommandError} from "./commandHandler.js"
import { getNextFeedToFetch, markFeedFetched} from "./lib/db/queries/feeds.js"

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

export const fetchFeed = async (feedURL: string) => {

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

export async function scrapeFeeds() {
    const feed = await getNextFeedToFetch();
    if (!feed) {
        console.log("No feeds to fetch");
        return;
    }
    console.log(`fetching ${feed.name} (${feed.url})`);

    const feedData = await fetchFeed(feed.url);
    await markFeedFetched(feed.id);

    for (const item of feedData.items) {
        console.log(item.title);
    }
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

export function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (!match) {
        throw new Error(`Invalid duration: ${durationStr}`);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case "ms": return value;
        case "s": return value * 1000;
        case "m": return value * 60 * 1000;
        case "h": return value * 60 * 60 * 1000;
        default: throw new Error(`Unknown unit: ${unit}`);
    }
}