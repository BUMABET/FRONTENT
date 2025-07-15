const API_BASE_URL = 'http://localhost:5555';

// API 응답 타입
interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
		details?: Record<string, unknown>;
	};
	message?: string;
}

// 토큰 관리
export const tokenManager = {
	getAccessToken: (): string | null => {
		return localStorage.getItem('accessToken');
	},

	setTokens: (accessToken: string, refreshToken: string) => {
		console.log('토큰 저장:', { accessToken, refreshToken });
		localStorage.setItem('accessToken', accessToken);
		localStorage.setItem('refreshToken', refreshToken);
	},

	clearTokens: () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
	},

	getRefreshToken: (): string | null => {
		return localStorage.getItem('refreshToken');
	},
};

// API 요청 헬퍼
class ApiService {
	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${API_BASE_URL}${endpoint}`;
		const token = tokenManager.getAccessToken();

		const config: RequestInit = {
			headers: {
				'Content-Type': 'application/json',
				...(token && { Authorization: `Bearer ${token}` }),
				...options.headers,
			},
			...options,
		};

		try {
			const response = await fetch(url, config);
			console.log(`API Response [${endpoint}]:`, response.status, response.statusText);

			// 응답이 빈 경우 처리
			if (response.status === 204 || response.headers.get('content-length') === '0') {
				console.log(`빈 응답 반환 [${endpoint}]:`, response.status);
				return {} as T;
			}

			// Content-Type 확인
			const contentType = response.headers.get('content-type');
			if (!contentType || !contentType.includes('application/json')) {
				throw new Error(`서버에서 JSON이 아닌 응답을 반환했습니다: ${response.status} ${response.statusText}`);
			}

			const data: ApiResponse<T> = await response.json();
			console.log(`API Data [${endpoint}]:`, data);

			if (!response.ok) {
				throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
			}

			if (!data.success) {
				throw new Error(data.error?.message || 'API 요청 실패');
			}

			return data.data as T;
		} catch (error) {
			if (error instanceof SyntaxError) {
				console.error(`JSON 파싱 에러 [${endpoint}]:`, error);
				throw new Error('서버 응답을 읽을 수 없습니다. 서버 상태를 확인해주세요.');
			}
			if (error instanceof TypeError && error.message.includes('fetch')) {
				console.error(`네트워크 에러 [${endpoint}]:`, error);
				throw new Error('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
			}
			console.error(`API Error [${endpoint}]:`, error);
			throw error;
		}
	}

	// 인증 API
	async getGoogleLoginUrl(): Promise<{ url: string }> {
		return this.request('/auth/login');
	}

	async refreshToken(): Promise<{ accessToken: string }> {
		const refreshToken = tokenManager.getRefreshToken();
		if (!refreshToken) {
			throw new Error('리프레시 토큰이 없습니다.');
		}

		return this.request('/auth/refresh', {
			method: 'POST',
			body: JSON.stringify({ refreshToken }),
		});
	}

	async logout(): Promise<void> {
		try {
			await this.request('/auth/logout', { method: 'POST' });
		} finally {
			tokenManager.clearTokens();
		}
	}

	// 사용자 API
	async getUserInfo(): Promise<{
		id: number;
		name: string;
		email: string;
		balance: number;
		totalBets: number;
		totalBetAmount: number;
	}> {
		return this.request('/users/me');
	}

	async getUserBalance(userId: number): Promise<{ balance: number }> {
		return this.request(`/users/${userId}/balance`);
	}

	// 플레이어 API
	async getPlayers(): Promise<
		{
			id: number;
			name: string;
			status: 'active';
			passOdds: number;
			failOdds: number;
			totalBetAmount: number;
			lastUpdated: string;
		}[]
	> {
		return this.request('/players');
	}

	// 배팅 API
	async createSingleBets(
		bets: {
			targetUserId: number;
			choice: 'pass' | 'fail';
			amount: number;
		}[],
	): Promise<{
		betIds: number[];
		totalAmount: number;
		remainingBalance: number;
		bets: {
			id: number;
			type: 'single';
			amount: number;
			status: 'pending';
			potentialWin: number;
			createdAt: string;
			legs: {
				targetUserId: number;
				targetName: string;
				choice: 'pass' | 'fail';
				odds: number;
			}[];
		}[];
	}> {
		return this.request('/bets/single', {
			method: 'POST',
			body: JSON.stringify({ bets }),
		});
	}

	async createParlayBet(data: {
		amount: number;
		legs: {
			targetUserId: number;
			choice: 'pass' | 'fail';
		}[];
	}): Promise<{
		id: number;
		amount: number;
		totalOdds: number;
		potentialWin: number;
		status: 'pending';
		legs: {
			targetUserId: number;
			targetName: string;
			choice: 'pass' | 'fail';
			odds: number;
		}[];
		createdAt: string;
		remainingBalance: number;
	}> {
		return this.request('/bets/parlay', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async getBettingHistory(params?: {
		status?: 'pending' | 'won' | 'lost';
		type?: 'single' | 'parlay';
		limit?: number;
		offset?: number;
	}): Promise<{
		bets: {
			id: number;
			type: 'single' | 'parlay';
			amount: number;
			status: 'pending';
			potentialWin: number;
			createdAt: string;
			legs: {
				targetName: string;
				choice: 'pass' | 'fail';
				odds: number;
			}[];
		}[];
		stats: {
			totalBets: number;
			totalAmount: number;
			pending: number;
			totalPotentialWin: number;
		};
		pagination: {
			total: number;
			limit: number;
			offset: number;
			hasMore: boolean;
		};
	}> {
		const queryParams = new URLSearchParams();
		if (params?.status) queryParams.append('status', params.status);
		if (params?.type) queryParams.append('type', params.type);
		if (params?.limit) queryParams.append('limit', params.limit.toString());
		if (params?.offset) queryParams.append('offset', params.offset.toString());

		const endpoint = `/bets/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		return this.request(endpoint);
	}

	async getBet(betId: number): Promise<{
		id: number;
		type: 'single' | 'parlay';
		amount: number;
		status: 'pending';
		potentialWin: number;
		createdAt: string;
		legs: {
			targetUserId: number;
			targetName: string;
			choice: 'pass' | 'fail';
			odds: number;
		}[];
	}> {
		return this.request(`/bets/${betId}`);
	}
}

export const apiService = new ApiService();
export default apiService;
