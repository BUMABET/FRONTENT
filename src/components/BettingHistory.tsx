import { useState, useEffect } from 'react';

interface Bet {
	id: string;
	type: 'single' | 'parlay';
	amount: number;
	createdAt: string;
	status: 'pending' | 'won' | 'lost';
	potentialWin: number;
	actualWin?: number;
	legs: {
		targetName: string;
		examType: string;
		choice: 'pass' | 'fail';
		odds: number;
		result?: 'pass' | 'fail';
	}[];
}

export default function BettingHistory() {
	const [bets, setBets] = useState<Bet[]>([]);
	const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// 더미 배팅 내역 데이터
		setTimeout(() => {
			setBets([
				{
					id: '1',
					type: 'single',
					amount: 50000,
					createdAt: '2024-07-28 14:30',
					status: 'won',
					potentialWin: 92500,
					actualWin: 92500,
					legs: [{
						targetName: '박민수',
						examType: 'SQLD',
						choice: 'pass',
						odds: 1.85,
						result: 'pass'
					}]
				},
				{
					id: '2',
					type: 'parlay',
					amount: 30000,
					createdAt: '2024-07-29 09:15',
					status: 'lost',
					potentialWin: 189000,
					actualWin: 0,
					legs: [
						{
							targetName: '김철수',
							examType: '정보처리기사',
							choice: 'pass',
							odds: 1.85,
							result: 'pass'
						},
						{
							targetName: '이영희',
							examType: 'AWS Solutions Architect',
							choice: 'fail',
							odds: 2.1,
							result: 'pass'
						}
					]
				},
				{
					id: '3',
					type: 'single',
					amount: 100000,
					createdAt: '2024-07-30 16:45',
					status: 'pending',
					potentialWin: 220000,
					legs: [{
						targetName: '최지혜',
						examType: 'TOEIC',
						choice: 'fail',
						odds: 2.2
					}]
				},
				{
					id: '4',
					type: 'single',
					amount: 75000,
					createdAt: '2024-07-31 11:20',
					status: 'pending',
					potentialWin: 142500,
					legs: [{
						targetName: '정우진',
						examType: '컴활 1급',
						choice: 'pass',
						odds: 1.9
					}]
				},
				{
					id: '5',
					type: 'parlay',
					amount: 40000,
					createdAt: '2024-08-01 13:10',
					status: 'pending',
					potentialWin: 144000,
					legs: [
						{
							targetName: '김철수',
							examType: '정보처리기사',
							choice: 'pass',
							odds: 1.8
						},
						{
							targetName: '정우진',
							examType: '컴활 1급',
							choice: 'fail',
							odds: 2.0
						}
					]
				}
			]);
			setLoading(false);
		}, 800);
	}, []);

	const filteredBets = bets.filter(bet => filter === 'all' || bet.status === filter);

	const totalStats = {
		totalBets: bets.length,
		totalAmount: bets.reduce((sum, bet) => sum + bet.amount, 0),
		totalWon: bets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + (bet.actualWin || 0), 0),
		pending: bets.filter(bet => bet.status === 'pending').length,
		winRate: bets.filter(bet => bet.status !== 'pending').length > 0 
			? (bets.filter(bet => bet.status === 'won').length / bets.filter(bet => bet.status !== 'pending').length * 100).toFixed(1)
			: '0'
	};

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
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-sm text-gray-600">총 배팅 수</div>
					<div className="text-2xl font-bold text-blue-600">{totalStats.totalBets}</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-sm text-gray-600">총 배팅액</div>
					<div className="text-2xl font-bold text-purple-600">
						₩{totalStats.totalAmount.toLocaleString()}
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-sm text-gray-600">총 당첨금</div>
					<div className="text-2xl font-bold text-green-600">
						₩{totalStats.totalWon.toLocaleString()}
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-sm text-gray-600">승률</div>
					<div className="text-2xl font-bold text-orange-600">{totalStats.winRate}%</div>
				</div>
			</div>

			{/* 필터 */}
			<div className="mb-6">
				<div className="flex space-x-2">
					{[
						{ key: 'all', label: '전체', count: bets.length },
						{ key: 'pending', label: '진행중', count: bets.filter(b => b.status === 'pending').length },
						{ key: 'won', label: '당첨', count: bets.filter(b => b.status === 'won').length },
						{ key: 'lost', label: '낙첨', count: bets.filter(b => b.status === 'lost').length }
					].map(({ key, label, count }) => (
						<button
							key={key}
							onClick={() => setFilter(key as 'all' | 'pending' | 'won' | 'lost')}
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
									<span className={`px-3 py-1 text-xs font-semibold rounded-full ${
										bet.status === 'pending' 
											? 'bg-yellow-100 text-yellow-800'
											: bet.status === 'won'
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'
									}`}>
										{bet.status === 'pending' ? '진행중' : bet.status === 'won' ? '당첨' : '낙첨'}
									</span>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-500">{bet.createdAt}</div>
									<div className="text-lg font-bold text-gray-900">
										₩{bet.amount.toLocaleString()}
									</div>
								</div>
							</div>

							<div className="space-y-3 mb-4">
								{bet.legs.map((leg, index) => (
									<div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
										<div>
											<span className="font-medium">{leg.targetName}</span>
											<span className="ml-2 text-sm text-gray-600">({leg.examType})</span>
										</div>
										<div className="flex items-center space-x-3">
											<span className={`px-2 py-1 text-xs rounded ${
												leg.choice === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
											}`}>
												{leg.choice === 'pass' ? '합격' : '불합격'} ({leg.odds.toFixed(2)}배)
											</span>
											{leg.result && (
												<span className={`px-2 py-1 text-xs rounded font-semibold ${
													leg.result === leg.choice 
														? 'bg-green-200 text-green-900' 
														: 'bg-red-200 text-red-900'
												}`}>
													실제: {leg.result === 'pass' ? '합격' : '불합격'}
												</span>
											)}
										</div>
									</div>
								))}
							</div>

							<div className="flex justify-between items-end">
								<div>
									<div className="text-sm text-gray-600">
										총 배당률: {bet.legs.reduce((acc, leg) => acc * leg.odds, 1).toFixed(2)}배
									</div>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-600">예상 당첨금</div>
									<div className="text-lg font-bold text-blue-600">
										₩{bet.potentialWin.toLocaleString()}
									</div>
									{bet.status !== 'pending' && (
										<div className={`text-sm font-medium ${
											bet.status === 'won' ? 'text-green-600' : 'text-red-600'
										}`}>
											실제: ₩{(bet.actualWin || 0).toLocaleString()}
										</div>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}