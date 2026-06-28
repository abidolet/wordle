let accessToken: string | null = null;

export function setToken(token: string) 
{
	accessToken = token;
	sessionStorage.setItem('auth', '1');
}

export function getToken(): string | null 
{
	return accessToken;
}

export function clearToken() 
{
	accessToken = null;
	sessionStorage.removeItem('auth');
}

async function tryRefresh(): Promise<boolean> 
{
	const res = await fetch('/api/auth/refresh',
		{
			method: 'POST',
			credentials: 'include',
		});

	if (!res.ok) 
	{
		clearToken();
		return false;
	}
	
	const data = await res.json();
	setToken(data.accessToken);
	return true;
}

export async function apiFetch(url: string, options: RequestInit = {}):
	Promise<Response> 
{
	const res = await fetch(url,{
		...options,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
			...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
		},
	});

	if (res.status === 401) 
	{
		const ok = await tryRefresh();
		if (ok) 
		{
			return apiFetch(url, options);
		}

		clearToken();
		window.location.href = '/error?code=500';
	}
	else if (res.status >= 402)
	{
		window.location.href = '/error?code=' + res.status;
	}

	return res;
}

export async function checkAuth(): Promise<boolean> 
{
	if (accessToken) 
	{
		return true;
	}
	if (!sessionStorage.getItem('auth')) 
	{
		return false;
	}

	return tryRefresh();
}
