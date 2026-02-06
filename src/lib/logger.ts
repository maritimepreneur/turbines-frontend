/**
 * Logger Utility
 * Only logs in development environment to prevent console clutter in production
 * and avoid potential security risks from logging sensitive data
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
    /**
     * Log HTTP requests (only in development)
     */
    request: (method: string, url: string) => {
        if (isDevelopment) {
            console.log(`📤 ${method.toUpperCase()} ${url}`);
        }
    },

    /**
     * Log HTTP responses (only in development)
     */
    response: (status: number, url?: string) => {
        if (isDevelopment) {
            console.log(`📥 ${status}${url ? ` ${url}` : ''}`);
        }
    },

    /**
     * Log errors (always log, but sanitize sensitive data)
     */
    error: (message: string, error?: any) => {
        console.error(`❌ ${message}`, {
            message: error?.message,
            status: error?.response?.status,
            // Don't log full error object to avoid leaking sensitive data
        });
    },

    /**
     * Log warnings (only in development)
     */
    warn: (message: string, data?: any) => {
        if (isDevelopment) {
            console.warn(`⚠️ ${message}`, data);
        }
    },

    /**
     * Log info (only in development)
     */
    info: (message: string, data?: any) => {
        if (isDevelopment) {
            console.log(`ℹ️ ${message}`, data);
        }
    },

    /**
     * Log success (only in development)
     */
    success: (message: string, data?: any) => {
        if (isDevelopment) {
            console.log(`✅ ${message}`, data);
        }
    },
};
