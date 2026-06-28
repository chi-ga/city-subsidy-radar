/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: unknown;
  export default content;
}
