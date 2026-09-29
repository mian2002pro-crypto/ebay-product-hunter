"use client";
import {useMemo,useState} from "react";
import {buildGenerationContext,getMarketProfile} from "../shared/listing-config";

type Product={id:string;title:string;price:number;currency:string;market:string;url:string;image:string;condition?:string};
type Props={product:Product;market:string;onClose:()=>void};
type Tab="title"|"description"|"options"|"image";

const MARKETS=["US","UK"];

export default function ListingStudio({product,market,onClose}:Props){
 const [activeMarket,setActiveMarket]=useState(market==="UK"?"UK":"US");
 const [tab,setTab]=useState<Tab>("title");
 const [copied,setCopied]=useState(false);
 const [busy,setBusy]=useState(false);
 const [outputs,setOutputs]=useState<Record<string,Record<string,string>>>({});
 const profile=getMarketProfile(activeMarket);
 const context=useMemo(()=>buildGenerationContext(activeMarket,product),[activeMarket,product]);
 const currentOutput=outputs[activeMarket]?.[tab]||"";
 const generateOne=async(kind:Tab)=>{
  const prompt=profile.prompts[kind];
  setBusy(true);
  try{
   const response=await fetch("/api/listing/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({market:activeMarket,kind,prompt,product}),cache:"no-store"});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"Generation failed");
   const value=data.output||"";
   setOutputs(prev=>({...prev,[activeMarket]:{...(prev[activeMarket]||{}),[kind]:value}}));
  }catch(error){
   const value=error instanceof Error?error.message:"Generation failed";
   setOutputs(prev=>({...prev,[activeMarket]:{...(prev[activeMarket]||{}),[kind]:value}}));
  }finally{setBusy(false);}
 };
 const generateAll=async()=>{
  setBusy(true);
  try{
   const next={...(outputs[activeMarket]||{})};
   for(const kind of ["title","description","options","image"] as Tab[]){
    const response=await fetch("/api/listing/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({market:activeMarket,kind,prompt:profile.prompts[kind],product}),cache:"no-store"});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Generation failed");
    next[kind]=data.output||"";
    setOutputs(prev=>({...prev,[activeMarket]:{...next}}));
   }
  }catch(error){
   const value=error instanceof Error?error.message:"Generation failed";
   setOutputs(prev=>({...prev,[activeMarket]:{...(prev[activeMarket]||{}),[tab]:value}}));
  }finally{setBusy(false);}
 };
 const updateOutput=(value:string)=>setOutputs(prev=>({...prev,[activeMarket]:{...(prev[activeMarket]||{}),[tab]:value}}));
 const copy=async()=>{if(!currentOutput)return;await navigator.clipboard?.writeText(currentOutput);setCopied(true);setTimeout(()=>setCopied(false),1200)};
 const download=(content:string,name:string,type="text/plain")=>{const blob=new Blob([content],{type});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)};
 const bundle=outputs[activeMarket]||{};
 return <div className="studio-overlay" role="dialog" aria-modal="true">
  <section className="studio-panel">
   <header className="studio-header"><div><small>MIAAN AI LISTING STUDIO</small><h2>{profile.name} · {product.title}</h2><p>Market-specific prompts are applied. Unsupported facts remain Not Specified.</p></div><button onClick={onClose}>Close</button></header>
   <div className="studio-market-tabs">{MARKETS.map(m=><button key={m} className={activeMarket===m?"active":""} onClick={()=>setActiveMarket(m)}>{m==="US"?"🇺🇸 USA":"🇬🇧 UK"}</button>)}</div>
   <nav className="studio-tabs">{(["title","description","options","image"] as Tab[]).map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x}</button>)}</nav>
   <div className="studio-body">
    <div className="studio-facts">{product.image&&<img src={product.image} alt=""/>}<b>Market: {context.market}</b><span>Price: {product.price} {product.currency}</span><span>Source facts only</span>{product.url&&<a href={product.url} target="_blank" rel="noreferrer">Source listing</a>}</div>
    <div className="studio-work">
     <div className="prompt-preview"><b>Active prompt</b><span>{profile.prompts[tab]}</span></div>
     <div className="studio-generate-row"><button className="generate" onClick={()=>generateOne(tab)} disabled={busy}>{busy?"Generating...":"Generate "+tab}</button><button className="generate" onClick={generateAll} disabled={busy}>Generate All</button></div>
     <textarea value={currentOutput} onChange={e=>updateOutput(e.target.value)} placeholder="Generated output appears here..."/>
     <div className="studio-actions"><button onClick={()=>download(JSON.stringify({product,market:activeMarket,generated:{title:bundle.title||"",description:bundle.description||"",options:bundle.options||"",image:bundle.image||""}},null,2),"miaan-listing-bundle-"+activeMarket.toLowerCase()+".json","application/json")} disabled={!Object.keys(bundle).length}>Download {activeMarket} Bundle</button><button onClick={copy} disabled={!currentOutput}>{copied?"Copied":"Copy"}</button><button onClick={()=>download(currentOutput,"miaan-"+activeMarket.toLowerCase()+"-"+tab+".txt")} disabled={!currentOutput}>Download</button></div>
    </div>
   </div>
  </section>
 </div>;
}