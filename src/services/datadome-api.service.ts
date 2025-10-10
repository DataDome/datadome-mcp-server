import { Config } from "../config/environment.js";
import { HttpMethod, RequestOptions } from "../types/datadome.types.js";

export class DataDomeApiService {
  constructor(private config: Config['api']) {}

  async get<T>(path: string, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    return this.request<T>("GET", path, options);
  }

  async post<T>(path: string, body: unknown, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    return this.request<T>("POST", path, { ...options, body });
  }

  async put<T>(path: string, body: unknown, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    return this.request<T>("PUT", path, { ...options, body });
  }

  async patch<T>(path: string, body: unknown, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  async delete<T>(path: string, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    return this.request<T>("DELETE", path, options);
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { accept, contentType, body, extraHeaders = {}, params } = options;
    let url = `${this.config.base}${path}`;

    // If params provided, serialize them into a query string
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, String(value));
      }
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      "X-API-Key": this.config.key,
      ...extraHeaders,
      ...(accept !== undefined ? { Accept: accept } : {}),
      ...(contentType !== undefined ? { "Content-Type": contentType } : {})
    };

    const init: RequestInit = {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    };

    const res = await fetch(url, init);
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`DataDome API ${res.status}: ${msg}`);
    }
    return res.json() as Promise<T>;
  }
}
