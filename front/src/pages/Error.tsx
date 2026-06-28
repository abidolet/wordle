import { useSearchParams, useNavigate } from 'react-router-dom';

const messages: Record<string, string> =
{
	'403': 'You are not allowed to access this page.',
	'404': 'Page not found.',
	'405': 'Method not allowed.',
	'429': 'Too many requests. Please wait a moment.',
	'500': 'Internal server error.',
	'502': 'Bad gateway.',
	'503': 'Service unavailable.',
	'504': 'Gateway timeout.',
};

export default function Error() 
{
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const code = params.get('code') ?? '500';

	return (
		<div>
			<h1>{code}</h1>
			<p>{messages[code] ?? 'An unexpected error occurred.'}</p>
			<button onClick={() => navigate('/')}>Go home</button>
		</div>
	);
}
