"use client";
import { useMemo, useState } from "react";
import { buildGenerationContext, getMarketProfile } from "../shared/listing-config";
import { recordListingOutput } from "../lib/product-workflow";
type Product={id:string;title:string;price:number;currency:string;market:string;url:string;image:string;condition?:string};
type Props={product:Product;market:string;onClose:()=>void};
type Tab="title"|"description"|"options"|"image";
export default function ListingStudio({product,market,onClose}:Props){
 const [activeMarket,setActiveMarket]=useState(market);
 const profile=getMarketProfile(activeMarket);
 const context=useMemo(()=>buildGenerationContext(activeMarket,product),[activeMarket,product]);
 const [tab,setTab]=useState<Tab>("title");
 const [output,setOutput]=useState("");
 const [copied,setCopied]=useState(false);
 const [busy,setBusy]=useState(false);
 const [outputs,setOutputs]=useState<Record<string,string>>({});
 const [marketOutputs,setMarketOutputs]=useState<Record<string,Record<string,string>>>({});
 const facts=useMemo(()=>JSON.stringify(context.product,null,2),[context.product]);
 const generate=async()=>{
  const prompt=profile.prompts[tab];
  setBusy(true);
  setOutput("Generating...");
  try{
   const response=await fetch("/api/listing/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({market:activeMarket,kind:tab,prompt,product})});
   const data=await response.json();
   const value=response.ok?(data.output||""):(data.error||"Generation failed");
   setOutput(value);
   if(response.ok){
    setOutputs(prev=>({...prev,[tab]:value}));
    setMarketOutputs(prev=>({...prev,[activeMarket]:{...(prev[activeMarket]||{}),[tab]:value}}));
   }
  }catch(error){setOutput(error instanceof Error?error.message:"Generation failed");}
  finally{setBusy(false);}
 };
 const copy=async()=>{await navigator.clipboard?.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1200)};
 return <div className="studio-overlay"><section className="studio-panel"><header className="studio-header"><div><small>MIAAN AI LISTING STUDIO</small><h2>{profile.name} · {product.title}</h2><p>Market-specific prompts are applied. Unsupported facts remain Not Specified.</p></div><button onClick={onClose}>Close</button></header><nav className="studio-tabs">{(["title","description","options","image"] as Tab[]).map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x}</button>)}</nav><div className="studio-body"><div className="studio-facts">{product.image&&<img src={product.image} alt=""/>}<b>Market: {context.market}</b><span>Price: {product.price} {product.currency}</span><span>Source facts only</span><a href={product.url} target="_blank" rel="noreferrer">Source listing</a></div><div className="studio-work"><div className="prompt-preview"><b>Active prompt</b><span>{profile.prompts[tab]}</span></div><div className="studio-generate-row"><button className="generate" onClick={generate} disabled={busy}>{busy?"Generating...":"Generate "+tab}</button><button className="generate" onClick={async()=>{for(const kind of ["title","description","options","image"] as Tab[]){const p=profile.prompts[kind];const r=await fetch("/api/listing/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({market:activeMarket,kind,prompt:p,product})});const d=await r.json();if(!r.ok){setOutput(d.error||"Generation failed");break;}const value=d.output||"";setOutputs(prev=>({...prev,[kind]:value}));setMarketOutputs(prev=>({...prev,[activeMarket]:{...(prev[activeMarket]||{}),[kind]:value}}));if(kind===tab)setOutput(value);}setBusy(false)}} disabled={busy}>Generate All</button></div><textarea value={outputs[tab] ?? ""} onChange={e=>setOutput(e.target.value)} placeholder="Generated output appears here..."/><div className="studio-actions"><button onClick={()=>{const bundle={product,market:activeMarket,generated:{title:marketOutputs[activeMarket]?.title||"",description:marketOutputs[activeMarket]?.description||"",options:marketOutputs[activeMarket]?.options||"",image:marketOutputs[activeMarket]?.image||""}};const blob=new Blob([JSON.stringify(bundle,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="miaan-listing-bundle-"+activeMarket.toLowerCase()+".json";a.click();URL.revokeObjectURL(a.href)}} disabled={!Object.keys(marketOutputs[activeMarket]||{}).length}>Download {activeMarket} Bundle</button><button onClick={copy} disabled={!output}>{copied?"Copied":"Copy"}</button><button onClick={()=>{const blob=new Blob([output],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="miaan-"+activeMarket.toLowerCase()+"-"+tab+".txt";a.click();URL.revokeObjectURL(a.href)}} disabled={!output}>Download</button></div></div></div></section></div>;
}