import Divider from "../components/Divider";

const SkeletonLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className='min-h-screen flex-auto flex flex-col bg-blue-200 dark:bg-blue-900'>
            <div className='grow-0 shrink-0 basis-10 w-full flex flex-row items-center px-4'>
                <h1 className='text-2xl font-semibold text-blue-900 dark:text-blue-200'>Community Board</h1>
            </div>
            <Divider className='grow-0 shrink-0 basis-1' />
            {children}
        </div>
    );
};

export default SkeletonLayout;
