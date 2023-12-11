import Divider from "../Divider";
import ThemeSwitch from "../ThemeSwitch";
import LockIcon from '../../../components/Icons/Lock';
import { useAPI } from "../../../providers/API";

const SidePanel: React.FC = () => {
    const API = useAPI();

    return (
        <div className='grow-0 shrink-0 basis-1/5 min-h-full flex flex-col'>
            <ul className='my-auto flex flex-col text-4xl text-blue-900 dark:text-blue-200'>
                <li className='w-full py-2 pl-4 hover:cursor-pointer hover:bg-blue-100/[.75] dark:hover:bg-blue-800/[.75]'>
                    <span className='w-[6ch]'>home</span>
                </li>
                <Divider className='w-full h-1' />
                <li className='w-full py-2 pl-4 hover:cursor-pointer hover:bg-blue-100/[.75] dark:hover:bg-blue-800/[.75]'>
                    <span className='w-[6ch]'>saved</span>
                </li>
                <Divider className='w-full h-1' />
                <li className='w-full py-2 pl-4 hover:cursor-pointer hover:bg-blue-100/[.75] dark:hover:bg-blue-800/[.75]'>
                    <span className='w-[6ch]'>boards</span>
                </li>
                <Divider className='w-full h-1' />
            </ul>  
            <div className='w-full h-1/5 p-2 pr-0'>
                <div className='w-full h-full flex flex-col bg-blue-900 dark:bg-blue-200 rounded'>
                    <div className='flex flex-row text-blue-200 dark:text-blue-900 p-2'>
                        <div className='flex flex-col font-semibold'>
                            <span className='text-xl w-[16ch] truncate'>John Locke</span>
                            <span className='text-sm w-[14ch] truncate'>#john_locke</span>
                        </div>
                        <span className='text-blue-200 text-blue-200 dark:text-blue-900 fill-current grid place-items-center h-8 w-8 ml-auto p-2'>
                            <LockIcon />
                        </span>
                    </div>
                    <div className='flex flex-row gap-2 text-sm text-blue-200 dark:text-blue-900 px-2'>
                        <span className='tracking-wider'>
                            <span className='font-bold tracking-normal'>1K</span> Followers
                        </span>
                        <span className='tracking-widest'>
                            <span className='font-bold tracking-normal'>500</span> Following
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
