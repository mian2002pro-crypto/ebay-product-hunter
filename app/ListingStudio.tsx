"use client";
import { useMemo, useState } from "react";
import { buildGenerationContext, getMarketProfile } from "../shared/listing-config";
type Product={id:string;title:string;price:number;currency:string;market:string;url:string;image:string;condition?:string};
type Props={product:Product;market:string;onClose:()=>void};
type Tab="title"|"description"|"options"|"image";
export default function ListingStudio({product,market,onClose}:Props){
 const profile=getMarketProfile(market);
 const context=useMemo(()=>buildGenerationContext(market,product),[market,product]);
 const [tab,setTab]=useState<Tab>("title");
 const [output,setOutput]=useState("");
 const [copied,setCopied]=useState(false);
 const facts=useMemo(()=>JSON.stringify(context.product,null,2),[context.product]);
 const generate=async()=>{
  const prompt=profile.prompts[tab];
  setOutput("Generating...");
  const response=await fetch("/api/listing/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({market,kind:tab,prompt,product})});
  const data=await response.json();
  if(!response.ok){setOutput(data.error||"Generation failed");return;}
  setOutput(data.output||"");
  return;
  if(tab==="title") setOutput(product.title+"\n\nPROMPT:\n"+prompt);
  if(tab==="description") setOutput([product.title,"","What’s the product?",product.title,"","5 FEATURES",..."1. Not Specified","2. Not Specified","3. Not Specified","4. Not Specified","5. Not Specified","","Size: Not Specified","Color: Not Specified","What’s in the package? Not Specified",market==="UK"?"Country of Origin: United Kingdom":"" ,"",prompt].filter(Boolean).join("\n"));
  if(tab==="options") setOutput(profile.optionFields.map(field=>field+": Not Specified").join("\n")+"\n\nRULE:\n"+prompt);
  if(tab==="image") setOutput(prompt+"\n\nPRODUCT SOURCE:\n"+facts);
 };
 const copy=async()=>{await navigator.clipboard?.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1200)};
 return <div className="studio-overlay"><section className="studio-panel"><header className="studio-header"><div><small>MIAAN AI LISTING STUDIO</small><h2>{profile.name} · {product.title}</h2><p>Market-specific prompts are applied. Unsupported facts remain Not Specified.</p></div><button onClick={onClose}>Close</button></header><nav className="studio-tabs">{(["title","description","options","image"] as Tab[]).map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x}</button>)}</nav><div className="studio-body"><div className="studio-facts">{product.image&&<img src={product.image} alt=""/>}<b>Market: {context.market}</b><span>Price: {product.price} {product.currency}</span><span>Source facts only</span><a href={product.url} target="_blank" rel="noreferrer">Source listing</a></div><div className="studio-work"><div className="prompt-preview"><b>Active prompt</b><span>{profile.prompts[tab]}</span></div><button className="generate" onClick={generate}>Generate {tab}</button><textarea value={output} onChange={e=>setOutput(e.target.value)} placeholder="Generated output appears here..."/><div className="studio-actions"><button onClick={copy} disabled={!output}>{copied?"Copied":"Copy"}</button><button onClick={()=>{const blob=new Blob([output],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="miaan-"+market.toLowerCase()+"-"+tab+".txt";a.click();URL.revokeObjectURL(a.href)}} disabled={!output}>Download</button></div></div></div></section></div>;
}