import {seededRandom} from './random';
import {GEOMETRY_STRIDE,type PackedStrokes} from './PackedStrokes';
interface PigmentSprite {page:HTMLCanvasElement;x:number;y:number}
export class BrushEngine {
  private masks:HTMLCanvasElement[]=[];
  private pigments=new Map<string,PigmentSprite>();
  private sprites:PigmentSprite[]=[];
  private data?:PackedStrokes;
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
  async prepareAsync(strokes:PackedStrokes) {
    this.data=strokes;
    let cursor=0;
    // Message tasks yield to input/rendering without nested setTimeout's 4ms clamp.
    const channel=new MessageChannel();
    let resume:()=>void=()=>{};
    channel.port1.onmessage=()=>resume();
    try {
      while(cursor<strokes.times.length) {
        await new Promise<void>(resolve=>{resume=resolve;channel.port2.postMessage(null);});
        const deadline=performance.now()+4;
        do {
          const color=strokes.pigments[cursor],texture=strokes.textures[cursor];
          const slot=color*8+texture;
          if(!this.sprites[slot])this.sprites[slot]=this.pigment(strokes.colors[color],texture);
          cursor++;
        } while(cursor<strokes.times.length && performance.now()<deadline);
      }
    } finally {channel.port1.close();channel.port2.close();}
  }
  paint(ctx:CanvasRenderingContext2D,index:number,scale:number) {
    const data=this.data!,g=data.geometry,o=index*GEOMETRY_STRIDE;
    const cos=g[o+4]*scale,sin=g[o+5]*scale;
    ctx.setTransform(cos,sin,-sin,cos,g[o]*scale,g[o+1]*scale);
    ctx.globalAlpha=g[o+6];
    const sprite=this.sprites[data.pigments[index]*8+data.textures[index]];
    ctx.drawImage(sprite.page,sprite.x,sprite.y,48,24,-g[o+3]/2,-g[o+2]/2,g[o+3],g[o+2]);
  }
  dispose(){this.pigments.clear();this.masks=[];this.atlases=[];this.sprites=[];this.data=undefined;}
}
