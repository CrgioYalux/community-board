import { useState } from "react";

import OpenEye from "../Icons/OpenEye";
import ClosedEye from "../Icons/ClosedEye";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string,
};

const PasswordInput: React.FC<PasswordInputProps> = ({
    label = 'Password',
    className = '',
    ...inputProps
}) => {
    const [inputType, setInputType] = useState<'text' | 'password'>('password');

    const switchInputType = (): void => {
        setInputType((prev) => prev === 'text' ? 'password' : 'text');
    };

    return (
        <label className='flex flex-row items-center gap-4 w-96' htmlFor={inputProps.id}>
            <span className='grow-0 shrink-0 w-[8ch]'>{label}</span>
            <div className='grow shrink basis-full flex flex-row gap-2 ml-auto'>
                <input className={`${className ?? ''} flex-none basis-full rounded bg-blue-900 dark:bg-blue-200 text-blue-200 dark:text-blue-900 p-1`} type={inputType} {...inputProps} /> 
                <button className='grow-0 shrink-0 basis-8 grid place-items-center text-blue-900 dark:text-blue-200 fill-current' type='button' onClick={switchInputType}>{inputType === 'password' ? <OpenEye /> : <ClosedEye />}</button>
            </div>
        </label>
    );
};

export default PasswordInput;

