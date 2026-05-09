import { type Category, type Thread } from '@prisma/client';
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { type NextRouter } from 'next/router';

export type ForumRowProps = {
  content: Category | Thread;
  router: NextRouter;
};

const isCategory = (category: Category | Thread): boolean => {
  return (category as Category).parentCategoryId !== undefined;
};

export const ForumRow = (props: ForumRowProps) => {
  const threadInProp = !isCategory(props.content);
  const categoryInProp = isCategory(props.content);

  const handleForumRowClick = (clickedItem: Category | Thread) => {
    // URL encode the item name to handle spaces and special characters
    const encodedPath = `${props.router.asPath}/${encodeURIComponent(clickedItem.name)}`;

    props.router.push(encodedPath).catch((err) => {
      console.error('Navigation error:', err);
    });
  };

  return (
    <div className="group flex cursor-pointer flex-row divide-x px-3 py-1 hover:bg-white/5">
      <div className="pr-2">
        {categoryInProp && (
          <FolderIcon className="text-purple group-hover:text-oldschool-orange h-6 w-6" />
        )}
        {threadInProp && (
          <DocumentTextIcon className="group-hover:text-oldschool-orange h-6 w-6 text-white" />
        )}
      </div>
      <button
        type="button"
        className="group-hover:text-oldschool-orange pl-2 text-left text-white"
        onClick={() => {
          handleForumRowClick(props.content);
        }}
      >
        {props.content.name}
      </button>
    </div>
  );
};
