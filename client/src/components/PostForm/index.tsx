import { useAPI } from '../../providers/API';
import { useState } from 'react';

interface PostFormProps {
	onPublish: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPublish }) => {
	const API = useAPI();
	const [body, setBody] = useState<string>('');

	const isDisabled = body.length === 0 || body.length > 255;

	const handleSubmit = (event: React.SyntheticEvent): void => {
		event.preventDefault();

		if (isDisabled) return;

		API.Actions.Posts.Create({ body })
			.then((res) => {
				if (!res.created) return;

				setBody('');
				onPublish();
			})
			.catch(() => {});
	};
	return (
		<form
			className="bg-gray-500/[.75] text-white rounded flex flex-col gap-4 p-2"
			onSubmit={handleSubmit}
		>
			<div className="flex flex-row gap-2 items-center">
				<span className="text-xl font-bold">
					{API.Value.member?.fullname}
				</span>
				<span className="text-xs bg-gray-700 rounded-full px-2 py-1">
					#{API.Value.member?.username}
				</span>
			</div>
			<textarea
				className="flex basis-24 overflow-y-auto overflow-x-hidden bg-gray-700 resize-none rounded p-1.5"
				placeholder={"What's going on?"}
				value={body}
				onChange={(e) => setBody(e.target.value)}
			/>
			<div className="flex flex-row justify-between">
				<span
					className={`${isDisabled ? 'text-red-400' : 'text-current'} w-[8ch] font-semibold bg-gray-700 rounded-full px-2 grid place-items-center`}
				>
					{body.length}/255
				</span>
				<button
					className="w-[10ch] font-semibold disabled:bg-blue-400 bg-blue-600 disabled:cursor-default cursor-pointer text-current rounded-full px-2 py-1"
					disabled={isDisabled}
					type="submit"
				>
					Publish
				</button>
			</div>
		</form>
	);
};

export default PostForm;
