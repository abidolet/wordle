import { useSearchParams, useNavigate } from 'react-router-dom';

const messages: Record<string, string> = {
    '403': 'You are not allowed to access this page.',
    '404': 'Page not found.',
    '405': 'Method not allowed.',
    '429': 'Too many requests. Please wait a moment.',
    '500': 'Internal server error.',
    '502': 'Bad gateway.',
    '503': 'Service unavailable.',
    '504': 'Gateway timeout.',
};

const asciiArt: Record<string, string> = {
    '403': `
      ___
     /   \\
    |  _  |
    | | | |
    |_____|
    |     |
    |  O  |
    |_____|
    `,
    '404': `
       .-.
      (o o)
      | O \\
     /    \\
    \`----'\`
    `,
    '500': `
       ___
      |[] |
      |===| *BOOM*
      /___ \\
     /      \\
    `
};

export default function Error() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const code = params.get('code') ?? '500';

    const currentArt = asciiArt[code];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 p-6 text-center select-none">
            
            {currentArt && (
                <pre className="font-mono text-green-400 text-xl md:text-2xl leading-snug mb-8 animate-pulse drop-shadow-md">
                    {currentArt}
                </pre>
            )}

            <h1 className="text-7xl md:text-8xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">
                {code}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-md mx-auto">
                {messages[code] ?? 'An unexpected error occurred.'}
            </p>
            
            <button 
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
            >
                Go home
            </button>
        </div>
    );
}