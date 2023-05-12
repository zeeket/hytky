import { type Prisma } from "@prisma/client";

export type CategoryWithChildren = Prisma.CategoryGetPayload<{
    include: {
        childCategories: true;
    };
}>;

export type ThreadWithPosts = Prisma.ThreadGetPayload<{
    include: {
        posts: true;
    };
}>;

export type ThreadWithPostsAndAuthors = Prisma.ThreadGetPayload<{
    include: {
        posts: {
            include: {
                author: {
                    select: {
                        name: true;
                    };
                };
            };
        };
    };
}>;

export type PostWithAuthor = Prisma.PostGetPayload<{
    include: {
        author: {
            select: {
                name: true;
            };
        }
    };
}>;

export type UserRole = "admin" | "active" | "nakki";

export type botServiceResponse = { role: UserRole } | {error: string};