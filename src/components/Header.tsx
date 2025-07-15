interface HeaderProps {
	isLoggedIn: boolean;
	userBalance: number;
	onLogin: () => void;
	onLogout: () => void;
}

export default function Header({ isLoggedIn, userBalance, onLogin, onLogout }: HeaderProps) {
	return (
		<header className="bg-white shadow">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-6">
					<div className="flex items-center">
						<h1 className="text-3xl font-bold text-gray-900">
							🎯 Bumabet
						</h1>
						<span className="ml-3 text-sm text-gray-500">
							자격증 시험 배팅 플랫폼
						</span>
					</div>
					
					<div className="flex items-center space-x-4">
						{isLoggedIn ? (
							<>
								<div className="text-right">
									<div className="text-sm text-gray-500">잔고</div>
									<div className="text-lg font-semibold text-green-600">
										₩{userBalance.toLocaleString()}
									</div>
								</div>
								<button
									onClick={onLogout}
									className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
								>
									로그아웃
								</button>
							</>
						) : (
							<>
								<div className="text-sm text-gray-500">
									로그인하여 ₩1,000,000 받기!
								</div>
								<button
									onClick={onLogin}
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
								>
									구글 로그인
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}