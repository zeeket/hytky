import { type Category, type Thread } from '@prisma/client';
import type { NextPage } from 'next';
import { useState } from 'react';
import { PrismaClient } from '@prisma/client';
import { env } from '~/env.mjs';
import { api } from '~/utils/api';
import CreateCategoryModal from '../../components/CreateCategoryModal';
import CreateThreadModal from '../../components/CreateThreadModal';
import { useRouter } from 'next/router';
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

interface ForumProps {
  initialCategoryId: number;
  categoriesInPath: string;
  thread: string | undefined;
}

const Forum: NextPage<ForumProps> = (props: ForumProps) => {
  const propsObj: CategoryWithChildren[] = superjson.parse(
    props.categoriesInPath
  );
  const threadObj: ThreadWithPostsAndAuthors | undefined = props.thread
    ? superjson.parse(props.thread)
    : undefined;
  const router = useRouter();

  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(
    props.initialCategoryId
  );
  const [currentThreadId, setCurrentThreadId] = useState(threadObj?.id);

  const allCategoriesWithChildrenQuery =
    api.category.getAllCategories.useQuery();
  const allCategoriesWithChildren: CategoryWithChildren[] =
    allCategoriesWithChildrenQuery.data || [];
  const childrenOfCurrentCategory = allCategoriesWithChildren.filter(
    (category: CategoryWithChildren) =>
      category.parentCategoryId === currentCategoryId
  );

  const threadsOfCurrentCategoryQuery =
    api.thread.getThreadsByCategoryId.useQuery({
      categoryId: currentCategoryId,
    });
  const threadsOfCurrentCategory = threadsOfCurrentCategoryQuery.data || [];

  const rowsOfCurrentCategory = [
    ...childrenOfCurrentCategory,
    ...threadsOfCurrentCategory,
  ];

  //console.log("currentCategoryId: ",currentCategoryId);

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
        !props.categoriesInPath ||
        threadsOfCurrentCategoryQuery.isLoading ? (
          <p className="text-white">Ladataan...</p>
        ) : (
          <div className="flex flex-col space-y-6">
            <ForumPathBar
              router={router}
              categoriesInPath={propsObj}
              setCurrentCategoryId={setCurrentCategoryId}
              setCurrentThreadId={setCurrentThreadId}
            />
            <ul className="flex flex-col">
              {currentThreadId && threadObj && (
                <div>
                  <h2 className="pb-8 text-xl text-white">
                    Lanka: {threadObj.name}
                  </h2>
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
                      <ForumRow
                        content={row}
                        router={router}
                        setCurrentCategoryId={setCurrentCategoryId}
                        setCurrentThreadId={setCurrentThreadId}
                      />
                    </li>
                  )
                )}
            </ul>
          </div>
        )}
        {currentThreadId ? (
          <CreatePostBox threadId={currentThreadId} />
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

  let previous: CategoryWithChildren | null = null;
  const rootCategory = await getRootCategory();
  const categoriesInPath = await prisma.category.findMany({
    orderBy: {
      id: 'asc',
    },
    where: {
      name: { in: path },
    },
    include: {
      childCategories: true,
    },
  });

  console.log('categoriesInPath: ', categoriesInPath);

  if (categoriesInPath.length < path.length - 1) {
    return null;
  }

  const categories = [rootCategory, ...categoriesInPath];

  const exists = categories.every((category) => {
    if (previous === null && category.parentCategoryId !== null) {
      return false;
    }

    if (previous !== null && category.parentCategoryId !== previous.id) {
      return false;
    }

    previous = category;
    return true;
  });

  if (!exists) {
    return null;
  } else {
    if (categoriesInPath.length === path.length - 1) {
      const threadWithPosts = await prisma.thread.findFirst({
        where: {
          name: path[path.length - 1],
          categoryId: categoriesInPath[categoriesInPath.length - 1]?.id,
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
      if (!threadWithPosts) {
        //found categories but last bit in path was not a thread
        return null;
      } else {
        //categories and thread
        return { categories: categories, threadWithPosts: threadWithPosts };
      }
    }
    //only categories, no thread
    return { categories: categories, threadWithPosts: null };
  }
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
  //console.log(query);
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
    //console.log("lastCategory: ",lastCategory)
    return {
      props: {
        initialCategoryId:
          categoriesInPath[categoriesInPath.length - 1]?.id || 1,
        categoriesInPath: superjson.stringify(categoriesInPath),
        thread: superjson.stringify(objsFromSlug?.threadWithPosts),
      },
    };
  } else {
    // going to the root category
    const rootCategory = {
      id: 1,
      name: env.FORUM_ROOT_NAME,
      parentCategoryId: null,
      childCategories: [] as Category[],
    } as CategoryWithChildren;
    const categoriesInPath = [rootCategory] as CategoryWithChildren[];
    return {
      props: {
        initialCategoryId: 1,
        categoriesInPath: superjson.stringify(categoriesInPath),
      },
    };
  }
};

export default Forum;
