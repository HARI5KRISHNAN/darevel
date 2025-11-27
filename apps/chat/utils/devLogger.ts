// Development logging utilities
// Only logs in development mode to avoid console pollution in production

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const devLog = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};

export const devError = (...args: any[]) => {
  if (isDev) {
    console.error(...args);
  }
};

export const devWarn = (...args: any[]) => {
  if (isDev) {
    console.warn(...args);
  }
};

// Always log errors (can't be disabled)
export const logError = (...args: any[]) => {
  console.error(...args);
};
