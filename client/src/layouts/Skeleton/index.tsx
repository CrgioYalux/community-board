import Divider from "../components/Divider";

const SkeletonLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className='min-h-screen flex-auto flex flex-col bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200'>
            <div className='flex-none basis-10 w-80 flex flex-row items-center justify-center'>
                <h1 className='text-2xl font-bold text-current'>Community Board</h1>
            </div>
            <Divider className='flex-none basis-1' />
            <div className='flex-auto'>
                {children}
            </div>
        </div>
    );
};

export default SkeletonLayout;
