import Divider from "../components/Divider";
import SidePanel from "../components/SidePanel";

const LoggedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className='relative grow shrink-0 basis-full flex flex-col pl-80'>
            <div className='fixed top-0 left-0 bottom-0 flex flex-row gap-2 mr-2 w-80'>
                <SidePanel className='flex-auto' />
                <Divider className='flex-none basis-1' />
            </div>
            <div className='grow shrink-0 basis-full'>
                {children}
            </div>
        </div>
    );
};

export default LoggedLayout;
