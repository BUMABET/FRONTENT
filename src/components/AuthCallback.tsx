import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenManager } from '../services/api';

export default function AuthCallback() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	useEffect(() => {
		const accessToken = searchParams.get('accessToken');
		const refreshToken = searchParams.get('refreshToken');
		const error = searchParams.get('error');

		if (error) {
			console.error('로그인 에러:', error);
			alert('로그인 중 오류가 발생했습니다.');
			navigate('/');
			return;
		}

		if (accessToken && refreshToken) {
			tokenManager.setTokens(accessToken, refreshToken);
			navigate('/');
		} else {
			console.error('토큰이 없습니다.');
			alert('로그인 처리 중 오류가 발생했습니다.');
			navigate('/');
		}
	}, [searchParams, navigate]);

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
				<p className="mt-4 text-gray-600">로그인 처리 중...</p>
			</div>
		</div>
	);
}