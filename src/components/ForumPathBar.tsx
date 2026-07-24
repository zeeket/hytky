import { type NextRouter } from 'next/router';
import { type CategoryWithChildren } from '~/server/api/types';

export const ForumPathBar = (props: ForumPathBarProps) => {
  const handleForumPathBarClick = (pathToThisCategory: string) => {
    props.router.push(pathToThisCategory).catch((err) => {
      console.error('Breadcrumb navigation error:', err);
    });
  };

  return (
    <div className="flex flex-row flex-wrap items-center gap-x-1 gap-y-1 px-2">
      <span className="shrink-0 text-white">Olet tässä: </span>
      {props.categoriesInPath.map((p, i) => {
        const categoryNamesUpToHere = props.categoriesInPath
          .slice(1, i + 1)
          .map((cat) => encodeURIComponent(cat.name));
        const pathToThisCategory =
          categoryNamesUpToHere.length === 0
            ? '/forum'
            : `/forum/${categoryNamesUpToHere.join('/')}`;
        return (
          <div key={i} className="flex shrink-0 items-center gap-x-1">
            <a
              href={pathToThisCategory}
              className="hover:text-oldschool-orange rounded px-1 py-0.5 text-white underline decoration-transparent transition duration-300 ease-in-out hover:bg-white/5 hover:decoration-inherit"
              onClick={(e) => {
                e.preventDefault();
                handleForumPathBarClick(pathToThisCategory);
              }}
            >
              {p.name}
            </a>
            <span className="text-white">/</span>
          </div>
        );
      })}
    </div>
  );
};

export type ForumPathBarProps = {
  router: NextRouter;
  categoriesInPath: CategoryWithChildren[];
};
