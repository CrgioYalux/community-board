import type { MemberFromMemberPov } from '../../providers/API/types';

import { useState } from 'react';
import { useAPI } from '../../providers/API';

import Cake from '../../components/Icons/Cake';
import Calendar from '../../components/Icons/Calendar';
import Lock from '../../components/Icons/Lock';
import Accept from '../Icons/Accept';
import Decline from '../Icons/Decline';

type MemberToEdit = Pick<
	MemberFromMemberPov,
	'fullname' | 'bio' | 'is_private'
>;
interface EditProfileProps {
	member: MemberFromMemberPov;
	onDecline?: () => void;
	onAccept?: () => void;
	onEither?: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({
	member,
	onDecline = () => {},
	onAccept = () => {},
	onEither = () => {},
}) => {
	const [memberToEdit, setMemberToEdit] = useState<MemberToEdit>({
		...member,
	});
	const [birthdate, setBirthdate] = useState<string>('');
	const API = useAPI();

	const handleAccept = (): void => {
		API.Actions.Members.Edit({ ...memberToEdit, birthdate })
			.then((res) => {
				if (!res.done) return;
				if (onAccept) onAccept();
				if (onEither) onEither();
			})
			.catch(console.error);
	};

	const handleDecline = (): void => {
		if (onDecline) onDecline();
		if (onEither) onEither();
	};

	return (
		<div className="flex flex-col gap-3 bg-blue-300 rounded p-4 text-gray-800">
			<div className="flex flex-row justify-between items-start">
				<div className="flex flex-col gap-2">
					<input
						className="bg-gray-500 rounded p-1 text-white"
						value={memberToEdit.fullname}
						onChange={(e) =>
							setMemberToEdit((prev) => ({
								...prev,
								fullname: e.target.value,
							}))
						}
						type="text"
					/>
					<h2 className="text-lg font-semibold">
						#{member.username}
					</h2>
				</div>
				<div className="flex flex-row gap-2 items-center text-blue-900 fill-current font-semibold">
					<input
						className="bg-gray-400 rounded p-1"
						checked={memberToEdit.is_private}
						onChange={() =>
							setMemberToEdit((prev) => ({
								...prev,
								is_private: !prev.is_private,
							}))
						}
						type="checkbox"
					/>
					<Lock />
				</div>
			</div>
			<div className="flex flex-col gap-2 text-normal">
				<textarea
					className="bg-gray-500 rounded p-1 resize-none text-white"
					value={memberToEdit.bio}
					onChange={(e) =>
						setMemberToEdit((prev) => ({
							...prev,
							bio: e.target.value,
						}))
					}
				/>
			</div>
			<div className="flex flex-row gap-2 text-sm">
				<span className="tracking-wider">
					<span className="font-bold tracking-normal">
						{member.followers}
					</span>{' '}
					Followers
				</span>
				<span className="tracking-widest">
					<span className="font-bold tracking-normal">
						{member.followees}
					</span>{' '}
					Following
				</span>
			</div>
			<div className="flex flex-row justify-between text-sm">
				<div className="flex flex-row gap-2 items-center font-semibold">
					<Cake className="fill-current w-4 h-4" />
					<input
						className="bg-gray-500 rounded p-1 text-white"
						value={birthdate}
						onChange={(e) => {
							setBirthdate(e.target.value);
						}}
						type="date"
					/>
				</div>
				<div className="flex flex-row gap-2 items-center font-semibold">
					<Calendar className="fill-current w-4 h-4" />
					<div className="flex flex-row gap-1 items-center">
						<span className="">
							{new Date(member.created_at).toLocaleDateString()}
						</span>
						<span className="font-normal">joined</span>
					</div>
				</div>
			</div>
			<div className="flex flex-row items-center gap-2 mt-2 ml-auto">
				<span className="text-xl">Confirm?</span>
				<div className="flex flex-row gap-2 fill-current items-center">
					<button
						className="h-4 w-4 border-2 border-current rounded-full p-1 box-content grid place-items-center"
						onClick={handleAccept}
					>
						<Accept />
					</button>
					<button
						className="h-4 w-4 border-2 border-current rounded-full p-1 box-content grid place-items-center"
						onClick={handleDecline}
					>
						<Decline />
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditProfile;
