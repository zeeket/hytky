import { type Category, type Thread } from '@prisma/client';
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { type NextRouter } from 'next/router';

export type ForumRowProps = {
  content: Category | Thread;
  router: NextRouter;
  setCurrentCategoryId: (id: number) => void;
  setCurrentThreadId: (id: number) => void;
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

    props.router
      .push(encodedPath)
      .then(() => {
        threadInProp
          ? props.setCurrentThreadId(clickedItem.id)
          : props.setCurrentCategoryId(clickedItem.id);
      })
      .catch((err) => {
        console.error('Navigation error:', err);
      });
  };

  return (
    <div className="flex flex-row space-x-2 divide-x">
      {categoryInProp && <FolderIcon className="text-purple h-6 w-6" />}
      {threadInProp && <DocumentTextIcon className="h-6 w-6 text-white" />}
      <button
        type="button"
        className="pl-2 text-white text-left"
        onClick={() => {
          handleForumRowClick(props.content);
        }}
      >
        {props.content.name}
      </button>
    </div>
  );
};
