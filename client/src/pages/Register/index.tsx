import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useAPI } from '../../providers/API';

import PasswordInput from '../../components/PasswordInput';
import Input from '../../components/Input';

const Register: React.FC = () => {
	const API = useAPI();
	const requestResponseSpanRef = useRef<HTMLSpanElement | null>(null);
	const navigate = useNavigate();
	const [loading, setLoading] = useState<boolean>(false);

	const handleSubmit = (event: React.SyntheticEvent): void => {
		event.preventDefault();

		if (loading) return;
		setLoading(true);

		const body = event.target as HTMLFormElement & {
			usernameInput: HTMLInputElement;
			passwordInput: HTMLInputElement;
			fullnameInput: HTMLInputElement;
			emailInput: HTMLInputElement;
		};

		const payload = {
			username: body.usernameInput.value,
			password: body.passwordInput.value,
			fullname: body.fullnameInput.value,
			email: body.emailInput.value,
		};

		API.Actions.Auth.Register(payload)
			.then(() => {
				API.Actions.Auth.Login({
					username: payload.username,
					password: payload.password,
				}).finally(() => {
					setLoading(false);
					navigate('/home');
				});
			})
			.catch(() => {
				if (requestResponseSpanRef.current) {
					requestResponseSpanRef.current.className =
						'text-red-400 text-sm opacity-100 transition-opacity';
					requestResponseSpanRef.current.textContent =
						'Username already in use';
				}

				setLoading(false);
			})
			.finally(() => {
				setTimeout(() => {
					if (requestResponseSpanRef.current) {
						requestResponseSpanRef.current.className =
							'text-red-400 text-sm opacity-0 transition-opacity';
						requestResponseSpanRef.current.textContent =
							'Username already in use';
					}
				}, 1000);
			});
	};

	return (
		<div className="flex-auto h-[calc(100vh-2.75rem)] grid place-items-center text-current">
			<div className="flex flex-col gap-12">
				<h1 className="flex-none basis-12 text-4xl font-semibold text-center">
					Sign up
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
							<Input
								id="fullnameInput"
								name="fullnameInput"
								required
								label="Fullname"
							/>
							<Input
								id="emailInput"
								name="emailInput"
								type="email"
								required
								label="Email"
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
								Register
							</button>
							<span ref={requestResponseSpanRef}></span>
						</div>
					</form>
					<div className="flex flex-row gap-1 justify-center">
						<span>Already have an account?</span>
						<Link to="/auth/login" className="font-bold">
							Join
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;
