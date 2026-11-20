import {useEffect,useRef,useState} from 'react';
import {PastelRenderer} from '../engine/PastelRenderer';
export function PastelCanvas(){
  const canvas=useRef<HTMLCanvasElement>(null),renderer=useRef<PastelRenderer|null>(null);
  const [finished,setFinished]=useState(false),[error,setError]=useState(false),[preparing,setPreparing]=useState(true);
  useEffect(()=>{
    const painting=new PastelRenderer(canvas.current!,()=>setFinished(true));renderer.current=painting;
    let active=true;
    painting.prepare().then(()=>{if(active)setPreparing(false);}).catch(()=>{if(active){setPreparing(false);setError(true);}});
    return()=>{active=false;painting.dispose();};
  },[]);
  const replay=()=>{if(renderer.current?.finished){setFinished(false);renderer.current.play();}};
  return <main className="painting-stage" aria-label="Pastel bouquet painting">
    <canvas ref={canvas} width={630} height={900} role="button" tabIndex={0}
      aria-label={finished?'Finished pastel bouquet. Activate to paint again.':'A pastel bouquet being painted, stroke by stroke.'}
      aria-disabled={!finished} onClick={replay} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();replay();}}}/>
    {preparing&&<p className="preparing-note" role="status">Picking your flowers…</p>}
    {error&&<p role="alert">The painting could not load. Please refresh to try again.</p>}
  </main>;
}
