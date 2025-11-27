// FIX: Removed reference to "vite/client" to resolve a "Cannot find type definition file" error, as it's not needed for this project's setup.

// Define Vite's environment variable interface
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// FIX: Relocated the NodeJS.Process type augmentation to backend/src/server.ts. This definition is for the Node.js backend and was not being picked up from this Vite-specific file, causing a type error in backend/src/db.ts.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}