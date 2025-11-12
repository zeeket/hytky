import { api } from '~/utils/api';
import { useState } from 'react';
import { type NextRouter } from 'next/router';

export type CreatePostBoxProps = {
  threadId: number;
  router: NextRouter;
};

const CreatePostBox = (props: CreatePostBoxProps) => {
  const [postContent, setPostContent] = useState('');
  const apiContext = api.useContext();
  const mutation = api.post.createPost.useMutation({
    onSuccess: () => {
      console.log('post created successfully!');
      setPostContent('');
      props.router
        .replace(props.router.asPath)
        .catch((err) => console.log(err));
      apiContext.post.invalidate().catch((err) => console.log(err));
      apiContext.thread.invalidate().catch((err) => console.log(err));
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
    },
  });

  const handlePostButtonPress = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    mutation.mutate({ content: postContent, threadId: props.threadId });
    console.log('handlePostButtonPress');
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ content: postContent, threadId: props.threadId });
  };

  return (
    <div className="pt-8">
      <form onSubmit={handleFormSubmit}>
        <textarea
          className="h-32 w-full bg-gray-800 text-white"
          value={postContent}
          onChange={(e) => {
            setPostContent(e.target.value);
          }}
        ></textarea>
        <button
          type="submit"
          className="mt-2 w-full flex-1 rounded-md bg-red-600 p-2.5 text-white ring-red-600 ring-offset-2 outline-none focus:ring-2"
          onClick={handlePostButtonPress}
        >
          Lähetä
        </button>
      </form>
    </div>
  );
};

export default CreatePostBox;
