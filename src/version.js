/* global __APP_VERSION__ */
// Injected at build time by Vite define
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'
