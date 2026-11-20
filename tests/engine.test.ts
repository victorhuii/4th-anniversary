import {describe,it,expect} from 'vitest';
import {gaussian,analyze} from '../src/engine/ImageProcessor';
import {seededRandom} from '../src/engine/random';
import {AnimationController} from '../src/engine/AnimationController';
import {DURATION,type PastelStroke} from '../src/engine/StrokeGenerator';
describe('image structure',()=>{
  it('preserves a uniform field through Gaussian convolution, including boundaries',()=>{
    expect([...gaussian(new Float32Array(120).fill(57),12,10,2)]).toEqual(Array(120).fill(57));
  });
  it('aligns strokes with a vertical contour',()=>{
    const data=new Uint8ClampedArray(30*30*4);
    for(let y=0;y<30;y++)for(let x=0;x<30;x++){const i=(y*30+x)*4;data[i]=data[i+1]=data[i+2]=x<15?20:220;data[i+3]=255;}
    expect(analyze(data,30,30,1).angles[15*30+15]).toBeCloseTo(Math.PI/2,4);
  });
});
describe('deterministic playback',()=>{
  it('repeats seeded pigment noise',()=>{
    const a=seededRandom(24),b=seededRandom(24);
    expect(Array.from({length:100},a)).toEqual(Array.from({length:100},b));
  });
  it('catches up after a stalled frame and replays exactly once per stroke',()=>{
    const strokes=[0,100,200,DURATION].map(scheduledTime=>({scheduledTime} as PastelStroke));
    const drawn:number[]=[];const animation=new AnimationController(strokes,s=>drawn.push(s.scheduledTime));
    expect(animation.advance(-10)).toBe(false);expect(drawn).toEqual([0]);
    animation.advance(150);expect(drawn).toEqual([0,100]);
    expect(animation.advance(15000)).toBe(true);expect(drawn).toEqual([0,100,200,DURATION]);
    animation.advance(16000);expect(drawn.length).toBe(4);
    animation.reset();animation.advance(DURATION);expect(drawn.slice(4)).toEqual(drawn.slice(0,4));
  });
});

describe('full-resolution stroke generation',()=>{
  it('schedules the fine pass without exceeding function argument limits',async()=>{
    const {generateStrokes,WIDTH,HEIGHT}=await import('../src/engine/StrokeGenerator');
    const data=new Uint8ClampedArray(WIDTH*HEIGHT*4).fill(120);
    const strokes=generateStrokes(data);
    expect(strokes.length).toBeGreaterThan(200000);
    expect(strokes[0].scheduledTime).toBe(0);
    expect(strokes.at(-1)!.scheduledTime).toBe(DURATION);
    for(let i=1;i<strokes.length;i++)if(strokes[i].scheduledTime<strokes[i-1].scheduledTime)throw new Error('Unsorted stroke schedule');
  });
});
