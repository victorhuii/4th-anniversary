import {generateStrokes} from './StrokeGenerator';

// Keep convolution, gradient analysis and stroke allocation off the UI thread.
self.onmessage=(event:MessageEvent<Uint8ClampedArray>)=>{
  try {
    self.postMessage({strokes:generateStrokes(event.data)});
  } catch(error) {
    self.postMessage({error:error instanceof Error?error.message:String(error)});
  }
};
