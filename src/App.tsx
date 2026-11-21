import {useEffect,useRef,useState} from 'react';
import {PastelCanvas} from './components/PastelCanvas';
import {preparePainting} from './engine/PreparedPainting';

function Heart({className=''}:{className?:string}) {
  return <svg className={className} viewBox="0 0 40 36" fill="none" aria-hidden="true"><path d="M20 32C15 28 3 20 3 11 3 2 15 1 20 10 25 0 37 3 37 12 37 20 26 29 20 32Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Pumpkin({kind='classic'}:{kind?:'classic'|'golden'|'sage'}) {
  return <span className={`pumpkin pumpkin--${kind}`} aria-hidden="true">
    <span className="pumpkin-stem"/><span className="pumpkin-leaf"/>
    <span className="pumpkin-lobe pumpkin-lobe--left"/>
    <span className="pumpkin-lobe pumpkin-lobe--right"/>
    <span className="pumpkin-lobe pumpkin-lobe--middle"/>
  </span>;
}
function Flower() {
  return <svg viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M14 9C7-1 2 8 9 13 0 16 6 25 12 19 15 29 24 22 19 16 29 14 23 5 17 10 20 1 10 0 14 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
export default function App(){
  const [flowers,setFlowers]=useState(false);
  const [flowersReady,setFlowersReady]=useState(false);
  const title=useRef<HTMLHeadingElement>(null),back=useRef<HTMLAnchorElement>(null);
  const navigated=useRef(false);
  useEffect(()=>{
    // Fresh visits and reloads always open the note, including a saved flower URL.
    if(window.location.hash==='#flowers')window.history.replaceState(window.history.state,'',window.location.pathname+window.location.search);
    // Let the letter paint first, then prepare the flowers while it is being read.
    let active=true;
    const task=setTimeout(()=>{
      void preparePainting().then(()=>{if(active)setFlowersReady(true);}).catch(()=>{});
    },0);
    return()=>{active=false;clearTimeout(task);};
  },[]);
  useEffect(()=>{
    const change=()=>{navigated.current=true;setFlowers(window.location.hash==='#flowers');window.scrollTo(0,0);};
    window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);
  },[]);
  useEffect(()=>{
    document.title=flowers?'Flowers for you · Happy four months':'Happy four months, my love';
    if(navigated.current)(flowers?back.current:title.current)?.focus({preventScroll:true});
  },[flowers]);
  if(flowers)return <div className="flowers-page">
    <a ref={back} className="back-link" href="#">Back to your note</a>
    <PastelCanvas/>
    <span className="flowers-signature">for my favorite person, in every season.</span>
  </div>;
  return <main className="anniversary-page">
    <article className="love-letter" aria-labelledby="anniversary-title">
      <header className="letter-header"><span>four months, forever thankful</span><Heart/></header>
      <div className="letter-body">
        <figure className="snoopy-portrait">
          <div className="snoopy-image"><img src="/assets/snoopy-flowers.jpeg" width="736" height="736" alt="Snoopy smiling and holding a colorful bunch of flowers" fetchPriority="high"/></div>
          <div className="pumpkin-patch" aria-hidden="true"><Pumpkin kind="sage"/><Pumpkin/><Pumpkin kind="golden"/></div>
          <figcaption>my favorite little pumpkin.</figcaption>
          <Heart className="portrait-heart"/>
        </figure>
        <div className="letter-copy">
          <h1 ref={title} tabIndex={-1} id="anniversary-title">Happy four<br/><em>months,</em><br/>my love.</h1>
          <div className="note">
            <p>This Thanksgiving, I’m extra thankful for you. For being here with me through the big days, the quiet days, and all the wonderfully uneventful ones in between.</p>
            <p>Thank you for dilly-dallying with me, for making the little things feel like something, and for being my favorite person to do absolutely nothing with.</p>
            <p>Four months in, and I’d still pick you. Every time.</p>
          </div>
          <p className="sign-off">i love you. always.</p>
          <a className="flowers-button" data-flowers-ready={flowersReady} href="#flowers">Flowers for you <Flower/></a>
        </div>
      </div>
      <footer className="letter-footer"><span>thankful for us</span><span>this season & every season.</span></footer>
    </article>
  </main>;
}
