import { db } from "../index.js";
import { feed_follows, feeds, users } from "../schema.js";
import { eq, and } from "drizzle-orm";
import { getFeedByUrl } from "./feeds.js"

export async function createFeedFollow(userId: string, feedId: string) {
    const [newFeedFollow] = await db
        .insert(feed_follows)
        .values({ userId, feedId })
        .returning();

    const [result] = await db
        .select({
            id: feed_follows.id,
            createdAt: feed_follows.createdAt,
            updatedAt: feed_follows.updatedAt,
            userId: feed_follows.userId,
            feedId: feed_follows.feedId,
            feedName: feeds.name,
            userName: users.name,
        })
        .from(feed_follows)
        .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
        .innerJoin(users, eq(feed_follows.userId, users.id))
        .where(eq(feed_follows.id, newFeedFollow.id));

    return result;
}

export async function getFeedFollowsForUser(userId: string) {
    const result = await db
        .select({
            id: feed_follows.id,
            createdAt: feed_follows.createdAt,
            updatedAt: feed_follows.updatedAt,
            userId: feed_follows.userId,
            feedId: feed_follows.feedId,
            feedName: feeds.name,
            userName: users.name,
        })
        .from(feed_follows)
        .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
        .innerJoin(users, eq(feed_follows.userId, users.id))
        .where(eq(feed_follows.userId, userId));

    return result;
}

export async function deleteFeedFollow(userId: string, feedUrl: string) {
    const feed = await getFeedByUrl(feedUrl);
    if (!feed) {
        throw new Error("feed not found");
    }
    await db
        .delete(feed_follows)
        .where(
            and(
                eq(feed_follows.userId, userId),
                eq(feed_follows.feedId, feed.id),
            ),
        );
}