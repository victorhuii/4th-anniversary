import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
test('real-time desktop playback, persistent final bitmap, keyboard replay',async({page})=>{
  mkdirSync('verification',{recursive:true});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1280,height:1000});await page.goto('/#flowers');
  const canvas=page.locator('canvas');await expect(canvas).toHaveAttribute('data-state','painting');
  const samples=[];
  for(const t of [0,500,1000,2000,3000,4000,5000,6000,7000,8000,8566]){
    await page.waitForFunction(t=>Number(document.querySelector('canvas')?.getAttribute('data-elapsed'))>=t,t);
    samples.push({requested:t,elapsed:Number(await canvas.getAttribute('data-elapsed')),strokes:Number(await canvas.getAttribute('data-strokes'))});
    await canvas.screenshot({path:`verification/painting-${t}.png`});
  }
  await expect(canvas).toHaveAttribute('data-state','complete');
  const duration=Number(await canvas.getAttribute('data-actual-duration'));
  // Screenshot capture can pause rendering; the uninterrupted test owns the timing bound.
  expect(duration).toBeGreaterThanOrEqual(8566);
  const completed=await canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL());
  await page.waitForTimeout(400);expect(await canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL())).toBe(completed);
  await page.screenshot({path:'verification/desktop.png'});
  await canvas.focus();await page.keyboard.press('Enter');
  await expect(canvas).toHaveAttribute('data-state','painting');
  await expect(canvas).toHaveAttribute('data-state','complete',{timeout:11000});
  expect(await canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL())).toBe(completed);
  expect(errors).toEqual([]);
  writeFileSync('verification/timing.json',JSON.stringify({duration,samples,errors},null,2));
});
test('mobile portrait fits, touch replay works at DPR 3',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const page=await context.newPage();await page.goto('/#flowers');
  const canvas=page.locator('canvas');await expect(canvas).toHaveAttribute('data-state','complete',{timeout:20000});
  const variation=await canvas.evaluate(c=>{
    const ctx=(c as HTMLCanvasElement).getContext('2d')!;
    const a=ctx.getImageData(50,50,1,1).data,b=ctx.getImageData(600,1000,1,1).data;
    return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);
  });
  expect(variation).toBeGreaterThan(30);
  const bounds=await canvas.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(390);
  expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({path:'verification/mobile.png'});
  await canvas.tap();await expect(canvas).toHaveAttribute('data-state','painting');await context.close();
});
test('uninterrupted playback timing and frame cadence',async({page})=>{
  await page.goto('/#flowers');
  const metrics=await page.evaluate(()=>new Promise<Record<string,number>>(resolve=>{
    let previous=0;const deltas:number[]=[];
    const tick=(now:number)=>{
      const canvas=document.querySelector('canvas')!;
      if(canvas.dataset.state==='painting' && Number(canvas.dataset.elapsed)>0){
        if(previous)deltas.push(now-previous);previous=now;
      }
      if(canvas.dataset.state==='complete'){
        deltas.sort((a,b)=>a-b);
        resolve({duration:Number(canvas.dataset.actualDuration),medianFrameMs:deltas[Math.floor(deltas.length*.5)],p95FrameMs:deltas[Math.floor(deltas.length*.95)],maxFrameMs:deltas.at(-1)!,frames:deltas.length});
      }else requestAnimationFrame(tick);
    };requestAnimationFrame(tick);
  }));
  expect(metrics.duration).toBeGreaterThanOrEqual(8566);expect(metrics.duration).toBeLessThan(8800);
  writeFileSync('verification/performance.json',JSON.stringify(metrics,null,2));
});

test('anniversary note opens flowers and browser back restores the note',async({page})=>{
  mkdirSync('verification',{recursive:true});
  for(const viewport of [{width:1280,height:1000},{width:390,height:844}]){
    await page.setViewportSize(viewport);await page.goto('/');
    await expect(page.getByRole('heading',{name:'Happy 4th anniversary, my love.'})).toBeVisible();
    const snoopy=page.getByRole('img',{name:'Snoopy smiling and holding a colorful bunch of flowers'});
    await expect(snoopy).toBeVisible();
    expect(await snoopy.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBe(736);
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.screenshot({path:`verification/anniversary-${viewport.width}.png`,fullPage:true});
    await page.getByRole('link',{name:'Flowers for you'}).click();
    await expect(page).toHaveURL(/#flowers$/);
    await expect(page.locator('canvas')).toHaveAttribute('data-state','painting',{timeout:15000});
    await expect(page.getByRole('link',{name:'Back to your note'})).toBeFocused();
    await page.goBack();
    await expect(page.getByRole('heading',{name:'Happy 4th anniversary, my love.'})).toBeFocused();
  }
});
test('flowers prepare in the background and open promptly on repeat visits',async({page})=>{
  const workerFinished=page.waitForEvent('worker').then(worker=>worker.waitForEvent('close'));
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Happy 4th anniversary, my love.'})).toBeVisible();
  await workerFinished;
  await expect(page.getByRole('link',{name:'Flowers for you'})).toHaveAttribute('data-flowers-ready','true',{timeout:15000});
  const latencies:number[]=[];
  for(let visit=0;visit<2;visit++){
    await page.getByRole('link',{name:'Flowers for you'}).evaluate(button=>button.addEventListener('click',()=>{
      sessionStorage.setItem('flowerClickStart',String(performance.now()));
    },{once:true}));
    await page.getByRole('link',{name:'Flowers for you'}).click();
    await page.waitForFunction(()=>Number(document.querySelector('canvas')?.getAttribute('data-strokes'))>0);
    latencies.push(await page.evaluate(()=>performance.now()-Number(sessionStorage.getItem('flowerClickStart'))));
    await expect(page.getByRole('status')).toHaveCount(0);
    await page.getByRole('link',{name:'Back to your note'}).click();
  }
  expect(latencies[0]).toBeLessThan(700);
  expect(latencies[1]).toBeLessThan(700);
  mkdirSync('verification',{recursive:true});
  writeFileSync('verification/startup.json',JSON.stringify({warmClickToFirstStrokeMs:latencies},null,2));
});
