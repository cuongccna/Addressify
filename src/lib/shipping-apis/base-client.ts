import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const DEFAULT_TIMEOUT = 8000;
const DEFAULT_MAX_RETRIES = 2;

interface RequestMetadata {
  retryCount: number;
  startTime: number;
}

export type ShippingHttpClient = AxiosInstance;

export interface ShippingClientOptions {
  baseURL: string;
  token?: string;
  shopId?: string;
  timeoutMs?: number;
  maxRetries?: number;
  enableLogging?: boolean;
  defaultHeaders?: Record<string, string>;
  httpClient?: AxiosInstance;
}

export abstract class BaseShippingClient {
  protected readonly http: ShippingHttpClient;

  protected constructor(options: ShippingClientOptions) {
    this.http = createShippingHttpClient(options);
  }

  protected async request<TResponse>(config: AxiosRequestConfig): Promise<TResponse> {
    const response = await this.http.request<TResponse>(config);
    return response.data;
  }

  protected async get<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
    const response = await this.http.get<TResponse>(url, config);
    return response.data;
  }

  protected async post<TResponse>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    const response = await this.http.post<TResponse>(url, data, config);
    return response.data;
  }
}

type EnhancedRequestConfig = InternalAxiosRequestConfig & { metadata?: RequestMetadata };

type CreateClientOptions = ShippingClientOptions;

export function createShippingHttpClient(options: CreateClientOptions): ShippingHttpClient {
  const instance = options.httpClient ??
    axios.create({
      baseURL: options.baseURL,
      timeout: options.timeoutMs ?? DEFAULT_TIMEOUT
    });

  instance.defaults.baseURL = options.baseURL;
  instance.defaults.timeout = options.timeoutMs ?? DEFAULT_TIMEOUT;

  const commonHeaders = instance.defaults.headers as unknown as Record<string, unknown>;

  if (!commonHeaders.Accept) {
    commonHeaders.Accept = "application/json";
  }

  if (!commonHeaders["Content-Type"]) {
    commonHeaders["Content-Type"] = "application/json";
  }

  if (options.defaultHeaders) {
    for (const [key, value] of Object.entries(options.defaultHeaders)) {
      commonHeaders[key] = value;
    }
  }

  if (options.token) {
    commonHeaders.Authorization = `Bearer ${options.token}`;
  }

  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const loggingEnabled = options.enableLogging ?? process.env.NODE_ENV !== "production";

  instance.interceptors.request.use((config) => {
    const enhanced = config as EnhancedRequestConfig;
    enhanced.metadata = {
      retryCount: enhanced.metadata?.retryCount ?? 0,
      startTime: Date.now()
    };

    const headers = AxiosHeaders.from(enhanced.headers ?? {});

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (options.defaultHeaders) {
      for (const [key, value] of Object.entries(options.defaultHeaders)) {
        headers.set(key, value);
      }
    }

    if (options.token) {
      headers.set("Authorization", `Bearer ${options.token}`);
    }

    if (options.shopId) {
      headers.set("ShopId", options.shopId);
    }

    enhanced.headers = headers;

    return enhanced;
  });

  instance.interceptors.response.use(
    (response) => {
      if (loggingEnabled) {
        logSuccess(response);
      }
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as EnhancedRequestConfig | undefined;

      if (loggingEnabled) {
        logError(error);
      }

      if (config && shouldRetry(error) && (config.metadata?.retryCount ?? 0) < maxRetries) {
        config.metadata = config.metadata ?? { retryCount: 0, startTime: Date.now() };
        config.metadata.retryCount += 1;

        const backoffDelay = getBackoffDelay(config.metadata.retryCount);
        await wait(backoffDelay);

        return instance.request(config);
      }

      throw error;
    }
  );

  return instance;
}

function shouldRetry(error: AxiosError): boolean {
  if (error.code === "ECONNABORTED") {
    return true;
  }

  if (!error.response) {
    return true;
  }

  return error.response.status >= 500;
}

function getBackoffDelay(retryCount: number): number {
  const exponent = Math.max(0, retryCount);
  return Math.min(1000 * 2 ** exponent, 5000);
}

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

function logSuccess(response: AxiosResponse): void {
  const enhancedConfig = response.config as EnhancedRequestConfig;
  const duration = enhancedConfig.metadata
    ? Date.now() - enhancedConfig.metadata.startTime
    : undefined;

  const info = [
    `[ShippingAPI] ${response.config.method?.toUpperCase()} ${response.config.url}`,
    `status=${response.status}`,
    duration ? `duration=${duration}ms` : undefined
  ]
    .filter(Boolean)
    .join(" ");

  console.debug(info);
}

function logError(error: AxiosError): void {
  const config = error.config as EnhancedRequestConfig | undefined;
  const duration = config?.metadata ? Date.now() - config.metadata.startTime : undefined;
  const info = [
    `[ShippingAPI] ${config?.method?.toUpperCase()} ${config?.url}`,
    error.response ? `status=${error.response.status}` : undefined,
    duration ? `duration=${duration}ms` : undefined,
    error.message
  ]
    .filter(Boolean)
    .join(" ");

  console.error(info);
}

