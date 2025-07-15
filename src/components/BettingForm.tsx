import { useState } from 'react';

interface BettingFormProps {
	isLoggedIn: boolean;
	userBalance: number;
}

interface BettingLeg {
	targetUserId: string;
	targetName: string;
	choice: 'pass' | 'fail';
	odds: number;
}

export default function BettingForm({ isLoggedIn, userBalance }: BettingFormProps) {
	const [bettingType, setBettingType] = useState<'single' | 'parlay'>('single');
	const [selectedPlayer, setSelectedPlayer] = useState('');
	const [selectedChoice, setSelectedChoice] = useState<'pass' | 'fail'>('pass');
	const [betAmount, setBetAmount] = useState('');
	const [parlayLegs, setParlayLegs] = useState<BettingLeg[]>([]);

	// 더미 플레이어 데이터
	const players = [
		{ id: '1', name: '김철수', examType: '정보처리기사', passOdds: 1.85, failOdds: 1.95 },
		{ id: '2', name: '이영희', examType: 'AWS Solutions Architect', passOdds: 2.1, failOdds: 1.75 },
		{ id: '4', name: '최지혜', examType: 'TOEIC', passOdds: 1.65, failOdds: 2.2 },
		{ id: '5', name: '정우진', examType: '컴활 1급', passOdds: 1.9, failOdds: 1.9 }
	];

	const handleSingleBet = () => {
		if (!isLoggedIn) {
			alert('로그인이 필요합니다.');
			return;
		}

		const player = players.find(p => p.id === selectedPlayer);
		if (!player || !betAmount) {
			alert('플레이어와 배팅 금액을 선택해주세요.');
			return;
		}

		const amount = parseInt(betAmount);
		if (amount > userBalance) {
			alert('잔고가 부족합니다.');
			return;
		}

		const odds = selectedChoice === 'pass' ? player.passOdds : player.failOdds;
		const potentialWin = amount * odds;

		alert(`배팅이 완료되었습니다!\n플레이어: ${player.name}\n선택: ${selectedChoice === 'pass' ? '합격' : '불합격'}\n배팅액: ₩${amount.toLocaleString()}\n예상 당첨금: ₩${potentialWin.toLocaleString()}`);
		
		setBetAmount('');
		setSelectedPlayer('');
	};

	const addParlayLeg = () => {
		const player = players.find(p => p.id === selectedPlayer);
		if (!player) {
			alert('플레이어를 선택해주세요.');
			return;
		}

		if (parlayLegs.some(leg => leg.targetUserId === selectedPlayer)) {
			alert('이미 추가된 플레이어입니다.');
			return;
		}

		const odds = selectedChoice === 'pass' ? player.passOdds : player.failOdds;
		const newLeg: BettingLeg = {
			targetUserId: selectedPlayer,
			targetName: player.name,
			choice: selectedChoice,
			odds
		};

		setParlayLegs([...parlayLegs, newLeg]);
		setSelectedPlayer('');
	};

	const removeParlayLeg = (index: number) => {
		setParlayLegs(parlayLegs.filter((_, i) => i !== index));
	};

	const handleParlayBet = () => {
		if (!isLoggedIn) {
			alert('로그인이 필요합니다.');
			return;
		}

		if (parlayLegs.length < 2) {
			alert('조합 배팅은 최소 2개 이상의 선택이 필요합니다.');
			return;
		}

		if (!betAmount) {
			alert('배팅 금액을 입력해주세요.');
			return;
		}

		const amount = parseInt(betAmount);
		if (amount > userBalance) {
			alert('잔고가 부족합니다.');
			return;
		}

		const totalOdds = parlayLegs.reduce((acc, leg) => acc * leg.odds, 1);
		const potentialWin = amount * totalOdds;

		alert(`조합 배팅이 완료되었습니다!\n선택 수: ${parlayLegs.length}개\n총 배당률: ${totalOdds.toFixed(2)}\n배팅액: ₩${amount.toLocaleString()}\n예상 당첨금: ₩${potentialWin.toLocaleString()}`);
		
		setBetAmount('');
		setParlayLegs([]);
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
							단일 배팅
						</button>
						<button
							onClick={() => setBettingType('parlay')}
							className={`px-4 py-2 rounded-lg font-medium ${
								bettingType === 'parlay'
									? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
									: 'bg-gray-100 text-gray-600 border-2 border-transparent'
							}`}
						>
							조합 배팅 (더 높은 배당)
						</button>
					</div>
				</div>

				{/* 플레이어 선택 */}
				<div className="grid md:grid-cols-2 gap-6 mb-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							플레이어 선택
						</label>
						<select
							value={selectedPlayer}
							onChange={(e) => setSelectedPlayer(e.target.value)}
							className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="">플레이어를 선택하세요</option>
							{players.map((player) => (
								<option key={player.id} value={player.id}>
									{player.name} - {player.examType}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							예측 결과
						</label>
						<div className="grid grid-cols-2 gap-2">
							<button
								onClick={() => setSelectedChoice('pass')}
								className={`p-3 rounded-lg border-2 ${
									selectedChoice === 'pass'
										? 'border-green-500 bg-green-50 text-green-700'
										: 'border-gray-300 text-gray-600'
								}`}
							>
								합격
								{selectedPlayer && (
									<div className="text-sm font-bold">
										{players.find(p => p.id === selectedPlayer)?.passOdds.toFixed(2)}배
									</div>
								)}
							</button>
							<button
								onClick={() => setSelectedChoice('fail')}
								className={`p-3 rounded-lg border-2 ${
									selectedChoice === 'fail'
										? 'border-red-500 bg-red-50 text-red-700'
										: 'border-gray-300 text-gray-600'
								}`}
							>
								불합격
								{selectedPlayer && (
									<div className="text-sm font-bold">
										{players.find(p => p.id === selectedPlayer)?.failOdds.toFixed(2)}배
									</div>
								)}
							</button>
						</div>
					</div>
				</div>

				{/* 조합 배팅 전용 */}
				{bettingType === 'parlay' && (
					<div className="mb-6">
						<div className="flex justify-between items-center mb-3">
							<h3 className="text-lg font-medium">조합 목록</h3>
							<button
								onClick={addParlayLeg}
								disabled={!selectedPlayer}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
							>
								추가
							</button>
						</div>

						{parlayLegs.length > 0 && (
							<div className="space-y-2 mb-4">
								{parlayLegs.map((leg, index) => (
									<div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
										<div>
											<span className="font-medium">{leg.targetName}</span>
											<span className={`ml-2 px-2 py-1 text-xs rounded ${
												leg.choice === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
											}`}>
												{leg.choice === 'pass' ? '합격' : '불합격'} ({leg.odds.toFixed(2)}배)
											</span>
										</div>
										<button
											onClick={() => removeParlayLeg(index)}
											className="text-red-600 hover:text-red-800"
										>
											제거
										</button>
									</div>
								))}
								<div className="bg-blue-50 p-3 rounded-lg">
									<div className="text-sm text-blue-800">
										총 배당률: <span className="font-bold">
											{parlayLegs.reduce((acc, leg) => acc * leg.odds, 1).toFixed(2)}배
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* 배팅 금액 및 실행 */}
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							배팅 금액
						</label>
						<div className="relative">
							<span className="absolute left-3 top-3 text-gray-500">₩</span>
							<input
								type="number"
								value={betAmount}
								onChange={(e) => setBetAmount(e.target.value)}
								placeholder="배팅할 금액을 입력하세요"
								className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								min="1000"
								max={userBalance}
							/>
						</div>
						<div className="text-sm text-gray-500 mt-1">
							사용 가능 잔고: ₩{userBalance.toLocaleString()}
						</div>
					</div>

					{betAmount && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="text-sm text-gray-600">예상 당첨금</div>
							<div className="text-xl font-bold text-green-600">
								₩{(
									parseInt(betAmount) * 
									(bettingType === 'single' 
										? (selectedPlayer ? (selectedChoice === 'pass' 
											? players.find(p => p.id === selectedPlayer)?.passOdds || 0
											: players.find(p => p.id === selectedPlayer)?.failOdds || 0) : 0)
										: parlayLegs.reduce((acc, leg) => acc * leg.odds, 1))
								).toLocaleString()}
							</div>
						</div>
					)}

					<button
						onClick={bettingType === 'single' ? handleSingleBet : handleParlayBet}
						disabled={
							!betAmount || 
							(bettingType === 'single' ? !selectedPlayer : parlayLegs.length < 2) ||
							parseInt(betAmount) > userBalance
						}
						className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg"
					>
						{bettingType === 'single' ? '단일 배팅하기' : '조합 배팅하기'}
					</button>
				</div>
			</div>
		</div>
	);
}