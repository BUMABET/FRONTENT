import { useState, useEffect } from 'react';

interface Player {
	id: string;
	name: string;
	passOdds: number;
	failOdds: number;
	totalBetAmount: number;
	status: 'active';
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
					passOdds: 1.85,
					failOdds: 1.95,
					totalBetAmount: 2500000,
					status: 'active'
				},
				{
					id: '2',
					name: '이영희',
					passOdds: 2.1,
					failOdds: 1.75,
					totalBetAmount: 1800000,
					status: 'active'
				},
				{
					id: '3',
					name: '박민수',
					passOdds: 1.75,
					failOdds: 2.0,
					totalBetAmount: 3200000,
					status: 'active'
				},
				{
					id: '4',
					name: '최지혜',
					passOdds: 1.65,
					failOdds: 2.2,
					totalBetAmount: 950000,
					status: 'active'
				},
				{
					id: '5',
					name: '정우진',
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

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<table className="w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								플레이어
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								상태
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								총 배팅액
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
								합격 배당
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
								불합격 배당
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
								결과
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{players.map((player) => (
							<tr key={player.id} className="hover:bg-gray-50">
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">{player.name}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
										진행중
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									₩{player.totalBetAmount.toLocaleString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-center">
									<span className="text-lg font-bold text-green-600">
										{player.passOdds.toFixed(2)}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-center">
									<span className="text-lg font-bold text-red-600">
										{player.failOdds.toFixed(2)}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-center">
									<span className="text-gray-400 text-sm">대기중</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}