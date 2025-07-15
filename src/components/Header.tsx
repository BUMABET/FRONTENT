interface HeaderProps {
	isLoggedIn: boolean;
	userBalance: number;
	userName?: string;
	onLogin: () => void;
	onLogout: () => void;
	loading?: boolean;
}

export default function Header({ isLoggedIn, userBalance, userName, onLogin, onLogout, loading = false }: HeaderProps) {
	return (
		<header className="bg-white shadow">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-6">
					<div className="flex items-center">
						<h1 className="text-3xl font-bold text-gray-900">🎯 Bumabet</h1>
						<span className="ml-3 text-sm text-gray-500">정보처리산업기사 배팅 플랫폼 made by 이재환 with 박동현</span>
					</div>

					<div className="flex items-center space-x-4">
						{isLoggedIn ? (
							<>
								<div className="text-right">
									<div className="text-sm text-gray-500">안녕하세요, {userName || '사용자'}님</div>
									<div className="text-lg font-semibold text-green-600">₩{(userBalance || 0).toLocaleString()}</div>
								</div>
								<button
									onClick={onLogout}
									disabled={loading}
									className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium">
									{loading ? '로그아웃 중...' : '로그아웃'}
								</button>
							</>
						) : (
							<>
								<div className="text-sm text-gray-500">로그인하여 ₩1,000,000 받기!</div>
								<button
									onClick={onLogin}
									disabled={loading}
									className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium">
									{loading ? '로그인 중...' : '구글 로그인'}
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
