import type { MemberFromMemberPov, Post } from "../../providers/API/types";

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAPI } from "../../providers/API";

import NotFound from "../NotFound";
import Cake from "../../components/Icons/Cake";
import Calendar from "../../components/Icons/Calendar";
import Feed from "../../components/Feed";
import Divider from "../../layouts/components/Divider";
import Lock from '../../components/Icons/Lock';

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
    const hasStrangerAcceptedClientRequest = hasClientSentRequest && member.is_consultant_allowed;
    const unfollowButtonVisible = (isStranger && hasClientSentRequest && hasStrangerAcceptedClientRequest);
    const sentButtonVisible = (isStranger && hasClientSentRequest && !hasStrangerAcceptedClientRequest);
    const followButtonVisible = (isStranger && !hasClientSentRequest);

    const handleUnfollow = (): void => {
        API.Actions.Affiliates.Unfollow({ affiliate_id: member.affiliate_id })
        .then((res) => {
            if (!res.done) return;

            setMember((prev) => {
                if (prev === null) return null;

                return {
                    ...prev,
                    followers: prev.followers === 0 ? 0 : prev.followers - 1,
                    follow_requested_by_consultant: false,
                    is_consultant_allowed: member.is_private ? false : true,
                };
            });
        })
        .catch(console.error);
    };

    const handleFollow = (): void => {
        API.Actions.Affiliates.Follow({ affiliate_id: member.affiliate_id })
        .then((res) => {
            if (!res.done) return;

            setMember((prev) => {
                if (prev === null) return null;

                return {
                    ...prev,
                    followers: member.is_private ? prev.followers : prev.followers + 1,
                    follow_requested_by_consultant: true,
                    is_consultant_allowed: member.is_private ? false : true,
                };
            });
        })
        .catch(console.error);
    };
    
    return (
        <div className='flex-auto flex flex-col gap-2 h-[calc(100vh-2.75rem)] max-w-2xl overflow-y-auto p-2 pb-4'>
            <div
            className='flex flex-col gap-3 bg-blue-300 rounded p-4 text-gray-800'
            >
                <div className='flex flex-row justify-between items-start'>
                    <div className='flex flex-col gap-0'>
                        <h1 className='text-2xl font-bold'>{member.fullname ?? 'Sergio Yalux'}</h1>
                        <h2 className='text-sm'>#{member.username}</h2>
                    </div>
                    <div className='flex flex-row gap-2 items-center text-blue-900 fill-current font-semibold'>
                        {member.is_private ? <Lock /> : ''}
                        {unfollowButtonVisible 
                            ? <button 
                            className='w-[10ch] border-2 border-current rounded-full px-2 py-1 cursor-pointer'
                            onClick={handleUnfollow}
                            >Unfollow</button>
                        : sentButtonVisible
                            ? <button 
                            className='w-[10ch] border-2 border-current rounded-full px-2 py-1 cursor-pointer'
                            onClick={handleUnfollow}
                            >Sent</button>
                        : followButtonVisible
                            ? <button 
                            className='w-[10ch] border-2 border-current rounded-full px-2 py-1 cursor-pointer'
                            onClick={handleFollow}
                            >Follow</button>
                        : ''}
                    </div>
                </div>
                {member.bio !== null &&
                    <div className='flex flex-col gap-2 text-normal'>
                        {member.bio}
                    </div>
                }
                <div className='flex flex-row gap-2 text-sm'>
                    <span className='tracking-wider'>
                        <Link to={`/affiliates/${member.affiliate_id}/followers`} className='hover:underline'>
                            <span className='font-bold tracking-normal'>{member.followers}</span> Followers
                        </Link>
                    </span>
                    <span className='tracking-widest'>
                        <Link to={`/affiliates/${member.affiliate_id}/followees`} className='hover:underline'>
                            <span className='font-bold tracking-normal'>{member.followees}</span> Following
                        </Link>
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

            <Feed 
            posts={posts}
            setPosts={setPosts}
            loading={API.Value.fetching || loadingPosts}
            error={error}
            />
            <div className='flex-initial flex flex-row gap-1 items-center'>
                <Divider className='h-1 flex-auto' />
                <span className='text-2xl text-current'>End of timeline</span>
                <Divider className='h-1 flex-auto' />
            </div>
        </div>
    );
};

export default MemberByID;
