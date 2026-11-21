import {DURATION} from './StrokeGenerator';
export class AnimationController {
  private cursor=0;
  constructor(private times:ArrayLike<number>,private draw:(index:number)=>void){}
  reset(){this.cursor=0;}
  advance(elapsed:number) {
    const time=Math.max(0,Math.min(DURATION,elapsed));
    while(this.cursor<this.times.length && this.times[this.cursor]<=time) this.draw(this.cursor++);
    return time>=DURATION;
  }
  get count(){return this.cursor;}
  get total(){return this.times.length;}
}
