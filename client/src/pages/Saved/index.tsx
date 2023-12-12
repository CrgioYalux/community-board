import type { Post } from '../../providers/API/types';

import { useState, useEffect } from 'react';
import { useAPI } from '../../providers/API';

import Feed from "../../components/Feed";

const Saved: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const API = useAPI();

    useEffect(() => {
        API.Actions.Feed.GetSaved()
        .then((res) => {
            if (res.found) {
                setPosts(res.posts);
                return;
            }
        })
        .catch(() => {
            setError('An error occurred while fetching');
        });
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
        <Feed posts={posts} setPosts={setPosts} loading={API.Value.fetching || loading} error={error} />
    )
};

export default Saved;
