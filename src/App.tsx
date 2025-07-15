import { useState } from 'react';
import Header from './components/Header';
import PlayerList from './components/PlayerList';
import BettingForm from './components/BettingForm';
import BettingHistory from './components/BettingHistory';
import AdminDashboard from './components/AdminDashboard';

function App() {
	const [activeTab, setActiveTab] = useState('players');
	// DEV 모드에서는 기본적으로 로그인 상태로 시작
	const isDev = import.meta.env.DEV || import.meta.env.VITE_DEV === '1';
	const [isLoggedIn, setIsLoggedIn] = useState(isDev);
	const [userBalance, setUserBalance] = useState(isDev ? 1000000 : 0);

	const handleLogin = () => {
		setIsLoggedIn(true);
		setUserBalance(1000000);
	};

	const handleLogout = () => {
		setIsLoggedIn(false);
		setUserBalance(0);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header 
				isLoggedIn={isLoggedIn}
				userBalance={userBalance}
				onLogin={handleLogin}
				onLogout={handleLogout}
			/>
			
			<nav className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex space-x-8">
						{['players', 'betting', 'history', 'admin'].map((tab) => (
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
								{tab === 'admin' && '관리자'}
							</button>
						))}
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					{activeTab === 'players' && <PlayerList />}
					{activeTab === 'betting' && <BettingForm isLoggedIn={isLoggedIn} userBalance={userBalance} />}
					{activeTab === 'history' && <BettingHistory />}
					{activeTab === 'admin' && <AdminDashboard />}
				</div>
			</main>
		</div>
	);
}

export default App;
