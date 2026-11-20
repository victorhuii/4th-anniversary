import {DURATION,type PastelStroke} from './StrokeGenerator';
export class AnimationController {
  private cursor=0;
  constructor(private strokes:PastelStroke[],private draw:(stroke:PastelStroke)=>void){}
  reset(){this.cursor=0;}
  advance(elapsed:number) {
    const time=Math.max(0,Math.min(DURATION,elapsed));
    while(this.cursor<this.strokes.length && this.strokes[this.cursor].scheduledTime<=time) this.draw(this.strokes[this.cursor++]);
    return time>=DURATION;
  }
  get count(){return this.cursor;}
  get total(){return this.strokes.length;}
}
