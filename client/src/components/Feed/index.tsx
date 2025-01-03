import type { Post } from '../../providers/API/types';

import { useAPI } from '../../providers/API';
import { useState } from 'react';

import PostDisplay from '../PostDisplay';

interface FeedProps {
	posts: Post[];
	setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
	loading: boolean;
	error?: string;
	className?: string;
	refetch?: () => void;
}

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
					setPosts((prev) =>
						prev.map((v) => {
							if (v.post_id !== post_id) return v;

							return {
								...v,
								saved_by_consultant: !v.saved_by_consultant,
								times_saved: !v.saved_by_consultant
									? v.times_saved + 1
									: v.times_saved - 1,
							};
						})
					);
				}
			})
			.catch(() => {});
	};

	if (API.Value.fetching || loading)
		return (
			<div className={`grid place-items-center ${className}`}>
				<span className="text-2xl font-bold tracking-wide">
					Looking for posts...
				</span>
			</div>
		);

	if (!posts.length)
		return (
			<div className={`grid place-items-center ${className}`}>
				<div className="flex flex-col gap-2 items-center text-2xl">
					<span className="font-bold tracking-wide">
						No posts to show
					</span>
					<span className="text-red-400">{error}</span>
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
				const isConsultantOwner =
					API.Value.member?.affiliate_id === p.member_affiliate_id;
				const isDeleting = deletingPostID === p.post_id;

				return (
					<PostDisplay
						post={p}
						isConsultantOwner={isConsultantOwner}
						isDeleting={isDeleting}
						handleAccept={handleAccept}
						handleDecline={handleDecline}
						handleDelete={handleDeletePost}
						handleSwitchSaveOnPost={switchSaveOnPost}
						handleComment={() => {
							/* TODO */
						}}
					/>
				);
			})}
		</div>
	);
};

export default Feed;
