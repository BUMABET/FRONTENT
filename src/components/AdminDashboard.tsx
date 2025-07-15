import { useState, useEffect } from 'react';

interface DashboardStats {
	totalUsers: number;
	totalBets: number;
	totalBetAmount: number;
	activeBets: number;
	completedBets: number;
	platformRevenue: number;
}

interface UserActivity {
	userId: string;
	userName: string;
	email: string;
	totalBets: number;
	totalAmount: number;
	winRate: number;
	lastActivity: string;
}


export default function AdminDashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
	const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// 더미 관리자 데이터
		setTimeout(() => {
			setStats({
				totalUsers: 245,
				totalBets: 1823,
				totalBetAmount: 45670000,
				activeBets: 342,
				completedBets: 1481,
				platformRevenue: 0 // 0% 마진이므로 수익 없음
			});

			setUserActivities([
				{
					userId: '1',
					userName: '김철수',
					email: 'chulsoo@email.com',
					totalBets: 15,
					totalAmount: 750000,
					winRate: 66.7,
					lastActivity: '2024-08-01 14:30'
				},
				{
					userId: '2',
					userName: '이영희',
					email: 'younghee@email.com',
					totalBets: 23,
					totalAmount: 1200000,
					winRate: 78.3,
					lastActivity: '2024-08-01 11:15'
				},
				{
					userId: '3',
					userName: '박민수',
					email: 'minsu@email.com',
					totalBets: 8,
					totalAmount: 400000,
					winRate: 62.5,
					lastActivity: '2024-07-31 16:45'
				}
			]);


			setLoading(false);
		}, 1000);
	}, []);


	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">관리자 대시보드</h2>
				<p className="text-gray-600">
					플랫폼 전체 현황을 모니터링할 수 있습니다.
				</p>
			</div>

			{/* 탭 네비게이션 */}
			<div className="mb-6">
				<div className="flex space-x-4">
					{[
						{ key: 'overview', label: '전체 현황' },
						{ key: 'users', label: '사용자 활동' }
					].map(({ key, label }) => (
						<button
							key={key}
							onClick={() => setActiveTab(key as 'overview' | 'users')}
							className={`px-4 py-2 rounded-lg font-medium ${
								activeTab === key
									? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
									: 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
							}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{/* 전체 현황 */}
			{activeTab === 'overview' && stats && (
				<div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
						<div className="bg-white rounded-lg shadow p-4">
							<div className="text-sm text-gray-600">총 사용자</div>
							<div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
						</div>
						<div className="bg-white rounded-lg shadow p-4">
							<div className="text-sm text-gray-600">총 배팅 수</div>
							<div className="text-2xl font-bold text-purple-600">{stats.totalBets}</div>
						</div>
						<div className="bg-white rounded-lg shadow p-4">
							<div className="text-sm text-gray-600">총 배팅액</div>
							<div className="text-xl font-bold text-green-600">
								₩{(stats.totalBetAmount / 1000000).toFixed(1)}M
							</div>
						</div>
						<div className="bg-white rounded-lg shadow p-4">
							<div className="text-sm text-gray-600">진행중 배팅</div>
							<div className="text-2xl font-bold text-orange-600">{stats.activeBets}</div>
						</div>
						<div className="bg-white rounded-lg shadow p-4">
							<div className="text-sm text-gray-600">완료 배팅</div>
							<div className="text-2xl font-bold text-gray-600">{stats.completedBets}</div>
						</div>
						<div className="bg-white rounded-lg shadow p-4">
							<div className="text-sm text-gray-600">플랫폼 수익</div>
							<div className="text-2xl font-bold text-red-600">₩0</div>
							<div className="text-xs text-gray-500">0% 마진</div>
						</div>
					</div>

					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<div className="flex items-start">
							<div className="text-yellow-600 mr-3">ℹ️</div>
							<div>
								<h3 className="font-medium text-yellow-800">공정 배당 시스템</h3>
								<p className="text-yellow-700 text-sm mt-1">
									Bumabet은 0% 마진으로 운영되어 플랫폼이 수익을 취하지 않습니다. 
									모든 배당은 베팅액 비율에 따라 공정하게 계산됩니다.
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 사용자 활동 */}
			{activeTab === 'users' && (
				<div>
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200">
							<h3 className="text-lg font-medium text-gray-900">활성 사용자</h3>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											사용자
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											배팅 수
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											총 배팅액
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											승률
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											마지막 활동
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{userActivities.map((user) => (
										<tr key={user.userId}>
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">{user.userName}</div>
													<div className="text-sm text-gray-500">{user.email}</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{user.totalBets}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												₩{user.totalAmount.toLocaleString()}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`px-2 py-1 text-xs font-semibold rounded-full ${
													user.winRate >= 70 ? 'bg-green-100 text-green-800' :
													user.winRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
													'bg-red-100 text-red-800'
												}`}>
													{user.winRate}%
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{user.lastActivity}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

		</div>
	);
}