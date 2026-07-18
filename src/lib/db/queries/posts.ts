import { db } from "../index.js";
import { posts, feed_follows } from "../schema.js"

import { desc, eq } from "drizzle-orm";

export async function createPost(post: {
    title: string | null;
    url: string;
    description: string | null;
    publishedAt: Date | null;
    feedId: string;
}) {
    const [result] = await db.insert(posts).values(post).returning();
    return result;
}

export async function getPostsForUser(userId: string, limit: number) {
    const result = await db
        .select({
            id: posts.id,
            title: posts.title,
            url: posts.url,
            description: posts.description,
            publishedAt: posts.publishedAt,
            feedId: posts.feedId,
        })
        .from(posts)
        .innerJoin(feed_follows, eq(posts.feedId, feed_follows.feedId))
        .where(eq(feed_follows.userId, userId))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);
    return result;
}