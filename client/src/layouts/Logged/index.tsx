import Divider from "../components/Divider";
import SidePanel from "../components/SidePanel";

const LoggedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className='grow shrink-0 basis-full h-full flex flex-row'>
            <SidePanel />
            <Divider className='grow-0 shrink-0 basis-1 mx-2' />
            <div className='flex-auto flex text-blue-900 dark:text-blue-200'>
                {children}
            </div>
        </div>
    );
};

export default LoggedLayout;
