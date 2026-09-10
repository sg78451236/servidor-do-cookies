import {defineConfig, configDefaults} from 'vitest/config'


export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,js,tsx,jsx}'],
    
    exclude: [...configDefaults.exclude, '**/dist/**'],
  }
})
