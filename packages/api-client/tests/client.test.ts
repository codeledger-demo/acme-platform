import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AcmeClient } from '../src/client.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('AcmeClient', () => {
  let client: AcmeClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new AcmeClient({ baseUrl: 'https://api.acme.test', authToken: 'tok_123' });
  });

  it('sends GET requests with auth header', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: { id: 1 }, status: 200, message: 'ok', timestamp: '' }));
    const res = await client.get('/items');
    expect(res.data).toEqual({ id: 1 });
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.acme.test/items');
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer tok_123');
  });

  it('sends POST with JSON body', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: { created: true }, status: 201, message: 'created', timestamp: '' }));
    await client.post('/items', { name: 'thing' });
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'thing' }));
  });

  it('throws AppError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ code: 'NOT_FOUND', message: 'Not found' }, 404));
    await expect(client.get('/missing')).rejects.toThrow('Not found');
  });

  it('throws AppError on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(client.get('/down')).rejects.toThrow('Network request failed');
  });

  it('applies request interceptors', async () => {
    client.addRequestInterceptor((_url, init) => ({
      ...init,
      headers: { ...init.headers as Record<string, string>, 'X-Custom': 'yes' },
    }));
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: null, status: 200, message: 'ok', timestamp: '' }));
    await client.get('/test');
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['X-Custom']).toBe('yes');
  });
});
