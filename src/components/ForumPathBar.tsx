import { type NextRouter } from 'next/router';
import { type CategoryWithChildren } from '~/server/api/types';

export const ForumPathBar = (props: ForumPathBarProps) => {
  const path = props.router.asPath.split('/');
  const categoriesInPath = props.categoriesInPath;
  console.log(
    `categoriesInPath length: ${categoriesInPath.length} path length: ${path.length}`
  );

  const handleForumPathBarClick = (
    pathToThisCategory: string,
    thisCategoryId: number
  ) => {
    props.router
      .push({ pathname: pathToThisCategory })
      .then(() => {
        props.setCurrentCategoryId(thisCategoryId);
        props.setCurrentThreadId(NaN);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="flex flex-row gap-2">
      <span className="text-white">Olet tässä: </span>
      {props.categoriesInPath.map((p, i) => {
        const pathToThisCategory = path.slice(2, i + 2).join('/') || '';
        //console.log(`category name: ${p.name} pathToThisCategory: ${pathToThisCategory}`);
        return (
          <div key={i}>
            <a
              href={pathToThisCategory}
              className="text-white underline decoration-transparent transition duration-300 ease-in-out hover:decoration-inherit"
              onClick={(e) => {
                e.preventDefault();
                handleForumPathBarClick(pathToThisCategory, p.id);
              }}
            >
              {p.name}
            </a>
            <span className="text-white"> /</span>
          </div>
        );
      })}
    </div>
  );
};

export type ForumPathBarProps = {
  router: NextRouter;
  categoriesInPath: CategoryWithChildren[];
  setCurrentCategoryId: (idToSet: number) => void;
  setCurrentThreadId: (idToSet: number) => void;
};
