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
    const drawn:number[]=[];const animation=new AnimationController(strokes.map(s=>s.scheduledTime),index=>drawn.push(strokes[index].scheduledTime));
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

describe('lossless playback buffers',()=>{
  it('retains exact coordinates, opacity, color, timing and trigonometry',async()=>{
    const {packStrokes,GEOMETRY_STRIDE}=await import('../src/engine/PackedStrokes');
    const strokes=Array.from({length:3},(_,i)=>({x:21.123456789+i,y:42.987654321-i,width:1.900000003,length:3.412345678,angle:.123456789+i,color:i===1?'16,24,32':'8,16,24',opacity:.912345678,textureSeed:i,layer:i,scheduledTime:i*123.456789}));
    const packed=packStrokes(strokes);
    for(let i=0;i<strokes.length;i++){
      const s=strokes[i];
      expect([...packed.geometry.slice(i*GEOMETRY_STRIDE,(i+1)*GEOMETRY_STRIDE)]).toEqual([s.x,s.y,s.width,s.length,Math.cos(s.angle),Math.sin(s.angle),s.opacity]);
      expect(packed.times[i]).toBe(s.scheduledTime);
      expect(packed.colors[packed.pigments[i]]).toBe(s.color);
      expect(packed.textures[i]).toBe(s.textureSeed);
    }
    expect(packed.colors.length).toBe(2);
  });
});
