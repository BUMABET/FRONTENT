import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface BettingFormProps {
	isLoggedIn: boolean;
	userBalance: number;
	onBalanceUpdate?: (balance: number) => void;
}


interface SelectedPlayer {
	id: number;
	name: string;
	passOdds: number;
	failOdds: number;
	choice?: 'pass' | 'fail';
	betAmount?: number;
}

export default function BettingForm({ isLoggedIn, userBalance, onBalanceUpdate }: BettingFormProps) {
	const [bettingType, setBettingType] = useState<'single' | 'parlay'>('single');
	const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
	const [betAmount, setBetAmount] = useState('');
	const [bettingLoading, setBettingLoading] = useState(false);

	const [players, setPlayers] = useState<{
		id: number;
		name: string;
		passOdds: number;
		failOdds: number;
		status: 'active';
		totalBetAmount: number;
		lastUpdated: string;
	}[]>([]);
	const [loadingPlayers, setLoadingPlayers] = useState(false);

	// API에서 플레이어 데이터 가져오기
	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				setLoadingPlayers(true);
				const data = await apiService.getPlayers();
				setPlayers(data);
			} catch (error) {
				console.error('플레이어 목록 조회 실패:', error);
				// 에러 시 더미 데이터 사용
				setPlayers([
					{ id: 1, name: '김철수', passOdds: 1.85, failOdds: 1.95, status: 'active', totalBetAmount: 500000, lastUpdated: new Date().toISOString() },
					{ id: 2, name: '이영희', passOdds: 2.1, failOdds: 1.75, status: 'active', totalBetAmount: 300000, lastUpdated: new Date().toISOString() },
					{ id: 4, name: '최지혜', passOdds: 1.65, failOdds: 2.2, status: 'active', totalBetAmount: 800000, lastUpdated: new Date().toISOString() },
					{ id: 5, name: '정우진', passOdds: 1.9, failOdds: 1.9, status: 'active', totalBetAmount: 600000, lastUpdated: new Date().toISOString() }
				]);
			} finally {
				setLoadingPlayers(false);
			}
		};

		fetchPlayers();
	}, []);

	const handlePlayerSelect = (playerId: string, checked: boolean) => {
		if (checked) {
			const player = players.find(p => p.id === playerId);
			if (player && !selectedPlayers.some(p => p.id === playerId)) {
				setSelectedPlayers([...selectedPlayers, player]);
			}
		} else {
			setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
		}
	};

	const handleChoiceChange = (playerId: string, choice: 'pass' | 'fail') => {
		setSelectedPlayers(selectedPlayers.map(p => 
			p.id === playerId ? { ...p, choice } : p
		));
	};

	const handleBetAmountChange = (playerId: string, amount: number) => {
		setSelectedPlayers(selectedPlayers.map(p => 
			p.id === playerId ? { ...p, betAmount: amount } : p
		));
	};

	const removeSelectedPlayer = (playerId: string) => {
		setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
	};

	const handleBet = async () => {
		if (!isLoggedIn) {
			alert('로그인이 필요합니다.');
			return;
		}

		if (selectedPlayers.length === 0) {
			alert('배팅할 플레이어를 선택해주세요.');
			return;
		}

		if (bettingType === 'parlay' && selectedPlayers.length < 2) {
			alert('조합 배팅은 최소 2개 이상의 선택이 필요합니다.');
			return;
		}

		const playersWithoutChoice = selectedPlayers.filter(p => !p.choice);
		if (playersWithoutChoice.length > 0) {
			alert('모든 플레이어의 예측 결과를 선택해주세요.');
			return;
		}

		if (bettingType === 'single') {
			// 단일 배팅: 각 플레이어마다 개별 배팅 금액
			const playersWithoutAmount = selectedPlayers.filter(p => !p.betAmount || p.betAmount < 50000);
			if (playersWithoutAmount.length > 0) {
				alert('모든 플레이어의 배팅 금액을 ₩50,000 이상 입력해주세요.');
				return;
			}

			const totalAmount = selectedPlayers.reduce((sum, p) => sum + (p.betAmount || 0), 0);
			if (totalAmount > userBalance) {
				alert('총 배팅 금액이 잔고를 초과합니다.');
				return;
			}

			try {
				setBettingLoading(true);
				
				const bets = selectedPlayers.map(player => ({
					targetUserId: player.id,
					choice: player.choice as 'pass' | 'fail',
					amount: player.betAmount || 0
				}));

				const result = await apiService.createSingleBets(bets);
				
				// 잔고 업데이트
				if (onBalanceUpdate) {
					onBalanceUpdate(result.remainingBalance);
				}

				let message = `단일 배팅이 완료되었습니다!\n총 ${result.bets.length}개 배팅\n총 배팅액: ₩${result.totalAmount.toLocaleString()}\n남은 잔고: ₩${result.remainingBalance.toLocaleString()}\n\n`;
				result.bets.forEach(bet => {
					message += `${bet.legs[0].targetName} (${bet.legs[0].choice === 'pass' ? '합격' : '불합격'}): ₩${bet.amount.toLocaleString()} → ₩${bet.potentialWin.toLocaleString()}\n`;
				});
				alert(message);
			} catch (error) {
				console.error('단일 배팅 실패:', error);
				alert('배팅 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
			} finally {
				setBettingLoading(false);
			}
		} else {
			// 조합 배팅
			if (!betAmount) {
				alert('배팅 금액을 입력해주세요.');
				return;
			}

			const amount = parseInt(betAmount);
			if (amount < 50000) {
				alert('최소 배팅 금액은 ₩50,000입니다.');
				return;
			}

			if (amount > userBalance) {
				alert('잔고가 부족합니다.');
				return;
			}

			try {
				setBettingLoading(true);
				
				const legs = selectedPlayers.map(player => ({
					targetUserId: player.id,
					choice: player.choice as 'pass' | 'fail'
				}));

				const result = await apiService.createParlayBet({
					amount,
					legs
				});

				// 잔고 업데이트
				if (onBalanceUpdate) {
					onBalanceUpdate(result.remainingBalance);
				}

				let message = `조합 배팅이 완료되었습니다!\n선택 수: ${result.legs.length}개\n총 배당률: ${result.totalOdds.toFixed(2)}\n배팅액: ₩${result.amount.toLocaleString()}\n예상 당첨금: ₩${result.potentialWin.toLocaleString()}\n남은 잔고: ₩${result.remainingBalance.toLocaleString()}\n\n`;
				result.legs.forEach(leg => {
					message += `${leg.targetName}: ${leg.choice === 'pass' ? '합격' : '불합격'}\n`;
				});
				alert(message);
			} catch (error) {
				console.error('조합 배팅 실패:', error);
				alert('배팅 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
			} finally {
				setBettingLoading(false);
			}
		}

		setBetAmount('');
		setSelectedPlayers([]);
	};

	if (!isLoggedIn) {
		return (
			<div className="text-center py-12">
				<div className="text-6xl mb-4">🔒</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
				<p className="text-gray-600 mb-6">
					배팅을 하려면 먼저 로그인해주세요. 로그인 시 ₩1,000,000이 자동으로 충전됩니다.
				</p>
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
					<p className="text-yellow-800 text-sm">
						💡 로그인하지 않아도 모든 플레이어와 배당률을 확인할 수 있습니다.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">배팅하기</h2>
				<p className="text-gray-600">
					단일 배팅 또는 조합 배팅을 선택하여 배팅해보세요.
				</p>
			</div>

			<div className="bg-white rounded-lg shadow p-6">
				{/* 배팅 타입 선택 */}
				<div className="mb-6">
					<div className="flex space-x-4">
						<button
							onClick={() => setBettingType('single')}
							className={`px-4 py-2 rounded-lg font-medium ${
								bettingType === 'single'
									? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
									: 'bg-gray-100 text-gray-600 border-2 border-transparent'
							}`}
						>
							단일 배팅 (각각 개별 배팅)
						</button>
						<button
							onClick={() => setBettingType('parlay')}
							className={`px-4 py-2 rounded-lg font-medium ${
								bettingType === 'parlay'
									? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
									: 'bg-gray-100 text-gray-600 border-2 border-transparent'
							}`}
						>
							조합 배팅 (모두 맞아야 당첨)
						</button>
					</div>
				</div>

				{/* 플레이어 선택 표 */}
				<div className="mb-6">
					<h3 className="text-lg font-medium text-gray-900 mb-3">배팅 가능한 플레이어</h3>
					<div className="bg-gray-50 rounded-lg overflow-hidden">
						{loadingPlayers ? (
							<div className="flex justify-center items-center py-12">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
								<span className="ml-2 text-gray-600">플레이어 목록 로딩중...</span>
							</div>
						) : (
							<table className="w-full">
								<thead className="bg-gray-100">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											선택
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											플레이어
										</th>
										<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											합격 배당
										</th>
										<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											불합격 배당
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{players.map((player) => (
										<tr key={player.id} className="hover:bg-white">
											<td className="px-4 py-3">
												<input
													type="checkbox"
													checked={selectedPlayers.some(p => p.id === player.id)}
													onChange={(e) => handlePlayerSelect(player.id, e.target.checked)}
													className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
												/>
											</td>
											<td className="px-4 py-3">
												<div className="text-sm font-medium text-gray-900">{player.name}</div>
											</td>
											<td className="px-4 py-3 text-center">
												<span className="text-lg font-bold text-green-600">
													{player.passOdds.toFixed(2)}
												</span>
											</td>
											<td className="px-4 py-3 text-center">
												<span className="text-lg font-bold text-red-600">
													{player.failOdds.toFixed(2)}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>

				{/* 선택된 플레이어 목록 */}
				{selectedPlayers.length > 0 && (
					<div className="mb-6">
						<h3 className="text-lg font-medium text-gray-900 mb-3">
							선택된 플레이어 ({selectedPlayers.length}명)
						</h3>
						<div className="space-y-3">
							{selectedPlayers.map((player) => (
								<div key={player.id} className="bg-gray-50 rounded-lg p-4">
									<div className="flex items-center justify-between mb-3">
										<span className="font-medium text-gray-900">{player.name}</span>
										<button
											onClick={() => removeSelectedPlayer(player.id)}
											className="text-red-600 hover:text-red-800 text-sm"
										>
											제거
										</button>
									</div>
									<div className="grid grid-cols-2 gap-2 mb-3">
										<button
											onClick={() => handleChoiceChange(player.id, 'pass')}
											className={`p-2 rounded-lg border-2 text-sm ${
												player.choice === 'pass'
													? 'border-green-500 bg-green-50 text-green-700'
													: 'border-gray-300 text-gray-600 hover:border-green-300'
											}`}
										>
											합격 ({player.passOdds.toFixed(2)}배)
										</button>
										<button
											onClick={() => handleChoiceChange(player.id, 'fail')}
											className={`p-2 rounded-lg border-2 text-sm ${
												player.choice === 'fail'
													? 'border-red-500 bg-red-50 text-red-700'
													: 'border-gray-300 text-gray-600 hover:border-red-300'
											}`}
										>
											불합격 ({player.failOdds.toFixed(2)}배)
										</button>
									</div>
									{bettingType === 'single' && (
										<div>
											<label className="block text-xs text-gray-600 mb-1">배팅 금액</label>
											<div className="relative">
												<span className="absolute left-2 top-2 text-gray-500 text-sm">₩</span>
												<input
													type="number"
													value={player.betAmount || ''}
													onChange={(e) => handleBetAmountChange(player.id, parseInt(e.target.value) || 0)}
													placeholder="최소 50,000원"
													className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
													min="50000"
													max={userBalance}
												/>
											</div>
											{player.choice && player.betAmount && (
												<div className="text-xs text-gray-600 mt-1">
													예상 당첨금: ₩{((player.betAmount) * (player.choice === 'pass' ? player.passOdds : player.failOdds)).toLocaleString()}
												</div>
											)}
										</div>
									)}
								</div>
							))}
						</div>

						{/* 조합 배팅 총 배당률 표시 */}
						{bettingType === 'parlay' && selectedPlayers.length > 0 && (
							<div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm font-medium text-blue-800">조합 배당률 계산</span>
									<span className="text-xs text-blue-600">모든 예측이 맞아야 당첨</span>
								</div>
								<div className="space-y-2">
									{selectedPlayers.map((player) => (
										<div key={player.id} className="flex justify-between text-sm">
											<span className="text-blue-700">
												{player.name} ({player.choice ? (player.choice === 'pass' ? '합격' : '불합격') : '선택필요'})
											</span>
											<span className="font-medium text-blue-800">
												{player.choice ? (player.choice === 'pass' ? player.passOdds.toFixed(2) : player.failOdds.toFixed(2)) : '0.00'}배
											</span>
										</div>
									))}
									<div className="border-t border-blue-200 pt-2 mt-2">
										<div className="flex justify-between text-base font-bold">
											<span className="text-blue-800">총 배당률:</span>
											<span className="text-blue-900">
												{(() => {
													const validPlayers = selectedPlayers.filter(p => p.choice);
													if (validPlayers.length === 0) return '0.00';
													const totalOdds = validPlayers.reduce((acc, player) => {
														const odds = player.choice === 'pass' ? player.passOdds : player.failOdds;
														return acc * odds;
													}, 1);
													return totalOdds.toFixed(2);
												})()}배
											</span>
										</div>
										{betAmount && (() => {
											const validPlayers = selectedPlayers.filter(p => p.choice);
											if (validPlayers.length > 0) {
												const totalOdds = validPlayers.reduce((acc, player) => {
													const odds = player.choice === 'pass' ? player.passOdds : player.failOdds;
													return acc * odds;
												}, 1);
												const potentialWin = parseInt(betAmount) * totalOdds;
												return (
													<div className="text-sm text-blue-700 mt-1">
														₩{parseInt(betAmount).toLocaleString()} × {totalOdds.toFixed(2)}배 = ₩{potentialWin.toLocaleString()}
													</div>
												);
											}
											return null;
										})()}
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* 배팅 금액 및 실행 */}
				<div className="space-y-4">
					{bettingType === 'parlay' && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								조합 배팅 금액
							</label>
							<div className="relative">
								<span className="absolute left-3 top-3 text-gray-500">₩</span>
								<input
									type="number"
									value={betAmount}
									onChange={(e) => setBetAmount(e.target.value)}
									placeholder="최소 50,000원"
									className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									min="50000"
									max={userBalance}
								/>
							</div>
							<div className="text-sm text-gray-500 mt-1">
								사용 가능 잔고: ₩{userBalance.toLocaleString()} (최소 ₩50,000)
							</div>
						</div>
					)}

					{selectedPlayers.length > 0 && (
						<div className="bg-gray-50 p-4 rounded-lg">
							{bettingType === 'single' ? (
								<div>
									<div className="text-sm text-gray-600 mb-2">배팅 요약</div>
									{(() => {
										const totalAmount = selectedPlayers.reduce((sum, p) => sum + (p.betAmount || 0), 0);
										const validBets = selectedPlayers.filter(p => p.choice && p.betAmount);
										return (
											<div>
												<div className="flex justify-between text-sm mb-2">
													<span>총 배팅 금액:</span>
													<span className="font-bold text-blue-600">₩{totalAmount.toLocaleString()}</span>
												</div>
												{validBets.length > 0 && (
													<div className="space-y-1">
														{validBets.map((player) => {
															const odds = player.choice === 'pass' ? player.passOdds : player.failOdds;
															const potentialWin = (player.betAmount || 0) * odds;
															return (
																<div key={player.id} className="flex justify-between text-xs">
																	<span>{player.name} ({player.choice === 'pass' ? '합격' : '불합격'})</span>
																	<span className="text-green-600">₩{potentialWin.toLocaleString()}</span>
																</div>
															);
														})}
													</div>
												)}
												{totalAmount > userBalance && (
													<div className="text-xs text-red-600 mt-2">
														⚠️ 잔고를 초과합니다!
													</div>
												)}
											</div>
										);
									})()}
								</div>
							) : (
								betAmount && (
									<div>
										<div className="text-sm text-gray-600">조합 배팅 예상 당첨금</div>
										<div className="text-xl font-bold text-green-600">
											₩{(() => {
												const totalOdds = selectedPlayers.reduce((acc, player) => {
													if (!player.choice) return acc;
													const odds = player.choice === 'pass' ? player.passOdds : player.failOdds;
													return acc * odds;
												}, 1);
												return (parseInt(betAmount) * totalOdds).toLocaleString();
											})()}
										</div>
										<div className="text-sm text-gray-600 mt-1">
											총 배당률: {selectedPlayers.reduce((acc, player) => {
												if (!player.choice) return acc;
												const odds = player.choice === 'pass' ? player.passOdds : player.failOdds;
												return acc * odds;
											}, 1).toFixed(2)}배
										</div>
									</div>
								)
							)}
						</div>
					)}

					<button
						onClick={handleBet}
						disabled={bettingLoading || (() => {
							if (selectedPlayers.length === 0) return true;
							if (selectedPlayers.some(p => !p.choice)) return true;
							
							if (bettingType === 'single') {
								const playersWithoutAmount = selectedPlayers.filter(p => !p.betAmount || p.betAmount < 50000);
								if (playersWithoutAmount.length > 0) return true;
								const totalAmount = selectedPlayers.reduce((sum, p) => sum + (p.betAmount || 0), 0);
								return totalAmount > userBalance;
							} else {
								if (!betAmount || parseInt(betAmount) < 50000) return true;
								return parseInt(betAmount) > userBalance;
							}
						})()}
						className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg"
					>
						{bettingLoading ? (
							<div className="flex items-center justify-center">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
								배팅 처리중...
							</div>
						) : (
							bettingType === 'single' 
								? `단일 배팅하기 (${selectedPlayers.length}개)` 
								: `조합 배팅하기 (${selectedPlayers.length}개)`
						)}
					</button>
				</div>
			</div>
		</div>
	);
}