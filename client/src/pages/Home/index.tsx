import type { Post } from '../../providers/API/types';

import { useState, useEffect } from 'react';
import { useAPI } from '../../providers/API';

import PostForm from '../../components/PostForm';
import Feed from '../../components/Feed';
import Divider from '../../layouts/components/Divider';

const Home: React.FC = () => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [error, setError] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);

	const API = useAPI();

	const fetchFeed = (): void => {
		API.Actions.Feed.Get()
			.then((res) => {
				setPosts(res.found ? res.posts : []);
			})
			.catch(() => {
				setError('An error occurred while fetching');
			});
	};

	useEffect(() => {
		fetchFeed();
	}, []);

	useEffect(() => {
		const fakeLoading = setTimeout(() => {
			setLoading(false);
		}, 500);

		return () => {
			clearTimeout(fakeLoading);
		};
	}, []);

	return (
		<div className="flex-auto flex flex-col gap-2 h-[calc(100vh-2.75rem)] max-w-2xl overflow-y-auto p-2 pb-4">
			<PostForm onPublish={fetchFeed} />
			<Feed
				posts={posts}
				setPosts={setPosts}
				loading={API.Value.fetching || loading}
				error={error}
				refetch={fetchFeed}
			/>
			<div className="flex-initial flex flex-row gap-1 items-center">
				<Divider className="h-1 flex-auto" />
				<span className="text-2xl text-current">End of timeline</span>
				<Divider className="h-1 flex-auto" />
			</div>
		</div>
	);
};

export default Home;
