import {BrushEngine} from './BrushEngine';
import {loadImageField} from './ImageProcessor';
import {WIDTH,HEIGHT,type PastelStroke} from './StrokeGenerator';

interface PreparedPainting {strokes:PastelStroke[];brush:BrushEngine}
let preparation:Promise<PreparedPainting>|undefined;

function calculateStrokes(pixels:Uint8ClampedArray):Promise<PastelStroke[]> {
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('./preparation.worker.ts',import.meta.url),{type:'module'});
    worker.onmessage=(event:MessageEvent<{strokes?:PastelStroke[];error?:string}>)=>{
      worker.terminate();
      if(event.data.strokes)resolve(event.data.strokes);
      else reject(new Error(event.data.error||'Could not prepare the painting'));
    };
    worker.onerror=()=>{worker.terminate();reject(new Error('Could not start the painting worker'));};
    worker.postMessage(pixels,[pixels.buffer as ArrayBuffer]);
  });
}

// One preparation per page session, shared by the landing page and every visit.
// A failure clears the cache so a subsequent visit can retry.
export function preparePainting():Promise<PreparedPainting> {
  if(!preparation) {
    preparation=(async()=>{
      const pixels=await loadImageField('/assets/source/bouquet.png',WIDTH,HEIGHT);
      const strokes=await calculateStrokes(pixels);
      const brush=new BrushEngine();
      // Warm the full texture cache while the note is open. Yielding keeps the
      // page responsive; completed textures remain immutable during playback.
      await brush.prepareAsync(strokes);
      return {strokes,brush};
    })().catch(error=>{preparation=undefined;throw error;});
  }
  return preparation;
}
