import { Prisma } from "@prisma/client";

export type CategoryWithChildren = Prisma.CategoryGetPayload<{
    include: {
        childCategories: true;
    };
}>;

export type UserRole = "admin" | "active" | "nakki";

export type botServiceResponse = { role: UserRole } | {error: string};