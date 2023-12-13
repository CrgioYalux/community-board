import type { MemberFromMemberPov, Post } from "../../providers/API/types";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAPI } from "../../providers/API";

import NotFound from "../NotFound";
import Cake from "../../components/Icons/Cake";
import Calendar from "../../components/Icons/Calendar";
import Feed from "../../components/Feed";

const MemberByID: React.FC = () => {
    const params = useParams<{ username: string }>();
    const [member, setMember] = useState<MemberFromMemberPov | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingMember, setLoadingMember] = useState<boolean>(true);
    const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const API = useAPI();

    useEffect(() => {
        if (params.username === undefined) return;

        API.Actions.Members.GetFromMemberPovByUsername({ username: params.username })
        .then((res) => {
            if (!res.found) return;

            setMember({ ...res.member });
            setLoadingPosts(true);

            API.Actions.Feed.GetFromAffiliateID({ affiliate_id: res.member.affiliate_id })
            .then((res1) => {
                if (!res1.found) return;

                setPosts(res1.posts);
            })
            .catch(() => {
                setError('An error occurred while fetching');
            });
        })
        .catch(() => {});
    }, []);

    useEffect(() => {
        const fakeLoading = setTimeout(() => {
            if (loadingPosts) setLoadingPosts(false);
            if (loadingMember) setLoadingMember(false);
        }, 500);

        return () => {
            clearTimeout(fakeLoading);
        };
    }, [loadingPosts]);

    if ((loadingMember || API.Value.fetching) && !loadingPosts) {
        return (
            <div
            className='grow shrink-0 basis-full h-full flex flex-col items-center justify-center'
            >
                <span className='text-2xl font-bold tracking-wide'>Looking for member</span>        
            </div>
        );
    }

    if (params.username === undefined || member === null)
        return (
            <NotFound />
        );

    const isStranger = member.username !== API.Value.member?.username;
    const hasClientSentRequest = member.follow_requested_by_consultant;
    const hasStrangerAcceptedClientRequest = member.follow_requested_by_consultant && member.is_consultant_allowed;
    
    return (
        <div
        className='grow shrink-0 basis-full h-full flex flex-col text-gray-800 max-w-xl pt-2'
        >
            <div
            className='flex flex-col gap-3 bg-blue-300 rounded p-4'
            >
                <div className='flex flex-row justify-between items-start'>
                    <div className='flex flex-col gap-0'>
                        <h1 className='text-4xl font-bold'>{member.fullname}</h1>
                        <h2 className='text-sm'>#{member.username}</h2>
                    </div>
                    {(isStranger && hasClientSentRequest && hasStrangerAcceptedClientRequest) &&
                        <button className='w-[10ch] font-semibold text-blue-900 border-2 border-current rounded-full px-2 py-1 cursor-pointer'>Unfollow</button>
                    }
                    {(isStranger && hasClientSentRequest && !hasStrangerAcceptedClientRequest) &&
                        <button className='w-[10ch] font-semibold text-blue-900 border-2 border-current rounded-full px-2 py-1 cursor-pointer'>Sent</button>
                    }
                    {(isStranger && !hasClientSentRequest) &&
                        <button className='w-[10ch] font-semibold text-blue-900 border-2 border-current rounded-full px-2 py-1 cursor-pointer'>Follow</button>
                    }
                </div>
                {member.bio !== null &&
                    <div className='flex flex-col gap-2 text-normal'>
                        {member.bio}
                    </div>
                }
                <div className='flex flex-row gap-2 text-sm'>
                    <span className='tracking-wider'>
                        <span className='font-bold tracking-normal'>{member.followers}</span> Followers
                    </span>
                    <span className='tracking-widest'>
                        <span className='font-bold tracking-normal'>{member.followees}</span> Following
                    </span>
                </div>
                <div className='flex flex-row justify-between text-sm'>
                    <div className='flex flex-row gap-2 items-center font-semibold'>
                        <Cake className='fill-current w-4 h-4' />
                        {member.birthdate === null ? '---' : member.birthdate.toDateString()}
                    </div>
                    <div className='flex flex-row gap-2 items-center font-semibold'>
                        <Calendar className='fill-current w-4 h-4' />
                        <div className='flex flex-row gap-1 items-center'>
                            <span className=''>{(new Date(member.created_at)).toLocaleDateString()}</span>
                            <span className='font-normal'>joined</span>
                        </div>
                    </div>
                </div>
            </div>
            <Feed posts={posts} setPosts={setPosts} loading={loadingPosts} error={error} />
        </div>
    );
};

export default MemberByID;
