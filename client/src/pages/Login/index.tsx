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
					requestResponseSpanRef.current.className =
						'text-red-400 text-sm opacity-100 transition-opacity';
					requestResponseSpanRef.current.textContent =
						'Wrong credentials';
				}
			})
			.finally(() => {
				setTimeout(() => {
					if (requestResponseSpanRef.current) {
						requestResponseSpanRef.current.className =
							'text-red-400 text-sm opacity-0 transition-opacity';
						requestResponseSpanRef.current.textContent =
							'Wrong credentials';
					}
				}, 1000);
			});
	};

	return (
		<div className="flex-auto h-[calc(100vh-2.75rem)] grid place-items-center text-current">
			<div className="flex flex-col gap-12">
				<h1 className="flex-none basis-12 text-4xl font-semibold text-center">
					Sign in
				</h1>
				<div className="flex-auto flex flex-col gap-10">
					<form
						className="flex-auto w-full flex flex-col gap-8 text-xl"
						onSubmit={handleSubmit}
					>
						<div className="flex flex-col gap-2 max-w-4xl">
							<Input
								id="usernameInput"
								name="usernameInput"
								required
								label="Username"
							/>
							<PasswordInput
								id="passwordInput"
								name="passwordInput"
								required
								label="Password"
							/>
						</div>
						<div className="flex flex-row items-center gap-2">
							<button
								className="border-2 border-current w-max px-2 py-0.5 rounded cursor-pointer"
								type="submit"
							>
								Join
							</button>
							<span ref={requestResponseSpanRef}></span>
						</div>
					</form>
					<div className="flex flex-row gap-1 justify-center">
						<span>Don't have an account?</span>
						<Link to="/auth/register" className="font-bold">
							Create one
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
