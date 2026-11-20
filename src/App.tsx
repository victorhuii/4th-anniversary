import {useEffect,useRef,useState} from 'react';
import {PastelCanvas} from './components/PastelCanvas';

function Heart({className=''}:{className?:string}) {
  return <svg className={className} viewBox="0 0 40 36" fill="none" aria-hidden="true"><path d="M20 32C15 28 3 20 3 11 3 2 15 1 20 10 25 0 37 3 37 12 37 20 26 29 20 32Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Flower() {
  return <svg viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M14 9C7-1 2 8 9 13 0 16 6 25 12 19 15 29 24 22 19 16 29 14 23 5 17 10 20 1 10 0 14 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
export default function App(){
  const [flowers,setFlowers]=useState(()=>window.location.hash==='#flowers');
  const title=useRef<HTMLHeadingElement>(null),back=useRef<HTMLAnchorElement>(null);
  const navigated=useRef(false);
  useEffect(()=>{
    const change=()=>{navigated.current=true;setFlowers(window.location.hash==='#flowers');window.scrollTo(0,0);};
    window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);
  },[]);
  useEffect(()=>{
    document.title=flowers?'Flowers for you · Happy 4th anniversary':'Happy 4th anniversary, my love';
    if(navigated.current)(flowers?back.current:title.current)?.focus({preventScroll:true});
  },[flowers]);
  if(flowers)return <div className="flowers-page">
    <a ref={back} className="back-link" href="#">Back to your note</a>
    <PastelCanvas/>
    <span className="flowers-signature">a little bouquet, a whole lot of love.</span>
  </div>;
  return <main className="anniversary-page">
    <article className="love-letter" aria-labelledby="anniversary-title">
      <header className="letter-header"><span>four years of us</span><Heart/></header>
      <div className="letter-body">
        <figure className="snoopy-portrait">
          <div className="snoopy-image"><img src="/assets/snoopy-flowers.jpeg" width="736" height="736" alt="Snoopy smiling and holding a colorful bunch of flowers" fetchPriority="high"/></div>
          <figcaption>still picking you.</figcaption>
          <Heart className="portrait-heart"/>
        </figure>
        <div className="letter-copy">
          <h1 ref={title} tabIndex={-1} id="anniversary-title">Happy 4th<br/><em>anniversary,</em><br/>my love.</h1>
          <div className="note">
            <p>Thank you for being here with me. For the big days, the quiet days, and all the wonderfully uneventful ones in between.</p>
            <p>Thank you for dilly-dallying with me, for making the little things feel like something, and for being my favorite person to do absolutely nothing with.</p>
            <p>Four years in, and I’d still pick you. Every time.</p>
          </div>
          <p className="sign-off">i love you. always.</p>
          <a className="flowers-button" href="#flowers">Flowers for you <Flower/></a>
        </div>
      </div>
      <footer className="letter-footer"><span>you & me</span><span>and all the little things.</span></footer>
    </article>
  </main>;
}
