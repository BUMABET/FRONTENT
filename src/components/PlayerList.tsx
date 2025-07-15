import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Player {
	id: number;
	name: string;
	passOdds: number;
	failOdds: number;
	totalBetAmount: number;
	status: 'active';
	lastUpdated: string;
}

export default function PlayerList() {
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchPlayers = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiService.getPlayers();
			setPlayers(data);
		} catch (err) {
			console.error('플레이어 목록 조회 실패:', err);
			setError(err instanceof Error ? err.message : '플레이어 목록을 불러올 수 없습니다.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPlayers();

		// 30초마다 플레이어 목록 새로고침 (배당률 업데이트)
		const interval = setInterval(fetchPlayers, 30000);
		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<div className="text-4xl mb-4">⚠️</div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">데이터를 불러올 수 없습니다</h3>
				<p className="text-gray-600 mb-4">{error}</p>
				<button
					onClick={fetchPlayers}
					className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
				>
					다시 시도
				</button>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">배팅 가능한 플레이어</h2>
				<p className="text-gray-600">로그인한 2학년 사용자는 배팅 대상이 됩니다. 실시간으로 배당률이 조정됩니다.</p>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<table className="w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">플레이어</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 배팅액</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">합격 배당</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">불합격 배당</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">결과</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{players.map((player) => (
							<tr key={player.id} className="hover:bg-gray-50">
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">{player.name}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">진행중</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₩{player.totalBetAmount.toLocaleString()}</td>
								<td className="px-6 py-4 whitespace-nowrap text-center">
									<span className="text-lg font-bold text-green-600">{player.passOdds.toFixed(2)}</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-center">
									<span className="text-lg font-bold text-red-600">{player.failOdds.toFixed(2)}</span>
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
