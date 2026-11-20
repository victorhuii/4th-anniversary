import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests',testMatch:'*.spec.ts',workers:1,use:{baseURL:'http://127.0.0.1:5175',launchOptions:{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']}},webServer:{command:'npm run dev -- --port 5175',url:'http://127.0.0.1:5175',reuseExistingServer:true},timeout:60000});
