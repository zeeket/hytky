import { type NextRouter } from 'next/router';
import { type CategoryWithChildren } from '~/server/api/types';

export const ForumPathBar = (props: ForumPathBarProps) => {
  const handleForumPathBarClick = (pathToThisCategory: string) => {
    props.router.push(pathToThisCategory).catch((err) => {
      console.error('Breadcrumb navigation error:', err);
    });
  };

  return (
    <div className="flex flex-row gap-2">
      <span className="text-white">Olet tässä: </span>
      {props.categoriesInPath.map((p, i) => {
        // Build path from actual category names, not by slicing router.asPath
        // This works correctly with any depth and handles URL encoding properly
        // Skip the root category (index 0) and build path from categories 1 to i
        const categoryNamesUpToHere = props.categoriesInPath
          .slice(1, i + 1)
          .map((cat) => encodeURIComponent(cat.name));
        // Handle root category (i=0) specially to avoid trailing slash
        const pathToThisCategory =
          categoryNamesUpToHere.length === 0
            ? '/forum'
            : `/forum/${categoryNamesUpToHere.join('/')}`;
        return (
          <div key={i}>
            <a
              href={pathToThisCategory}
              className="text-white underline decoration-transparent transition duration-300 ease-in-out hover:decoration-inherit"
              onClick={(e) => {
                e.preventDefault();
                handleForumPathBarClick(pathToThisCategory);
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
};
