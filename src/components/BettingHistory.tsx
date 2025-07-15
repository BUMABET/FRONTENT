import { useState, useEffect } from 'react';
import { apiService, tokenManager } from '../services/api';

interface Bet {
	id: number;
	type: 'single' | 'parlay';
	amount: number;
	createdAt: string;
	status: 'pending';
	potentialWin: number;
	legs: {
		targetName: string;
		choice: 'pass' | 'fail';
		odds: number;
	}[];
}

interface BettingStats {
	totalBets: number;
	totalAmount: number;
	pending: number;
	totalPotentialWin: number;
}

export default function BettingHistory() {
	const [bets, setBets] = useState<Bet[]>([]);
	const [filter, setFilter] = useState<'all' | 'pending'>('all');
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState<BettingStats>({
		totalBets: 0,
		totalAmount: 0,
		pending: 0,
		totalPotentialWin: 0
	});
	const [error, setError] = useState<string | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		// 로그인 상태 확인
		const token = tokenManager.getAccessToken();
		setIsLoggedIn(!!token);

		// 로그인 되어 있으면 배팅 내역 가져오기
		if (token) {
			fetchBettingHistory();
		} else {
			// 로그인 안 되어 있으면 더미 데이터 사용
			setTimeout(() => {
				const dummyBets = [
					{
						id: 1,
						type: 'single' as const,
						amount: 50000,
						createdAt: '2024-07-28T14:30:00Z',
						status: 'pending' as const,
						potentialWin: 92500,
						legs: [{
							targetName: '박민수',
							choice: 'pass' as const,
							odds: 1.85
						}]
					},
					{
						id: 2,
						type: 'parlay' as const,
						amount: 80000,
						createdAt: '2024-07-29T09:15:00Z',
						status: 'pending' as const,
						potentialWin: 276800,
						legs: [
							{
								targetName: '김철수',
								choice: 'pass' as const,
								odds: 1.85
							},
							{
								targetName: '이영희',
								choice: 'fail' as const,
								odds: 1.75
							}
						]
					}
				];
				setBets(dummyBets);
				setStats({
					totalBets: dummyBets.length,
					totalAmount: dummyBets.reduce((sum, bet) => sum + bet.amount, 0),
					pending: dummyBets.length,
					totalPotentialWin: dummyBets.reduce((sum, bet) => sum + bet.potentialWin, 0)
				});
				setLoading(false);
			}, 500);
		}
	}, []);

	const fetchBettingHistory = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiService.getBettingHistory();
			setBets(data.bets || []);
			setStats(data.stats || {
				totalBets: 0,
				totalAmount: 0,
				pending: 0,
				totalPotentialWin: 0
			});
		} catch (error) {
			console.error('배팅 내역 조회 실패:', error);
			setError('배팅 내역을 불러올 수 없습니다.');
			// 에러 시 빈 데이터로 초기화
			setBets([]);
			setStats({
				totalBets: 0,
				totalAmount: 0,
				pending: 0,
				totalPotentialWin: 0
			});
		} finally {
			setLoading(false);
		}
	};

	const filteredBets = bets.filter(bet => bet && (filter === 'all' || bet.status === filter));

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
				<h2 className="text-2xl font-bold text-gray-900 mb-2">배팅 내역</h2>
				<p className="text-gray-600">
					모든 사용자의 배팅 내역을 확인할 수 있습니다.
				</p>
			</div>

			{/* 통계 카드 */}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-sm text-gray-600">총 배팅 수</div>
					<div className="text-2xl font-bold text-blue-600">{stats.totalBets}</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-sm text-gray-600">총 배팅액</div>
					<div className="text-2xl font-bold text-purple-600">
						₩{stats.totalAmount.toLocaleString()}
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-sm text-gray-600">예상 당첨금</div>
					<div className="text-2xl font-bold text-green-600">
						₩{stats.totalPotentialWin.toLocaleString()}
					</div>
				</div>
			</div>

			{/* 필터 */}
			<div className="mb-6">
				<div className="flex space-x-2">
					{[
						{ key: 'all', label: '전체', count: stats.totalBets },
						{ key: 'pending', label: '진행중', count: stats.pending }
					].map(({ key, label, count }) => (
						<button
							key={key}
							onClick={() => setFilter(key as 'all' | 'pending')}
							className={`px-4 py-2 rounded-lg text-sm font-medium ${
								filter === key
									? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
									: 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
							}`}
						>
							{label} ({count})
						</button>
					))}
				</div>
			</div>

			{/* 배팅 내역 목록 */}
			<div className="space-y-4">
				{filteredBets.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-4xl mb-4">📋</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">배팅 내역이 없습니다</h3>
						<p className="text-gray-600">첫 번째 배팅을 해보세요!</p>
					</div>
				) : (
					filteredBets.map((bet) => (
						<div key={bet.id} className="bg-white rounded-lg shadow p-6">
							<div className="flex justify-between items-start mb-4">
								<div className="flex items-center space-x-3">
									<span className={`px-3 py-1 text-xs font-semibold rounded-full ${
										bet.type === 'single' 
											? 'bg-blue-100 text-blue-800' 
											: 'bg-purple-100 text-purple-800'
									}`}>
										{bet.type === 'single' ? '단일' : '조합'}
									</span>
									<span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
										진행중
									</span>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-500">
										{new Date(bet.createdAt).toLocaleString('ko-KR', {
											year: 'numeric',
											month: '2-digit',
											day: '2-digit',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</div>
									<div className="text-lg font-bold text-gray-900">
										₩{(bet.amount || 0).toLocaleString()}
									</div>
								</div>
							</div>

							<div className="space-y-3 mb-4">
								{bet.legs?.map((leg, index) => (
									<div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
										<div>
											<span className="font-medium">{leg?.targetName || '알 수 없음'}</span>
											</div>
										<div className="flex items-center space-x-3">
											<span className={`px-2 py-1 text-xs rounded ${
												leg?.choice === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
											}`}>
												{leg?.choice === 'pass' ? '합격' : '불합격'} ({(leg?.odds || 0).toFixed(2)}배)
											</span>
										</div>
									</div>
								)) || []}
							</div>

							<div className="flex justify-between items-end">
								<div>
									<div className="text-sm text-gray-600">
										총 배당률: {(bet.legs?.reduce((acc, leg) => acc * (leg?.odds || 1), 1) || 1).toFixed(2)}배
									</div>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-600">예상 당첨금</div>
									<div className="text-lg font-bold text-blue-600">
										₩{(bet.potentialWin || 0).toLocaleString()}
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}