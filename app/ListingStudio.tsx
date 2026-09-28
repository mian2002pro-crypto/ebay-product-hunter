"use client";
import { useMemo, useState } from "react";
import { buildGenerationContext, getMarketProfile } from "../shared/listing-config";
type Product={id:string;title:string;price:number;currency:string;market:string;url:string;image:string;condition?:string};
type Props={product:Product;market:string;onClose:()=>void};
export default function ListingStudio({product,market,onClose}:Props){
 const profile=getMarketProfile(market);
 const context=useMemo(()=>buildGenerationContext(market,product),[market,product]);
 const [tab,setTab]=useState<"title"|"description"|"options"|"image">("title");
 const [output,setOutput]=useState("");
 const generate=()=>{
  if(tab==="title") setOutput(product.title);
  else if(tab==="description") setOutput([product.title,"","What's the product?",product.title,"","Features","Feature 1: Not Specified","Feature 2: Not Specified","Feature 3: Not Specified","Feature 4: Not Specified","Feature 5: Not Specified","","Size: Not Specified","Color: Not Specified","What's in the package? Not Specified"].join("\n"));
  else if(tab==="options") setOutput(profile.optionFields.map(field=>field+": Not Specified").join("\n"));
  else setOutput("Create a square 1:1 premium eBay main image. Keep the product large, clear, sharp and centered. Use supplied product facts only.");
 };
 return <div className="studio-overlay"><section className="studio-panel"><header className="studio-header"><div><small>MIAAN AI LISTING STUDIO</small><h2>{profile.name} · {product.title}</h2><p>Product facts stay separate from generation rules. Unsupported facts remain Not Specified.</p></div><button onClick={onClose}>Close</button></header><nav className="studio-tabs">{(["title","description","options","image"] as const).map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x}</button>)}</nav><div className="studio-body"><div className="studio-facts">{product.image&&<img src={product.image} alt=""/>}<b>Market: {context.market}</b><span>Price: {product.price} {product.currency}</span><a href={product.url} target="_blank" rel="noreferrer">Source listing</a></div><div className="studio-work"><button className="generate" onClick={generate}>Generate {tab}</button><textarea value={output} onChange={e=>setOutput(e.target.value)} placeholder="Generated output appears here..."/><div className="studio-actions"><button onClick={()=>navigator.clipboard?.writeText(output)} disabled={!output}>Copy</button><button onClick={()=>{const blob=new Blob([output],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="miaan-"+market.toLowerCase()+"-"+tab+".txt";a.click();URL.revokeObjectURL(a.href)}} disabled={!output}>Download</button></div></div></div></section></div>;
}