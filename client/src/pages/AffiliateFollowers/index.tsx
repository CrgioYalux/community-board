import type { FollowRequest } from "../../providers/API/types";

import { useEffect, useState } from "react";
import { useAPI } from "../../providers/API";
import { useParams, Link } from "react-router-dom";
import NotFound from "../NotFound";

const AffiliateFollowers: React.FC = () => {
    const params = useParams<{ affiliate_id: string }>();

    const [affiliateFollowers, setAffiliateFollowers] = useState<FollowRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const API = useAPI();

    if (params.affiliate_id === undefined || isNaN(Number(params.affiliate_id))) return (
        <NotFound />
    );

    const consultant_affiliate_id = Number(params.affiliate_id);

    const fetchAffiliateFollowers = (): void => {
        API.Actions.Followers.Get({ consultant_affiliate_id })
        .then((res) => {
            if (!res.found) return;

            setAffiliateFollowers(res.followers);
        })
        .catch(() => {
            setError('An error occurred while fetching');
        });
    };

    useEffect(() => {
        fetchAffiliateFollowers();
    }, []);

    useEffect(() => {
        const fakeLoading = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => {
            clearTimeout(fakeLoading);
        };
    }, []);

    if (API.Value.fetching || loading)
        return (
            <div className='flex-auto flex flex-col items-center justify-center h-[calc(100vh-2.75rem)] text-2xl'>
                <span className='text-2xl font-bold tracking-wide'>Looking for followers...</span>        
            </div>
        );

    if (!affiliateFollowers.length)
        return (
            <div className='flex-auto flex flex-col items-center justify-center h-[calc(100vh-2.75rem)] text-2xl'>
                <span className='font-bold tracking-wide'>No followers to show</span>
                <span className='text-red-400'>{error}</span>
            </div>
        );

    return (
        <div className='flex-auto flex flex-col gap-2 h-[calc(100vh-2.75rem)] max-w-2xl overflow-y-auto p-2 pb-4'>
            {affiliateFollowers.map((f) => (
                <div key={f.follow_request_id} className='flex flex-row items-center justify-between bg-gray-600 text-blue-300 rounded p-2'>
                    <div className='flex flex-row gap-2 items-center'>
                        <Link
                        className='text-xs hover:underline cursor-pointer bg-gray-700 rounded-full px-2 py-1'
                        to={`/members/${f.username}`}
                        >#{f.username}</Link>
                        <span className='text-lg font-semibold text-white'>{f.fullname}</span>
                    </div>
                </div>
            ))}
        </div>   
    );
};

export default AffiliateFollowers;
