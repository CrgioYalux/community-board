import type { Post } from "../../providers/API/types";

import { useAPI } from "../../providers/API";
import { useState } from "react";

import { Link } from "react-router-dom";

import Box from "../Icons/Box";
import Trash from "../Icons/Trash";
import Accept from "../Icons/Accept";
import Decline from "../Icons/Decline";

interface FeedProps {
    posts: Post[];
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
    loading: boolean;
    error?: string;
    className?: string;
    refetch?: () => void;
};

const Feed: React.FC<FeedProps> = ({ 
    posts,
    setPosts,
    loading,
    error = '',
    className = '',
    refetch,
}) => {
    const API = useAPI();
    const [deletingPostID, setDeletingPostID] = useState<number>(-1);

    const switchSaveOnPost = (post_id: number): void => {
        API.Actions.Posts.SwitchSave({ post_id })
        .then((res) => {
            if (res.done) {
                setPosts((prev) => prev.map((v) => {
                    if (v.post_id !== post_id) return v;

                    return {
                        ...v,
                        saved_by_consultant: !v.saved_by_consultant,
                        times_saved: !v.saved_by_consultant ? v.times_saved + 1 : v.times_saved - 1,
                    };
                }));
            }
        })
        .catch(() => {});
    };

    if (API.Value.fetching || loading)
        return (
            <div className={`grid place-items-center ${className}`}>
                <span className='text-2xl font-bold tracking-wide'>Looking for posts...</span>        
            </div>
        );

    if (!posts.length)
        return (
            <div className={`grid place-items-center ${className}`}>
                <div className='flex flex-col gap-2 items-center text-2xl'>
                    <span className='font-bold tracking-wide'>No posts to show</span>
                    <span className='text-red-400'>{error}</span>
                </div>
            </div>
        );

    const handleDeletePost = (post_id: number): void => {
        if (deletingPostID !== -1) return;
        setDeletingPostID(post_id);
    };

    const handleAccept = (): void => {
        API.Actions.Posts.Delete({ post_id: deletingPostID })
        .then((res) => {
            if (!res.deleted) return;
            if (refetch) refetch();
        })
        .catch(console.error)
        .finally(() => {
            setDeletingPostID(-1);
        });
    };

    const handleDecline = (): void => {
        setDeletingPostID(-1);
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {posts.map((p) => {
                const isConsultantOwner = API.Value.member?.affiliate_id === p.member_affiliate_id;
                const isDeleting = deletingPostID === p.post_id;

                return (
                    <div key={p.post_id} className='bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded flex flex-col p-2'>
                        <div className='flex flex-row justify-between items-center'>
                            <div className='flex flex-row gap-2 items-center'>
                                {p.fullname === null ? '' : <span className='text-xl font-bold'>{p.fullname}</span>}
                                <Link 
                                className='text-xs hover:underline cursor-pointer bg-gray-700 dark:bg-gray-300 rounded-full px-2 py-1'
                                to={`/members/${p.username}`}
                                >#{p.username}</Link>
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
                                        onClick={() => { handleDeletePost(p.post_id); }}
                                        >
                                            <Trash className='fill-current h-4 w-4' /> 
                                        </button>
                                    )
                            }
                        </div>
                        <div className='my-2'>
                            <span className='text-lg'>{p.body}</span>
                        </div>
                        <div className='flex flex-row gap-1 items-center justify-between text-sm'>
                            <button 
                            className={`${p.saved_by_consultant ? 'text-blue-500' : 'text-current'} flex flex-row gap-1 items-center cursor-pointer`}
                            onClick={() => switchSaveOnPost(p.post_id)}
                            >
                                <Box className='fill-current h-6 w-6' />
                                <span className='font-bold'>{p.times_saved}</span>
                            </button>
                            <span className=''>{(new Date(p.created_at)).toLocaleString()}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default Feed;
