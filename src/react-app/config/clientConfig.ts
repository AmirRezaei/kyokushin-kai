// Provides a single place to resolve runtime configuration that may
// either be injected at build time (via Vite) or fetched from the worker.

export type ClientConfig = {
   googleClientId?: string;
   apiBaseUrl?: string;
};

const rawBuildTimeConfig: ClientConfig = {
   googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
   apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
};

const sanitizeConfig = (config: ClientConfig): ClientConfig => {
   const normalized: ClientConfig = {...config};
   if (normalized.apiBaseUrl) {
      normalized.apiBaseUrl = normalized.apiBaseUrl.replace(/\/$/, '');
   }
   return normalized;
};

const buildTimeConfig = sanitizeConfig(rawBuildTimeConfig);

let resolvedConfig: ClientConfig | null =
   buildTimeConfig.googleClientId || buildTimeConfig.apiBaseUrl ? {...buildTimeConfig} : null;
let pendingFetch: Promise<ClientConfig> | null = null;

export const getClientConfigSnapshot = (): ClientConfig => {
   return resolvedConfig ? {...resolvedConfig} : {...buildTimeConfig};
};

export const loadClientConfig = async (): Promise<ClientConfig> => {
   if (resolvedConfig) {
      return resolvedConfig;
   }

   if (!pendingFetch) {
      pendingFetch = fetch('/api/v1/public-config', {
         method: 'GET',
         headers: {
            Accept: 'application/json',
         },
      })
         .then(async response => {
            if (!response.ok) {
               throw new Error(`Failed to load client config (${response.status})`);
            }
            const json = (await response.json()) as ClientConfig;
            return {...buildTimeConfig, ...json};
         })
         .then(config => {
            resolvedConfig = sanitizeConfig(config);
            return resolvedConfig;
         })
         .catch(error => {
            pendingFetch = null;
            throw error;
         });
   }

   return pendingFetch;
};

export const clearClientConfigCache = () => {
   resolvedConfig = null;
   pendingFetch = null;
};

export const getApiBaseUrl = (): string => {
   const snapshot = getClientConfigSnapshot();
   const envValue = (snapshot.apiBaseUrl ?? '').trim();
   if (envValue.length > 0) {
      return envValue.replace(/\/$/, '');
   }

   if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
   }

   return '';
};
