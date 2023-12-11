import Divider from "../components/Divider";
import SidePanel from "../components/SidePanel";

const LoggedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className='grow shrink-0 basis-full flex flex-row'>
            <SidePanel />
            <Divider className='grow-0 shrink-0 basis-1 mx-2' />
            {children}
        </div>
    );
};

export default LoggedLayout;
