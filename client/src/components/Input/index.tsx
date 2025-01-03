type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
};

const Input: React.FC<InputProps> = ({
	label = 'Password',
	className = '',
	...inputProps
}) => {
	return (
		<label
			className="flex flex-row items-center gap-4 w-96"
			htmlFor={inputProps.id}
		>
			<span className="grow-0 shrink-0 w-[8ch]">{label}</span>
			<div className="grow shrink basis-full flex flex-row gap-2 ml-auto">
				<input
					className={`${className ?? ''} flex-none basis-full rounded bg-blue-900 dark:bg-blue-200 text-blue-200 dark:text-blue-900 p-1`}
					{...inputProps}
				/>
			</div>
		</label>
	);
};

export default Input;
