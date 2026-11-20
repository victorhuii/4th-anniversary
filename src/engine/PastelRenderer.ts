import {preparePainting} from './PreparedPainting';
import {WIDTH,HEIGHT,DURATION} from './StrokeGenerator';
import {BrushEngine} from './BrushEngine';
import {AnimationController} from './AnimationController';
export class PastelRenderer {
  private frame=0;private brush?:BrushEngine;private controller?:AnimationController;
  private start=0;private disposed=false;private scale=1;
  finished=false;
  constructor(private canvas:HTMLCanvasElement,private onFinish:()=>void){}
  async prepare(){
    const {strokes,brush}=await preparePainting();
    if(this.disposed)return;
    this.brush=brush;
    // Supersample within a bounded memory budget; normalized stroke geometry is device-independent.
    this.scale=Math.min(2,Math.max(1,devicePixelRatio));
    this.canvas.width=Math.round(WIDTH*this.scale);this.canvas.height=Math.round(HEIGHT*this.scale);
    const ctx=this.canvas.getContext('2d',{alpha:false})!;
    this.controller=new AnimationController(strokes,s=>brush.paint(ctx,s,this.scale));
    this.play();
  }
  play(){
    if(!this.controller||this.disposed)return;
    cancelAnimationFrame(this.frame);this.controller.reset();this.finished=false;
    const ctx=this.canvas.getContext('2d')!;
    ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#090b08';ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.canvas.dataset.state='painting';this.start=performance.now();
    const tick=(now:number)=>{
      if(this.disposed)return;
      const done=this.controller!.advance(now-this.start);
      this.canvas.dataset.elapsed=String(Math.min(DURATION,now-this.start));
      this.canvas.dataset.strokes=String(this.controller!.count);
      if(done){
        this.finished=true;this.canvas.dataset.state='complete';
        this.canvas.dataset.actualDuration=String(performance.now()-this.start);this.onFinish();
      } else this.frame=requestAnimationFrame(tick);
    };
    this.frame=requestAnimationFrame(tick);
  }
  dispose(){this.disposed=true;cancelAnimationFrame(this.frame);this.brush=undefined;this.controller=undefined;}
}
