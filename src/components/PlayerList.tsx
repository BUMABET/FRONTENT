import { useState, useEffect } from 'react';

interface Player {
	id: string;
	name: string;
	email: string;
	examType: string;
	examDate: string;
	passOdds: number;
	failOdds: number;
	totalBetAmount: number;
	status: 'active' | 'completed';
	result?: 'pass' | 'fail';
}

export default function PlayerList() {
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// 모든 사용자가 볼 수 있도록 더미 데이터로 시뮬레이션
		setTimeout(() => {
			setPlayers([
				{
					id: '1',
					name: '김철수',
					email: 'chulsoo@email.com',
					examType: '정보처리기사',
					examDate: '2024-08-15',
					passOdds: 1.85,
					failOdds: 1.95,
					totalBetAmount: 2500000,
					status: 'active'
				},
				{
					id: '2',
					name: '이영희',
					email: 'younghee@email.com',
					examType: 'AWS Solutions Architect',
					examDate: '2024-08-20',
					passOdds: 2.1,
					failOdds: 1.75,
					totalBetAmount: 1800000,
					status: 'active'
				},
				{
					id: '3',
					name: '박민수',
					email: 'minsu@email.com',
					examType: 'SQLD',
					examDate: '2024-07-30',
					passOdds: 0,
					failOdds: 0,
					totalBetAmount: 3200000,
					status: 'completed',
					result: 'pass'
				},
				{
					id: '4',
					name: '최지혜',
					email: 'jihye@email.com',
					examType: 'TOEIC',
					examDate: '2024-08-25',
					passOdds: 1.65,
					failOdds: 2.2,
					totalBetAmount: 950000,
					status: 'active'
				},
				{
					id: '5',
					name: '정우진',
					email: 'woojin@email.com',
					examType: '컴활 1급',
					examDate: '2024-08-18',
					passOdds: 1.9,
					failOdds: 1.9,
					totalBetAmount: 1600000,
					status: 'active'
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
				<h2 className="text-2xl font-bold text-gray-900 mb-2">배팅 가능한 플레이어</h2>
				<p className="text-gray-600">
					로그인한 모든 사용자가 배팅 대상이 됩니다. 실시간으로 배당률이 조정됩니다.
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{players.map((player) => (
					<div 
						key={player.id} 
						className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
							player.status === 'completed' 
								? player.result === 'pass' 
									? 'border-green-500' 
									: 'border-red-500'
								: 'border-blue-500'
						}`}
					>
						<div className="flex justify-between items-start mb-4">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
								<p className="text-sm text-gray-500">{player.email}</p>
							</div>
							<span className={`px-2 py-1 text-xs font-semibold rounded-full ${
								player.status === 'completed'
									? player.result === 'pass'
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800'
									: 'bg-blue-100 text-blue-800'
							}`}>
								{player.status === 'completed' 
									? player.result === 'pass' ? '합격' : '불합격'
									: '진행중'
								}
							</span>
						</div>

						<div className="space-y-2 mb-4">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">시험:</span>
								<span className="text-sm font-medium">{player.examType}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">시험일:</span>
								<span className="text-sm font-medium">{player.examDate}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">총 배팅액:</span>
								<span className="text-sm font-medium text-green-600">
									₩{player.totalBetAmount.toLocaleString()}
								</span>
							</div>
						</div>

						{player.status === 'active' && (
							<div className="grid grid-cols-2 gap-3">
								<div className="bg-green-50 rounded-lg p-3 text-center">
									<div className="text-xs text-gray-600 mb-1">합격</div>
									<div className="text-lg font-bold text-green-600">
										{player.passOdds.toFixed(2)}
									</div>
								</div>
								<div className="bg-red-50 rounded-lg p-3 text-center">
									<div className="text-xs text-gray-600 mb-1">불합격</div>
									<div className="text-lg font-bold text-red-600">
										{player.failOdds.toFixed(2)}
									</div>
								</div>
							</div>
						)}

						{player.status === 'completed' && (
							<div className="text-center">
								<div className={`text-lg font-bold ${
									player.result === 'pass' ? 'text-green-600' : 'text-red-600'
								}`}>
									{player.result === 'pass' ? '🎉 합격' : '😞 불합격'}
								</div>
								<div className="text-sm text-gray-500 mt-1">정산 완료</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}