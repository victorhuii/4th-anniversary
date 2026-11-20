import { seededRandom } from './random';
import { analyze } from './ImageProcessor';
export const WIDTH=630, HEIGHT=900, DURATION=8566;
export interface PastelStroke {
  x:number;y:number;width:number;length:number;angle:number;color:string;
  opacity:number;textureSeed:number;layer:number;scheduledTime:number;
}
export const PASSES=[
  {size:29,step:15,start:0,end:2350,sigma:6},
  {size:15,step:8,start:2350,end:4050,sigma:3},
  {size:7.5,step:4.3,start:4050,end:6050,sigma:1.6},
  {size:1.9,step:1.55,start:6050,end:DURATION,sigma:.7},
];
export function generateStrokes(pixels:Uint8ClampedArray,seed=9247):PastelStroke[] {
  const random=seededRandom(seed),strokes:PastelStroke[]=[];
  PASSES.forEach((pass,layer)=>{
    // Analyze at half resolution. Fine source pixels remain full resolution.
    const w=315,h=450,small=new Uint8ClampedArray(w*h*4);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
      const a=(y*w+x)*4,b=((y*2)*WIDTH+x*2)*4;
      for(let k=0;k<4;k++)small[a+k]=pixels[b+k];
    }
    const field=analyze(small,w,h,pass.sigma);
    const batch:PastelStroke[]=[];
    for(let y=0;y<HEIGHT+pass.step;y+=pass.step) for(let x=0;x<WIDTH+pass.step;x+=pass.step) {
      const px=Math.max(0,Math.min(WIDTH-1,x+(random()-.5)*pass.step));
      const py=Math.max(0,Math.min(HEIGHT-1,y+(random()-.5)*pass.step));
      const i=(Math.floor(py)*WIDTH+Math.floor(px))*4;
      const jitter=(random()-.5)*(layer<2?7:3);
      // Small quantization enables reusable pigment sprites; no image is drawn to the visible canvas.
      const rgb=[0,1,2].map(k=>Math.max(0,Math.min(255,Math.round((pixels[i+k]+jitter)/8)*8)));
      batch.push({x:px,y:py,width:pass.size*(.8+random()*.4),length:pass.size*(1.25+random()*.7),
        angle:field.angles[Math.min(h-1,Math.floor(py/2))*w+Math.min(w-1,Math.floor(px/2))]+(random()-.5)*.55,
        color:rgb.join(','),opacity:layer===0?.96:.86+random()*.14,
        textureSeed:Math.floor(random()*8),layer,scheduledTime:0});
    }
    // Spatially scattered marks, as in the recorded renderer, rather than a scan-line reveal.
    for(let i=batch.length-1;i>0;i--) {const j=Math.floor(random()*(i+1));[batch[i],batch[j]]=[batch[j],batch[i]];}
    batch.forEach((s,i)=>{
      // First few isolated marks linger, then broad coverage accelerates.
      const fraction=i/(batch.length-1);
      s.scheduledTime=pass.start+(pass.end-pass.start)*(layer===0?Math.pow(fraction,.66):fraction);
    });
    for(const stroke of batch) strokes.push(stroke);
  });
  return strokes;
}
