import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
    return (
        <div className='flex-auto h-[calc(100vh-2.75rem)] flex flex-col items-center justify-center text-current'>
            <h1 className='text-9xl font-extrabold'>404</h1>
            <div className='flex flex-row gap-2 items-center text-base'>
                <span className='font-semibold tracking-wide'>Page Not Found</span>
                <span className='text-lg font-extrabold rotate-90 tracking-tighter'>:(</span>
            </div>
            <Link to='/home' className='mt-10 font-semibold underline'>go home</Link>
        </div>
    );
};

export default NotFound;
