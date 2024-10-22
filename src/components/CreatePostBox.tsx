import { api } from '~/utils/api';
import { useState } from 'react';

export type CreatePostBoxProps = {
  threadId: number;
};

const CreatePostBox = (props: CreatePostBoxProps) => {
  const [postContent, setPostContent] = useState('');
  const apiContext = api.useContext();
  const mutation = api.post.createPost.useMutation({
    onSuccess: () => {
      console.log('post created successfully!');
      apiContext.post.invalidate().catch((err) => console.log(err));
    },
  });

  const handlePostButtonPress = () => {
    mutation.mutate({ content: postContent, threadId: props.threadId });
    console.log('handlePostButtonPress');
  };

  return (
    <div className="pt-8">
      <form>
        <textarea
          className="h-32 w-full bg-gray-800 text-white"
          onChange={(e) => {
            setPostContent(e.target.value);
          }}
        ></textarea>
        <button
          role="submit"
          className="mt-2 w-full flex-1 rounded-md bg-red-600 p-2.5 text-white outline-none ring-red-600 ring-offset-2 focus:ring-2"
          onClick={handlePostButtonPress}
        >
          Lähetä
        </button>
      </form>
    </div>
  );
};

export default CreatePostBox;
