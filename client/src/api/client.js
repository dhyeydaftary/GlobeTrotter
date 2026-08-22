const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('globetrotter_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (netErr) {
    throw {
      code: 'NETWORK_ERROR',
      message: netErr.message || 'Failed to connect to server',
      field: null,
    };
  }

  if (!response.ok) {
    let errorObj = {
      code: 'HTTP_ERROR',
      message: `HTTP error ${response.status}: ${response.statusText}`,
      field: null,
    };

    try {
      const data = await response.json();
      if (data && data.error) {
        errorObj = {
          code: data.error.code || 'API_ERROR',
          message: data.error.message || 'An error occurred',
          field: data.error.field || null,
        };
      }
    } catch {
      // Body was not valid JSON
    }

    throw errorObj;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function get(path) {
  return request(path, { method: 'GET' });
}

export function post(path, body) {
  return request(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function patch(path, body) {
  return request(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function del(path) {
  return request(path, { method: 'DELETE' });
}
