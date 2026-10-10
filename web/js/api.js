export function createApi(endpoint, fetcher = fetch) {
  let url;
  if (endpoint) {
    url = new URL(endpoint);
    if (url.username || url.password || url.search || url.hash ||
      (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname)))) throw new Error('invalid_endpoint');
  }
  return {
    configured: Boolean(url),
    async call(action, payload = {}) {
      if (!url) throw new Error('not_configured');
      let response;
      try { response = await fetcher(url.href,{method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,action}),signal:AbortSignal.timeout(15000)}); }
      catch { throw new Error('service_unavailable'); }
      let data;
      try { data = await response.json(); } catch { throw new Error('service_unavailable'); }
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'service_unavailable');
      return data;
    },
  };
}
