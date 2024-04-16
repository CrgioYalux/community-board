import type { Post } from "../../providers/API/types";

import { Link } from "react-router-dom";
import Trash from "../Icons/Trash";
import Decline from "../Icons/Decline";
import Accept from "../Icons/Accept";
import Box from "../Icons/Box";
import Comment from "../Icons/Comment";

interface PostProps {
    post: Post;
    isConsultantOwner: boolean;
    isDeleting: boolean;
    handleAccept: () => void;
    handleDecline: () => void;
    handleDelete: (post_id: number) => void;
    handleSwitchSaveOnPost: (post_id: number) => void;
    handleComment: (post_id: number) => void;
}

const PostDisplay: React.FC<PostProps> = ({ 
    post,
    isConsultantOwner,
    isDeleting,
    handleAccept,
    handleDecline,
    handleDelete,
    handleSwitchSaveOnPost,
    handleComment,
}) => {
    return (
        <div className='bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded flex flex-col p-2'>
            <div className='flex flex-row justify-between items-center'>
                <div className='flex flex-row gap-2 items-center'>
                    {post.fullname === null ? '' : <span className='text-xl font-bold'>{post.fullname}</span>}
                    <Link 
                    className='text-xs hover:underline cursor-pointer bg-gray-700 dark:bg-gray-300 rounded-full px-2 py-1'
                    to={`/members/${post.username}`}
                    >#{post.username}</Link>
                </div>
                {!isConsultantOwner ? ''
                    : isDeleting
                        ? (
                            <div className='flex flex-row gap-2 fill-current items-center'>
                                <button
                                className='h-4 w-4 border-2 border-current rounded-full p-1 box-content grid place-items-center'
                                onClick={handleAccept}
                                >
                                    <Accept />
                                </button>
                                <button
                                className='h-4 w-4 border-2 border-current rounded-full p-1 box-content grid place-items-center'
                                onClick={handleDecline}
                                >
                                    <Decline />
                                </button>
                            </div>
                        )
                        : (
                            <button 
                            className='rounded-full p-1'
                            onClick={() => handleDelete(post.post_id)}
                            >
                                <Trash className='fill-current h-4 w-4' /> 
                            </button>
                        )
                }
            </div>
            <div className='my-2'>
                <span className='text-lg'>{post.body}</span>
            </div>
            <div className='flex gap-1 items-center justify-between text-sm'>
                <div className='flex gap-1 items-center justify-center'>
                    <button 
                    className='rounded-full p-1'
                    onClick={() => handleComment(post.post_id)}
                    >
                        <Comment className='fill-current h-4 w-4' /> 
                    </button>
                    <button 
                    className={`${post.saved_by_consultant ? 'text-blue-500' : 'text-current'} flex gap-1 items-center cursor-pointer`}
                    onClick={() => handleSwitchSaveOnPost(post.post_id)}
                    >
                        <Box className='fill-current h-6 w-6' />
                        <span className='font-bold'>{post.times_saved}</span>
                    </button>
                </div>
                <span className=''>{(new Date(post.created_at)).toLocaleString()}</span>
            </div>
        </div>
    );
};

export default PostDisplay;
