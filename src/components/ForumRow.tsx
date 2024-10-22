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
    props.router
      .push(`${props.router.asPath}/${clickedItem.name}`)
      .then(() => {
        threadInProp
          ? props.setCurrentThreadId(clickedItem.id)
          : props.setCurrentCategoryId(clickedItem.id);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      className="flex flex-row space-x-2 divide-x"
      onClick={(e) => {
        e.preventDefault();
        handleForumRowClick(props.content);
      }}
    >
      {categoryInProp && <FolderIcon className="text-purple h-6 w-6" />}
      {threadInProp && <DocumentTextIcon className="h-6 w-6 text-white" />}
      <a
        href={`${props.router.asPath}/${props.content.name}`}
        className="pl-2 text-white"
      >
        {props.content.name}
      </a>
    </div>
  );
};
