import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Error boundary caught an error:', error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen bg-gray-50 flex items-center justify-center">
					<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
						<div className="text-center">
							<div className="text-6xl mb-4">⚠️</div>
							<h1 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
							<p className="text-gray-600 mb-6">
								페이지를 불러오는 중 문제가 발생했습니다. 페이지를 새로고침해 주세요.
							</p>
							<div className="space-y-3">
								<button
									onClick={() => window.location.reload()}
									className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
								>
									페이지 새로고침
								</button>
								<button
									onClick={() => this.setState({ hasError: false, error: undefined })}
									className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
								>
									다시 시도
								</button>
							</div>
							{this.state.error && (
								<details className="mt-4 text-left">
									<summary className="text-sm text-gray-500 cursor-pointer">
										기술적 세부사항
									</summary>
									<pre className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded overflow-auto">
										{this.state.error.message}
									</pre>
								</details>
							)}
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;