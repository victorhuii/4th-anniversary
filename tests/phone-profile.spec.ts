import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
test('phone rendering profile and full-resolution reference',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const page=await context.newPage();await page.goto('/');
  await expect(page.getByRole('link',{name:'Flowers for you'})).toHaveAttribute('data-flowers-ready','true',{timeout:20000});
  await page.getByRole('link',{name:'Flowers for you'}).click();
  const metrics=await page.evaluate(()=>new Promise<Record<string,number>>(resolve=>{
    let previous=0;const deltas:number[]=[];
    const tick=(now:number)=>{
      const canvas=document.querySelector('canvas')!;
      if(canvas.dataset.state==='painting'&&Number(canvas.dataset.elapsed)>0){if(previous)deltas.push(now-previous);previous=now;}
      if(canvas.dataset.state==='complete'){
        deltas.sort((a,b)=>a-b);
        resolve({duration:Number(canvas.dataset.actualDuration),median:deltas[Math.floor(deltas.length*.5)],p95:deltas[Math.floor(deltas.length*.95)],max:deltas.at(-1)!,frames:deltas.length,width:canvas.width,height:canvas.height,strokes:Number(canvas.dataset.strokes)});
      }else requestAnimationFrame(tick);
    };requestAnimationFrame(tick);
  }));
  const pixels=await page.locator('canvas').evaluate(c=>(c as HTMLCanvasElement).toDataURL('image/png'));
  mkdirSync('verification',{recursive:true});
  const label='after';
  writeFileSync(`verification/phone-${label}.png`,Buffer.from(pixels.split(',')[1],'base64'));
  writeFileSync(`verification/phone-${label}.json`,JSON.stringify(metrics,null,2));
  expect(metrics.strokes).toBe(280427);expect(metrics.width).toBe(1260);expect(metrics.height).toBe(1800);
  await context.close();
});
