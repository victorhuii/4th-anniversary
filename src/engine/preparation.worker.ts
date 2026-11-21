import {generateStrokes} from './StrokeGenerator';
import {packStrokes} from './PackedStrokes';

// Transfer full-precision buffers instead of cloning 280,000 objects and strings.
self.onmessage=(event:MessageEvent<Uint8ClampedArray>)=>{
  try {
    const strokes=packStrokes(generateStrokes(event.data));
    self.postMessage({strokes},{transfer:[strokes.geometry.buffer,strokes.times.buffer,strokes.pigments.buffer,strokes.textures.buffer]});
  } catch(error) {
    self.postMessage({error:error instanceof Error?error.message:String(error)});
  }
};
