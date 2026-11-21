import type {PastelStroke} from './StrokeGenerator';
export const GEOMETRY_STRIDE=7;
export interface PackedStrokes {
  // x, y, width, length, cos(angle), sin(angle), opacity — all full double precision.
  geometry:Float64Array;
  times:Float64Array;
  pigments:Uint16Array;
  textures:Uint8Array;
  colors:string[];
}
export function packStrokes(strokes:PastelStroke[]):PackedStrokes {
  const n=strokes.length,geometry=new Float64Array(n*GEOMETRY_STRIDE),times=new Float64Array(n);
  const pigments=new Uint16Array(n),textures=new Uint8Array(n),colors:string[]=[],palette=new Map<string,number>();
  for(let i=0;i<n;i++){
    const s=strokes[i],offset=i*GEOMETRY_STRIDE;
    geometry[offset]=s.x;geometry[offset+1]=s.y;geometry[offset+2]=s.width;geometry[offset+3]=s.length;
    geometry[offset+4]=Math.cos(s.angle);geometry[offset+5]=Math.sin(s.angle);geometry[offset+6]=s.opacity;
    times[i]=s.scheduledTime;textures[i]=s.textureSeed;
    let id=palette.get(s.color);
    if(id===undefined){id=colors.length;palette.set(s.color,id);colors.push(s.color);}
    pigments[i]=id;
  }
  return {geometry,times,pigments,textures,colors};
}
