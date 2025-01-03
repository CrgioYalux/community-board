import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAPI } from '../../providers/API';

import SkeletonLayout from '../../layouts/Skeleton';
import LoggedLayout from '../../layouts/Logged';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import Home from '../../pages/Home';
import Saved from '../../pages/Saved';
import MemberByUsername from '../../pages/MemberByUsername';
import NotFound from '../../pages/NotFound';
import FollowRequests from '../../pages/FollowRequests';
import AffiliateFollowers from '../../pages/AffiliateFollowers';
import AffiliateFollowees from '../../pages/AffiliateFollowees';

const BusinessRouter: React.FC = () => {
	const API = useAPI();
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (API.Value.tryingReauth) return;
		if (loading) return;

		setLoading(true);

		const credibleTimeout = setTimeout(() => {
			setLoading(false);
		}, 500);

		return () => {
			clearTimeout(credibleTimeout);
		};
	}, []);

	if (loading || API.Value.tryingReauth)
		return (
			<SkeletonLayout>
				<div className="flex-auto basis-full grid place-items-center">
					<h1 className="text-4xl text-blue-900 dark:text-blue-200 font-semibold">
						Authenticating...
					</h1>
				</div>
			</SkeletonLayout>
		);

	return (
		<Routes>
			{/*<Route path='/' element={API.Value.logged ? <Navigate to='/home' /> : <Navigate to='auth' />} />*/}
			<Route
				path="/"
				element={
					<SkeletonLayout>
						<Outlet />
					</SkeletonLayout>
				}
			>
				<Route
					index
					element={
						API.Value.logged ? (
							<Navigate to="/home" />
						) : (
							<Navigate to="auth" />
						)
					}
				/>
				<Route
					element={
						API.Value.logged ? (
							<LoggedLayout>
								<Outlet />
							</LoggedLayout>
						) : (
							<Navigate to="auth" />
						)
					}
				>
					<Route path="home">
						<Route index element={<Home />} />
					</Route>
					<Route path="saved">
						<Route index element={<Saved />} />
					</Route>
					<Route
						path="members/:username"
						element={<MemberByUsername />}
					/>
					<Route path="affiliates/:affiliate_id">
						<Route
							path="followers"
							element={<AffiliateFollowers />}
						/>
						<Route
							path="followees"
							element={<AffiliateFollowees />}
						/>
					</Route>
					<Route path="followers">
						<Route index element={<>List followers</>} />
						<Route path="requests" element={<FollowRequests />} />
					</Route>
				</Route>
				<Route
					path="auth"
					element={
						API.Value.logged ? <Navigate to="/" /> : <Outlet />
					}
				>
					<Route index element={<Navigate to="/auth/login" />} />
					<Route path="login" element={<Login />} />
					<Route path="register" element={<Register />} />
				</Route>
				<Route path="*" element={<NotFound />} />
			</Route>
		</Routes>
	);
};

export default BusinessRouter;
