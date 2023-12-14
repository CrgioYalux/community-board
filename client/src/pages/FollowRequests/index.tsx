import type { FollowRequest } from "../../providers/API/types";

import { useEffect, useState } from "react";
import { useAPI } from "../../providers/API";
import Accept from "../../components/Icons/Accept";
import Decline from "../../components/Icons/Decline";
import { Link } from "react-router-dom";

const FollowRequests: React.FC = () => {
    const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const API = useAPI();

    const fetchFollowRequests = (): void => {
        API.Actions.Followers.GetRequests()
        .then((res) => {
            if (!res.found) return;

            setFollowRequests(res.requests);
        })
        .catch(() => {
            setError('An error occurred while fetching');
        });
    };

    useEffect(() => {
        fetchFollowRequests();
    }, []);

    useEffect(() => {
        const fakeLoading = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => {
            clearTimeout(fakeLoading);
        };
    }, []);

    const handleAcceptRequest = (follow_request_id: number): void => {
        API.Actions.Followers.AcceptRequest({ follow_request_id })
        .then((res) => {
            if (!res.done) return;

            setFollowRequests((prev) => prev.filter((v) => v.follow_request_id !== follow_request_id));
        })
        .catch((err) => { console.error(err); });
    };

    const handleDeclineRequest = (follow_request_id: number): void => {
        API.Actions.Followers.DeclineRequest({ follow_request_id })
        .then((res) => {
            if (!res.done) return;

            setFollowRequests((prev) => prev.filter((v) => v.follow_request_id !== follow_request_id));
        })
        .catch((err) => { console.error(err); });
    };


    if (API.Value.fetching || loading)
        return (
            <div className='flex-auto flex flex-col items-center justify-center h-[calc(100vh-2.75rem)] text-2xl'>
                <span className='text-2xl font-bold tracking-wide'>Looking for follow requests...</span>        
            </div>
        );

    if (!followRequests.length)
        return (
            <div className='flex-auto flex flex-col items-center justify-center h-[calc(100vh-2.75rem)] text-2xl'>
                <span className='font-bold tracking-wide'>No follow requests to show</span>
                <span className='text-red-400'>{error}</span>
            </div>
        );

    
    return (
        <div className='flex-auto flex flex-col gap-2 h-[calc(100vh-2.75rem)] max-w-2xl overflow-y-auto p-2 pb-4'>
            {followRequests.map((f) => (
                <div key={f.follow_request_id} className='flex flex-row items-center justify-between bg-gray-600 text-blue-300 rounded p-2'>
                    <div className='flex flex-row gap-2 items-center'>
                        <Link
                        className='text-xs hover:underline cursor-pointer bg-gray-700 rounded-full px-2 py-1'
                        to={`/members/${f.username}`}
                        >#{f.username}</Link>
                        <span className='text-lg font-semibold text-white'>{f.fullname}</span>
                    </div>
                    <div className='flex flex-row gap-2 fill-current items-center'>
                        <button
                        className='h-4 w-4 border-2 border-current rounded-full p-1 box-content grid place-items-center'
                        onClick={() => handleAcceptRequest(f.follow_request_id)}
                        >
                            <Accept />
                        </button>
                        <button
                        className='h-4 w-4 border-2 border-current rounded-full p-1 box-content grid place-items-center'
                        onClick={() => handleDeclineRequest(f.follow_request_id)}
                        >
                            <Decline />
                        </button>
                    </div>
                </div>
            ))}
        </div>   
    );
};

export default FollowRequests;
