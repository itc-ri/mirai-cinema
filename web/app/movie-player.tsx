'use client';
import {forwardRef,useEffect,useImperativeHandle,useRef,useState} from 'react';

const sources:Record<string,string>={
 '1QOA3MVpYjMQCGzGpW2ble3LzRxYbHrw9':'/videos/mobility-onsen.mp4',
 '1RL_hz5r5c_beKwgBrwIgOGVcG5VU2d5M':'/videos/family-robots.mp4'
};
export type PlayerHandle={play:()=>void};
type Movie={id:string;title:string;driveFileId:string;resourceKey:string;thumbnailKey:string};
const time=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;

export const MoviePlayer=forwardRef<PlayerHandle,{movie:Movie;onFirstPlay:()=>void}>(function MoviePlayer({movie,onFirstPlay},ref){
 const counted=useRef(false);
 const [full,setFull]=useState(false);
 useEffect(()=>{const update=()=>setFull(document.fullscreenElement===box.current);document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update)},[]);
 const video=useRef<HTMLVideoElement>(null),box=useRef<HTMLDivElement>(null),alive=useRef(true);
 const [playing,setPlaying]=useState(false),[muted,setMuted]=useState(false),[position,setPosition]=useState(0),[duration,setDuration]=useState(0),[message,setMessage]=useState(''),[waiting,setWaiting]=useState(false);
 const source=sources[movie.driveFileId];
 function play(){const el=video.current;if(!el)return;setMessage('');setWaiting(true);void el.play().catch((error:DOMException)=>{if(!alive.current||error.name==='AbortError')return;setWaiting(false);setMessage(error.name==='NotAllowedError'?'「再生」を押すと動画が始まります。':'動画を再生できませんでした。再生を押して再試行するか、下のGoogleドライブで開いてください。')});}
 useImperativeHandle(ref,()=>({play}));
 useEffect(()=>{alive.current=true;const el=video.current;if(el&&source&&!el.getAttribute('src'))el.src=source;return()=>{alive.current=false;if(el){el.pause();el.removeAttribute('src');el.load()}}},[source]);
 async function fullscreen(){const el=video.current as (HTMLVideoElement&{webkitEnterFullscreen?:()=>void})|null;try{if(document.fullscreenElement)await document.exitFullscreen();else if(box.current?.requestFullscreen)await box.current.requestFullscreen();else if(el?.webkitEnterFullscreen)el.webkitEnterFullscreen();else setMessage('このブラウザでは全画面表示を利用できません。')}catch{setMessage('全画面表示を開始できませんでした。')}}
 if(!source)return <iframe className="player" title={movie.title+'の動画'} src={`https://drive.google.com/file/d/${encodeURIComponent(movie.driveFileId)}/preview${movie.resourceKey?'?resourcekey='+encodeURIComponent(movie.resourceKey):''}`} allow="autoplay; fullscreen" allowFullScreen/>;
 return <div className="movie-player" ref={box}>
  <video ref={video} className="movie-video" src={source} playsInline preload="metadata" aria-label={movie.title+'の動画'}
   onPlaying={()=>{setPlaying(true);setWaiting(false);setMessage('');if(!counted.current){counted.current=true;onFirstPlay()}}} onPause={()=>{setPlaying(false);setWaiting(false)}} onWaiting={()=>setWaiting(true)} onEnded={()=>{setPlaying(false);setWaiting(false)}}
   onLoadedMetadata={e=>setDuration(Number.isFinite(e.currentTarget.duration)?e.currentTarget.duration:0)} onTimeUpdate={e=>setPosition(e.currentTarget.currentTime)} onVolumeChange={e=>setMuted(e.currentTarget.muted)}
   onError={()=>{setWaiting(false);setMessage('動画を読み込めませんでした。下のGoogleドライブで開くこともできます。')}}/>
  <div className="movie-controls">
   <label className="sr-only" htmlFor={'seek-'+movie.id}>再生位置</label>
   <input id={'seek-'+movie.id} type="range" min="0" max={duration||1} step="0.1" value={Math.min(position,duration||1)} disabled={!duration} aria-valuetext={`${time(position)} / ${time(duration)}`} onChange={e=>{if(video.current){video.current.currentTime=Number(e.target.value);setPosition(Number(e.target.value))}}}/>
   <div className="movie-buttons"><button type="button" onClick={()=>playing?video.current?.pause():play()}>{playing?'一時停止':'再生'}</button><output aria-label="再生時間">{time(position)} / {time(duration)}</output><button type="button" aria-label={muted?'音声をオンにする':'音声をミュートする'} onClick={()=>{if(video.current)video.current.muted=!video.current.muted}}>{muted?'音声オン':'消音'}</button><button type="button" onClick={fullscreen}>{full?'全画面を終了':'全画面'}</button></div>
   <p className="playback-status" role="status">{message||(waiting?'動画を読み込んでいます…':'')}</p>
  </div>
 </div>;
});
