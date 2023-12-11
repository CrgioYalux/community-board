import { Link, useNavigate } from 'react-router-dom';
import { useRef } from 'react';

import PasswordInput from '../../components/PasswordInput';
import Input from '../../components/Input';

import { useAPI } from '../../providers/API';

const Login: React.FC = () => {
    const API = useAPI();
    const navigate = useNavigate();
    const requestResponseSpanRef = useRef<HTMLSpanElement | null>(null);

    const handleSubmit = (event: React.SyntheticEvent): void => {
        event.preventDefault();

        if (API.Value.fetching) return;

        const body = event.target as HTMLFormElement & {
            usernameInput: HTMLInputElement;
            passwordInput: HTMLInputElement;
        };

        const payload = {
            username: body.usernameInput.value,
            password: body.passwordInput.value,
        };

        API.Actions.Auth.Login(payload)
        .then(() => {
            navigate('/home');
        })
        .catch(() => {
            if (requestResponseSpanRef.current) {
                requestResponseSpanRef.current.className = 'text-red-400 text-sm opacity-100 transition-opacity';
                requestResponseSpanRef.current.textContent = 'Wrong credentials';
            }
        })
        .finally(() => {
            setTimeout(() => {
                if (requestResponseSpanRef.current) {
                    requestResponseSpanRef.current.className = 'text-red-400 text-sm opacity-0 transition-opacity';
                    requestResponseSpanRef.current.textContent = 'Wrong credentials';
                }
            }, 1000);
        });
    };

    return (
        <div className='grow shrink-0 basis-full w-full flex flex-col items-center'>
            <h1 className='text-4xl font-semibold text-blue-900 dark:text-blue-200 mt-20'>Sign in</h1>
            <div className='text-blue-900 dark:text-blue-200 m-auto grow-0 shrink-0 basis-full flex flex-col gap-10'>
                <form className='flex-auto w-full flex flex-col gap-4 mt-auto text-xl' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-2 max-w-4xl'>
                        <Input id='usernameInput' name='usernameInput' required label='Username' />
                        <PasswordInput id='passwordInput' name='passwordInput' required label='Password' />
                    </div>
                    <div className='flex flex-row mr-auto items-center gap-2'>
                        <button className='border-2 border-current w-max px-4 py-0.5 rounded cursor-pointer' type='submit'>Join</button>
                        <span ref={requestResponseSpanRef}></span>
                    </div>
                </form>
                <div className='mt-auto flex flex-row gap-1'>
                    <span>Don't have an account?</span>
                    <Link to='/auth/register' className='font-bold'>Create one</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
