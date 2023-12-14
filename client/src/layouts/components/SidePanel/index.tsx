import { Fragment } from 'react';
import { useAPI } from "../../../providers/API";
import { useLocation, Link } from 'react-router-dom';

import Divider from "../Divider";
import ThemeSwitch from "../ThemeSwitch";
import LockIcon from '../../../components/Icons/Lock';

const pages = [
    { title: 'home', to: '/home' },
    { title: 'saved', to: '/saved' },
    { title: 'requests', to: '/followers/requests' }
];

const SidePanel: React.FC<{ className?: string }> = ({ className = '' }) => {
    const API = useAPI();
    const location = useLocation();

    const isInPage = (page: string) => location.pathname.split('/').includes(page);

    return (
        <div className={`min-h-full flex flex-col ${className}`}>
            <ul className='my-auto flex flex-col text-4xl text-blue-900 dark:text-blue-200'>
                {pages.map((page, i) => (
                    <Fragment key={i}>
                        <Link 
                        className={`w-full py-2 pl-4 hover:cursor-pointer ${isInPage(page.title) ? 'bg-blue-600 text-blue-200 dark:text-blue-900' : 'hover:bg-blue-400/[.50] dark:hover:bg-blue-700/[.50]'}`}
                        to={page.to}
                        >
                            <span className='w-[6ch]'>{page.title}</span>
                        </Link>
                        <Divider className='w-full h-1' />
                    </Fragment>
                ))}
            </ul>  
            <div className='w-full p-2 pr-0'>
                <div className='w-full h-full flex flex-col gap-2 bg-blue-900 dark:bg-blue-200 rounded'>
                    <div className='flex flex-row text-blue-200 dark:text-blue-900 p-2'>
                        <div className='flex flex-col font-semibold'>
                            <span className='text-xl w-[16ch] truncate'>{API.Value.member?.fullname}</span>
                            <Link to={`/members/${API.Value.member?.username}`} className='text-sm w-[14ch] truncate hover:underline cursor-pointer'>
                                <span>#{API.Value.member?.username}</span>
                            </Link>
                        </div>
                        <span className='text-blue-200 text-blue-200 dark:text-blue-900 fill-current grid place-items-center h-8 w-8 ml-auto p-2'>
                        {API.Value.member?.is_private ? <LockIcon /> : ''}
                        </span>
                    </div>

                    <div className='flex flex-row gap-2 text-sm text-blue-200 dark:text-blue-900 px-2'>
                        <span className='tracking-wider'>
                            <Link to={`/affiliates/${API.Value.member?.affiliate_id}/followers`} className='hover:underline'>
                                <span className='font-bold tracking-normal'>{API.Value.member?.followers}</span> Followers
                            </Link>
                        </span>
                        <span className='tracking-widest'>
                            <Link to={`/affiliates/${API.Value.member?.affiliate_id}/followees`} className='hover:underline'>
                                <span className='font-bold tracking-normal'>{API.Value.member?.followees}</span> Following
                            </Link>
                        </span>
                    </div>
                    <div className='flex flex-row items-center mt-auto'>
                        <ThemeSwitch className='text-blue-200 dark:text-blue-900 fill-current w-8 h-6 border-2 border-current rounded-full flex flex-row items-center justify-center mr-auto ml-1' />
                        <button 
                        className='bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 font-semibold px-2 py-1 rounded-xl rounded-r-none rounded-b-none ml-auto'
                        onClick={API.Actions.Auth.Logout}
                        >Log out</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidePanel;
