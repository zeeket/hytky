import { type Thread } from '@prisma/client';
import type { NextPage } from 'next';
import { useState } from 'react';
import { PrismaClient } from '@prisma/client';
import { api } from '~/utils/api';
import CreateCategoryModal from '../../components/CreateCategoryModal';
import CreateThreadModal from '../../components/CreateThreadModal';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  type CategoryWithChildren,
  type PostWithAuthor,
  type ThreadWithPostsAndAuthors,
} from '~/server/api/types';
import { ForumPathBar } from '~/components/ForumPathBar';
import superjson from 'superjson';
import { AccountDropdown } from '~/components/AccountDropdown';
import { ForumRow } from '~/components/ForumRow';
import CreatePostBox from '~/components/CreatePostBox';
import { ThreadMenu } from '~/components/ThreadMenu';

interface ForumProps {
  initialCategoryId: number;
  categoriesInPath: string;
  thread: string | null | undefined;
}

const Forum: NextPage<ForumProps> = (props: ForumProps) => {
  const propsObj: CategoryWithChildren[] = superjson.parse(
    props.categoriesInPath
  );
  const threadObj: ThreadWithPostsAndAuthors | undefined =
    props.thread && props.thread !== null
      ? superjson.parse(props.thread)
      : undefined;
  const router = useRouter();
  const { data: session } = useSession();

  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);

  // Derive state directly from props - no need for local state since URL is source of truth
  const currentCategoryId = props.initialCategoryId;
  const currentThreadId = threadObj?.id;

  const deleteThreadMutation = api.thread.deleteThread.useMutation({
    onSuccess: () => {
      // Navigate back to parent category
      const parentPath = propsObj
        .slice(1)
        .map((cat) => cat.name)
        .join('/');
      router.push(parentPath ? `/forum/${parentPath}` : '/forum');
    },
  });

  const moveThreadMutation = api.thread.moveThread.useMutation({
    onSuccess: (movedThread) => {
      // Navigate to the thread in its new location
      // We need to build the path to the new category
      const targetCategory = allCategoriesWithChildren.find(
        (cat) => cat.id === movedThread.categoryId
      );
      if (targetCategory && threadObj) {
        // Build path by traversing up the category tree
        const pathParts: string[] = [];
        let currentCat: CategoryWithChildren | undefined = targetCategory;
        while (currentCat && currentCat.parentCategoryId !== null) {
          pathParts.unshift(currentCat.name);
          currentCat = allCategoriesWithChildren.find(
            (cat) => cat.id === currentCat?.parentCategoryId
          );
        }
        const newPath = `/forum/${pathParts.join('/')}/${threadObj.name}`;
        router.push(newPath);
      }
    },
  });

  const handleDeleteThread = () => {
    if (currentThreadId && confirm('Haluatko varmasti poistaa tämän langan?')) {
      deleteThreadMutation.mutate({ threadId: currentThreadId });
    }
  };

  const handleMoveThread = (targetCategoryId: number) => {
    if (currentThreadId) {
      moveThreadMutation.mutate({
        threadId: currentThreadId,
        targetCategoryId,
      });
    }
  };

  const isThreadAuthor = threadObj && session?.user?.id === threadObj.authorId;

  const allCategoriesWithChildrenQuery = api.category.getAllCategories.useQuery(
    undefined,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
  const allCategoriesWithChildren: CategoryWithChildren[] =
    allCategoriesWithChildrenQuery.data || [];

  const childrenOfCurrentCategory = allCategoriesWithChildren.filter(
    (category: CategoryWithChildren) =>
      category.parentCategoryId === currentCategoryId
  );

  const threadsOfCurrentCategoryQuery =
    api.thread.getThreadsByCategoryId.useQuery(
      {
        categoryId: currentCategoryId,
      },
      {
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      }
    );
  const threadsOfCurrentCategory = threadsOfCurrentCategoryQuery.data || [];

  const rowsOfCurrentCategory = [
    ...childrenOfCurrentCategory,
    ...threadsOfCurrentCategory,
  ];

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <div>
          <h1 className="text-oldschool-orange pb-2 text-5xl font-extrabold">
            Foorumi
          </h1>
        </div>
        <AccountDropdown />

        {allCategoriesWithChildrenQuery.isLoading ||
        !allCategoriesWithChildrenQuery.data ||
        threadsOfCurrentCategoryQuery.isLoading ||
        !threadsOfCurrentCategoryQuery.data ? (
          <p className="text-white">Ladataan...</p>
        ) : (
          <div className="flex flex-col space-y-6">
            <ForumPathBar router={router} categoriesInPath={propsObj} />
            <ul className="flex flex-col">
              {currentThreadId && threadObj && (
                <div>
                  <div className="flex items-center justify-between pb-8">
                    <div className="flex items-center">
                      <h2 className="text-xl text-white">
                        Lanka: {threadObj.name}
                      </h2>
                      {isThreadAuthor && (
                        <ThreadMenu
                          threadId={currentThreadId}
                          currentCategoryId={currentCategoryId}
                          categories={allCategoriesWithChildren}
                          onDelete={handleDeleteThread}
                          onMove={handleMoveThread}
                          isDeleting={deleteThreadMutation.isLoading}
                          isMoving={moveThreadMutation.isLoading}
                        />
                      )}
                    </div>
                  </div>
                  <ol>
                    {threadObj.posts.map((post: PostWithAuthor) => (
                      <li key={post.id} className="text-white">
                        <div className="flex flex-row space-x-4 divide-x">
                          <p className="text-white"> {post.author.name} </p>
                          <p className="pl-4">{post.content}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {!currentThreadId &&
                rowsOfCurrentCategory.map(
                  (row: CategoryWithChildren | Thread) => (
                    <li key={row.id} className="text-white">
                      <ForumRow content={row} router={router} />
                    </li>
                  )
                )}
            </ul>
          </div>
        )}
        {currentThreadId ? (
          <CreatePostBox threadId={currentThreadId} router={router} />
        ) : (
          <div className="flex h-60 items-center justify-center">
            <button
              className="rounded-md bg-purple-600 px-6 py-3 text-purple-100"
              type="button"
              onClick={() => setShowCreateCategoryModal(true)}
            >
              Luo uusi kategoria
            </button>
            <CreateCategoryModal
              showCreateCategoryModal={showCreateCategoryModal}
              setShowCreateCategoryModal={setShowCreateCategoryModal}
              parentCategory={currentCategoryId}
            />
            <button
              className="rounded-md bg-gray-200 px-6 py-3"
              type="button"
              onClick={() => setShowCreateThreadModal(true)}
            >
              Luo uusi lanka
            </button>
            <CreateThreadModal
              showCreateThreadModal={showCreateThreadModal}
              setShowCreateThreadModal={setShowCreateThreadModal}
              parentCategory={currentCategoryId}
            />
          </div>
        )}
      </main>
    </>
  );
};

//return null if the category doesn't exist, otherwise return the category
const categoryPathExists = async (
  path: string[]
): Promise<{
  categories: CategoryWithChildren[];
  threadWithPosts: ThreadWithPostsAndAuthors | null;
} | null> => {
  const prisma = new PrismaClient();

  const rootCategory = await getRootCategory();
  const categories: CategoryWithChildren[] = [rootCategory];

  let currentParentId: number | null = rootCategory.id;

  // Traverse the path hierarchically, finding each category as a child of the previous one
  for (let i = 0; i < path.length; i++) {
    const segmentName = path[i];

    // Try to find this segment as a category
    const category: CategoryWithChildren | null =
      await prisma.category.findFirst({
        where: {
          name: segmentName,
          parentCategoryId: currentParentId,
        },
        include: {
          childCategories: true,
        },
      });

    if (category) {
      // Found the category, add it to the path and continue
      categories.push(category);
      currentParentId = category.id;
    } else {
      // Not found as a category, check if it's the last segment and could be a thread
      if (i === path.length - 1) {
        // Try to find it as a thread in the current category
        const threadWithPosts = await prisma.thread.findFirst({
          where: {
            name: segmentName,
            categoryId: currentParentId,
          },
          include: {
            posts: {
              include: {
                author: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (threadWithPosts) {
          // Found as a thread
          await prisma.$disconnect();
          return { categories: categories, threadWithPosts: threadWithPosts };
        }
      }

      // Path segment not found as category or thread
      await prisma.$disconnect();
      return null;
    }
  }

  // All segments were categories, no thread
  await prisma.$disconnect();
  return { categories: categories, threadWithPosts: null };
};

const getRootCategory = async (): Promise<CategoryWithChildren> => {
  const prisma = new PrismaClient();
  const rootCategory = await prisma.category.findFirst({
    where: {
      parentCategoryId: null,
    },
    include: {
      childCategories: true,
    },
  });
  await prisma.$disconnect();
  if (!rootCategory) {
    throw new Error('Root category not found');
  }
  return rootCategory;
};

export const getServerSideProps = async ({
  query,
}: {
  query: { slug: string[] };
}) => {
  if (query.slug) {
    // going to a category or thread

    if (query.slug.length > 4) {
      // we don't support more than 3 levels of categories (+1 thread)
      return { notFound: true };
    }

    const objsFromSlug = await categoryPathExists(query.slug);
    const categoriesInPath = objsFromSlug?.categories;

    if (!objsFromSlug || !categoriesInPath) {
      return { notFound: true };
    }

    return {
      props: {
        initialCategoryId:
          categoriesInPath[categoriesInPath.length - 1]?.id || 1,
        categoriesInPath: superjson.stringify(categoriesInPath),
        thread: objsFromSlug?.threadWithPosts
          ? superjson.stringify(objsFromSlug.threadWithPosts)
          : null,
      },
    };
  } else {
    // going to the root category
    // Fetch the actual root category from the database instead of hardcoding id: 1
    const rootCategory = await getRootCategory();
    const categoriesInPath = [rootCategory] as CategoryWithChildren[];
    return {
      props: {
        initialCategoryId: rootCategory.id,
        categoriesInPath: superjson.stringify(categoriesInPath),
        thread: null,
      },
    };
  }
};

export default Forum;
