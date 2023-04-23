import { Category } from "@prisma/client";
import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { PrismaClient } from "@prisma/client";

import { api } from "~/utils/api";
import CreateCategoryModal from "../../components/CreateCategoryModal";
import { useRouter } from 'next/router'
import { CategoryWithChildren } from "~/server/api/types";
import { ForumPathBar } from "~/components/ForumPathBar";

interface ForumProps {
  initialCategoryId: number;
}

const Forum: NextPage<ForumProps> = (props) => {
  const router = useRouter();
  
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(props.initialCategoryId);

  const handleForumRowClick = (category:Category) => {
    console.log("handleForumRowClick: ",category);
    router.push(`${router.asPath}/${category.name}`).then(() => {
      setCurrentCategoryId(category.id);
    });
  }
  
  const allCategoriesWithChildrenQuery = api.category.getAllCategories.useQuery();
  const allCategoriesWithChildren: CategoryWithChildren[] = allCategoriesWithChildrenQuery.data || [];
  const childrenOfCurrentCategory = allCategoriesWithChildren.filter((category:CategoryWithChildren) => category.parentCategoryId === currentCategoryId);

  //console.log("currentCategoryId: ",currentCategoryId);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <div>
        <h1 className="text-5xl font-extrabold text-oldschool-orange pb-2">
          Foorumi
        </h1>
        </div>
        {allCategoriesWithChildrenQuery.isLoading ? (
          <p className="text-white">Ladataan...</p>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <ForumPathBar path={router.asPath.split("/")} />
            <ul className="flex flex-col items-center justify-center">
              {childrenOfCurrentCategory.map((category:CategoryWithChildren) => (
                <li key={category.id} className="text-white">
                  <a href={`${router.asPath}/${category.name}`} onClick={(e)=>{e.preventDefault();handleForumRowClick(category)}}>{category.name}</a>
                  </li>
                  ))}
                  </ul>
                  </div>
        )}

<div className="flex items-center justify-center h-60">
                <button
                    className="px-6 py-3 text-purple-100 bg-purple-600 rounded-md"
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
            </div>
      </main>
    </>
  );
};

//return null if the category doesn't exist, otherwise return the category
const categoryPathExists = async ( path: string[]) : Promise<CategoryWithChildren|null> => {
  const prisma = new PrismaClient();

    let previous:CategoryWithChildren|null = null;
    const rootCategory = await getRootCategory();
    const categoriesInPath = await prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
      where: {
        name: { in: path },
      },
      include: {
        childCategories: true,
      },
    });

    console.log("categoriesInPath: ",categoriesInPath)

    if(categoriesInPath.length < path.length) {
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

    if(!exists) {
      return null;
    } else {
      return previous;
    }
  }

  const getRootCategory = async () : Promise<CategoryWithChildren> => {
    const prisma = new PrismaClient();
    const rootCategory = await prisma.category.findFirst({
      where: {
        parentCategoryId: null,
      },
      include: {
        childCategories: true,
      },
    });
    if(!rootCategory) {
      throw new Error("Root category not found");
    }
    return rootCategory;
  }

export const getServerSideProps = async ( { query } : { query:any } ) => {
  
  let path:string[] = [];
   console.log(query);
   if(query.slug) {
    // going to a category or thread
    
    if(query.slug.length > 4) {
    // we don't support more than 3 levels of categories (+1 thread)
      return { notFound: true };
    }

    const lastCategory = await categoryPathExists(query.slug);

    if(!lastCategory) {
      return { notFound: true };
    }
    //console.log("lastCategory: ",lastCategory)
    return { props: { initialCategoryId: lastCategory.id } };
  } else {
    // going to the root category
    return { props: { initialCategoryId: 1 } };
  }
};

export default Forum;
