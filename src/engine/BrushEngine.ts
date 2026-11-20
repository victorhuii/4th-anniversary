import {seededRandom} from './random';
import type {PastelStroke} from './StrokeGenerator';
export class BrushEngine {
  private masks:HTMLCanvasElement[]=[];
  private pigments=new Map<string,{page:HTMLCanvasElement;x:number;y:number}>();
  private atlases:HTMLCanvasElement[]=[];
  private scratch=document.createElement('canvas');
  private scratchContext:CanvasRenderingContext2D;
  private slot=0;
  constructor() {
    this.scratch.width=48;this.scratch.height=24;
    this.scratchContext=this.scratch.getContext('2d')!;
    for(let variant=0;variant<8;variant++) {
      const random=seededRandom(810+variant),c=document.createElement('canvas');c.width=48;c.height=24;
      const ctx=c.getContext('2d')!;
      ctx.fillStyle='white';ctx.beginPath();
      // A torn, dragged stick of pigment, with irregular shoulders and ends.
      ctx.moveTo(2,8);
      for(let x=3;x<=44;x+=3) ctx.lineTo(x,3+random()*3);
      ctx.lineTo(47,10);ctx.lineTo(44,18);
      for(let x=42;x>=3;x-=3) ctx.lineTo(x,18+random()*3);
      ctx.closePath();ctx.fill();
      ctx.globalCompositeOperation='destination-out';
      for(let i=0;i<180;i++) {
        ctx.globalAlpha=.15+random()*.65;
        ctx.fillRect(random()*48,random()*24,.35+random()*1.1,.35+random()*.8);
      }
      // Long shallow scratches follow the movement of the pastel.
      for(let i=0;i<10;i++) {
        ctx.globalAlpha=.12+random()*.15;ctx.fillRect(random()*20,3+random()*18,5+random()*22,.3+random()*.4);
      }
      this.masks.push(c);
    }
  }
  private pigment(color:string,variant:number) {
    const key=color+'/'+variant;
    let sprite=this.pigments.get(key);
    if(!sprite) {
      const columns=42,rows=85,perPage=columns*rows;
      const pageIndex=Math.floor(this.slot/perPage),local=this.slot%perPage;
      if(!this.atlases[pageIndex]) {
        const page=document.createElement('canvas');page.width=columns*48;page.height=rows*24;
        this.atlases.push(page);
      }
      const page=this.atlases[pageIndex],x=(local%columns)*48,y=Math.floor(local/columns)*24;
      const ctx=this.scratchContext;
      ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,48,24);
      ctx.drawImage(this.masks[variant],0,0);
      ctx.globalCompositeOperation='source-in';ctx.fillStyle=`rgb(${color})`;ctx.fillRect(0,0,48,24);
      page.getContext('2d')!.drawImage(this.scratch,x,y);
      sprite={page,x,y};this.pigments.set(key,sprite);this.slot++;
    }
    return sprite;
  }
  prepare(strokes:PastelStroke[]) {
    for(const stroke of strokes)this.pigment(stroke.color,stroke.textureSeed);
  }
  paint(ctx:CanvasRenderingContext2D,s:PastelStroke,scale:number) {
    const cos=Math.cos(s.angle)*scale,sin=Math.sin(s.angle)*scale;
    ctx.setTransform(cos,sin,-sin,cos,s.x*scale,s.y*scale);
    ctx.globalAlpha=s.opacity;
    const sprite=this.pigment(s.color,s.textureSeed);
    ctx.drawImage(sprite.page,sprite.x,sprite.y,48,24,-s.length/2,-s.width/2,s.length,s.width);
  }
  dispose(){this.pigments.clear();this.masks=[];this.atlases=[];}
}
