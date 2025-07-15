import { useState, useEffect } from 'react';
import Header from './components/Header';
import PlayerList from './components/PlayerList';
import BettingForm from './components/BettingForm';
import BettingHistory from './components/BettingHistory';
import ErrorBoundary from './components/ErrorBoundary';
import { apiService, tokenManager } from './services/api';

function App() {
	const [activeTab, setActiveTab] = useState('players');
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userBalance, setUserBalance] = useState(0);
	const [userName, setUserName] = useState('');
	const [loading, setLoading] = useState(false);

	// 페이지 로드시 토큰 확인
	useEffect(() => {
		const token = tokenManager.getAccessToken();
		if (token) {
			// 토큰이 있으면 사용자 정보 가져오기
			fetchUserInfo();
		}
	}, []);

	const fetchUserInfo = async () => {
		try {
			console.log('사용자 정보 조회 시도...');
			const userInfo = await apiService.getUserInfo();
			console.log('사용자 정보:', userInfo);
			
			// 응답이 빈 객체인 경우 처리
			if (!userInfo || Object.keys(userInfo).length === 0) {
				console.error('사용자 정보가 비어있습니다.');
				tokenManager.clearTokens();
				setIsLoggedIn(false);
				setUserBalance(0);
				setUserName('');
				return;
			}
			
			setIsLoggedIn(true);
			setUserBalance(userInfo.balance || 0);
			setUserName(userInfo.name || '사용자');
		} catch (error) {
			console.error('사용자 정보 조회 실패:', error);
			// 토큰이 유효하지 않으면 로그아웃
			tokenManager.clearTokens();
			setIsLoggedIn(false);
			setUserBalance(0);
			setUserName('');
		}
	};

	const handleLogin = async () => {
		try {
			setLoading(true);
			const { url } = await apiService.getGoogleLoginUrl();
			// 새 창에서 구글 로그인 페이지 열기
			window.location.href = url;
		} catch (error) {
			console.error('로그인 URL 가져오기 실패:', error);
			alert('로그인 처리 중 오류가 발생했습니다.');
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			setLoading(true);
			await apiService.logout();
			setIsLoggedIn(false);
			setUserBalance(0);
			setUserName('');
		} catch (error) {
			console.error('로그아웃 실패:', error);
			// 에러가 발생해도 로컬에서는 로그아웃 처리
			tokenManager.clearTokens();
			setIsLoggedIn(false);
			setUserBalance(0);
			setUserName('');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header 
				isLoggedIn={isLoggedIn}
				userBalance={userBalance}
				userName={userName}
				onLogin={handleLogin}
				onLogout={handleLogout}
				loading={loading}
			/>
			
			<nav className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex space-x-8">
						{['players', 'betting', 'history'].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`py-4 px-2 border-b-2 font-medium text-sm ${
									activeTab === tab
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								{tab === 'players' && '플레이어'}
								{tab === 'betting' && '배팅하기'}
								{tab === 'history' && '배팅 내역'}
							</button>
						))}
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<ErrorBoundary>
						{activeTab === 'players' && <PlayerList />}
						{activeTab === 'betting' && <BettingForm isLoggedIn={isLoggedIn} userBalance={userBalance} onBalanceUpdate={setUserBalance} />}
						{activeTab === 'history' && <BettingHistory />}
					</ErrorBoundary>
				</div>
			</main>
		</div>
	);
}

export default App;
