export interface ImageField { width:number; height:number; pixels:Uint8ClampedArray; angles:Float32Array }
// Separable Gaussian convolution, clamped at the paper boundary.
export function gaussian(input:Float32Array,w:number,h:number,sigma:number) {
  const radius=Math.ceil(sigma*2.5), k=new Float32Array(radius*2+1);
  let total=0;
  for(let i=-radius;i<=radius;i++) total+=k[i+radius]=Math.exp(-i*i/(2*sigma*sigma));
  for(let i=0;i<k.length;i++) k[i]/=total;
  const temp=new Float32Array(input.length), out=new Float32Array(input.length);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    let v=0;for(let j=-radius;j<=radius;j++) v+=input[y*w+Math.max(0,Math.min(w-1,x+j))]*k[j+radius];
    temp[y*w+x]=v;
  }
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    let v=0;for(let j=-radius;j<=radius;j++) v+=temp[Math.max(0,Math.min(h-1,y+j))*w+x]*k[j+radius];
    out[y*w+x]=v;
  }
  return out;
}
export function analyze(pixels:Uint8ClampedArray,width:number,height:number,sigma:number):ImageField {
  const n=width*height, lum=new Float32Array(n);
  for(let i=0;i<n;i++) lum[i]=pixels[i*4]*.299+pixels[i*4+1]*.587+pixels[i*4+2]*.114;
  const blurred=gaussian(lum,width,height,sigma);
  const xx=new Float32Array(n),xy=new Float32Array(n),yy=new Float32Array(n);
  for(let y=1;y<height-1;y++) for(let x=1;x<width-1;x++) {
    const i=y*width+x,gx=blurred[i+1]-blurred[i-1],gy=blurred[i+width]-blurred[i-width];
    xx[i]=gx*gx;xy[i]=gx*gy;yy[i]=gy*gy;
  }
  const a=gaussian(xx,width,height,Math.max(1,sigma*.8));
  const b=gaussian(xy,width,height,Math.max(1,sigma*.8));
  const c=gaussian(yy,width,height,Math.max(1,sigma*.8));
  const angles=new Float32Array(n);
  for(let i=0;i<n;i++) angles[i]=.5*Math.atan2(2*b[i],a[i]-c[i])+Math.PI/2;
  return {width,height,pixels,angles};
}
export async function loadImageField(url:string,width:number,height:number) {
  const image=new Image();image.src=url;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
  ctx.drawImage(image,0,0,width,height);
  return ctx.getImageData(0,0,width,height).data;
}
