/**
 * MT API Client Utility
 *
 * Features:
 * - Auto-detect site root path from <meta name="site-root"> tag
 * - GET request with timeout (AbortController)
 * - getWithRetry() with classified errors and retry for network/5xx/timeout
 * - Reusable across all pages and blogs
 *
 * Error shape:
 *   { type: 'network'|'timeout'|'http'|'parse'|'abort', status, message }
 *
 * Usage:
 *   const client = new MTApiClient();
 *   const data = await client.get('api/news-list.json');
 *   const data = await client.getWithRetry('api/news-list.json', { retries: 2 });
 */

class MTApiClient {
  constructor(options = {}) {
    this.siteRoot = this._detectSiteRoot();
    this.apiBase = `${this.siteRoot}api`;
    this.defaultTimeout = options.timeout || 10000;
  }

  /**
   * Detect site root path from meta tag or pathname.
   * Priority: <meta name="site-root"> > auto-detect from URL pathname.
   */
  _detectSiteRoot() {
    const metaTag = document.querySelector('meta[name="site-root"]');
    if (metaTag && metaTag.content) {
      return metaTag.content;
    }

    const pathname = window.location.pathname;

    if (pathname.startsWith('/renew/')) {
      const match = pathname.match(/^(\/renew\/[^\/]+\/)/);
      if (match) {
        return match[1];
      }
      return '/renew/';
    }

    const match = pathname.match(/^(\/[^\/]+\/)/);
    if (match) {
      return match[1];
    }

    return '/';
  }

  /**
   * Resolve endpoint to full URL.
   */
  _resolveUrl(endpoint) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    if (endpoint.startsWith('/api/')) {
      return `${this.siteRoot}${endpoint.substring(1)}`;
    }
    if (endpoint.startsWith('api/')) {
      return `${this.siteRoot}${endpoint}`;
    }
    return endpoint;
  }

  /**
   * Build a classified error object.
   */
  _makeError(type, status, message, cause) {
    const err = new Error(message);
    err.type = type;
    err.status = status || 0;
    err.cause = cause;
    return err;
  }

  /**
   * GET request with timeout and error classification.
   * @param {string} endpoint
   * @param {object} options - { timeout, headers, signal }
   * @returns {Promise<object>}
   */
  async get(endpoint, options = {}) {
    const url = this._resolveUrl(endpoint);
    const timeout = options.timeout || this.defaultTimeout;

    // Allow caller to pass their own AbortSignal; chain with timeout signal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    if (options.signal) {
      if (options.signal.aborted) {
        clearTimeout(timeoutId);
        throw this._makeError('abort', 0, 'Request aborted by caller');
      }
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    };

    let response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        if (options.signal && options.signal.aborted) {
          throw this._makeError('abort', 0, 'Request aborted', err);
        }
        throw this._makeError('timeout', 0, `Request timed out after ${timeout}ms`, err);
      }
      throw this._makeError('network', 0, err.message || 'Network error', err);
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw this._makeError(
        'http',
        response.status,
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    try {
      return await response.json();
    } catch (err) {
      throw this._makeError('parse', response.status, 'Failed to parse JSON response', err);
    }
  }

  /**
   * GET with retry for transient failures (network / timeout / 5xx).
   * Does NOT retry 4xx or parse errors.
   *
   * @param {string} endpoint
   * @param {object} options - { retries, retryDelay, timeout, headers, signal }
   * @returns {Promise<object>}
   */
  async getWithRetry(endpoint, options = {}) {
    const retries = options.retries != null ? options.retries : 2;
    const baseDelay = options.retryDelay || 500;

    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.get(endpoint, options);
      } catch (err) {
        lastError = err;

        const isRetriable =
          err.type === 'network' ||
          err.type === 'timeout' ||
          (err.type === 'http' && err.status >= 500);

        if (!isRetriable || attempt === retries) {
          throw err;
        }

        // Exponential backoff: 500ms, 1000ms, 2000ms, ...
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Full URL for an endpoint (debugging).
   */
  getFullUrl(endpoint) {
    return this._resolveUrl(endpoint);
  }

  /**
   * Log config for debugging.
   */
  logConfig() {
    console.log('MT API Client Config:', {
      siteRoot: this.siteRoot,
      apiBase: this.apiBase,
      defaultTimeout: this.defaultTimeout,
      currentPath: window.location.pathname,
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MTApiClient;
}
