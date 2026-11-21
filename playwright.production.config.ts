import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'tests',testMatch:'production.spec.ts',workers:1,timeout:45000,
  use:{baseURL:'http://127.0.0.1:4175/4th-anniversary/',launchOptions:{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']}},
  webServer:{command:'npm run preview -- --port 4175 --base=/4th-anniversary/',url:'http://127.0.0.1:4175/4th-anniversary/',reuseExistingServer:false},
});
