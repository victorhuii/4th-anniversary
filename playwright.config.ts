import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests',testMatch:'*.spec.ts',workers:1,use:{baseURL:'http://127.0.0.1:5174',launchOptions:{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']}},webServer:{command:'npm run dev -- --port 5174',url:'http://127.0.0.1:5174',reuseExistingServer:true},timeout:60000});
