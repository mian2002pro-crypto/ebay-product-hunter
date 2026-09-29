"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {Search,TrendingUp,Package,ShoppingCart,Bookmark,ArrowUpRight,RefreshCw,ExternalLink,Sparkles} from "lucide-react";
import ListingStudio from "./ListingStudio";
import "./studio.css";

type Product={id:string;title:string;category:string;price:number;currency:string;sold:number|null;active:number;trend:number|null;supplier:number|null;season:string;market:string;condition:string;seller:string;url:string;image:string;opportunityScore?:number;opportunityReasons?:string[]};
type Supplier={id:string;title:string;price:number|null;currency:string|null;source:string;image?:string;url?:string;market?:string};

const markets=["US","UK","CA","AU","DE","FR","IT","ES"];
const seasons=["All","Halloween","Christmas","Fall","Winter","Spring","Evergreen"];

export default function Home(){
  const[q,setQ]=useState("");
  const[country,setCountry]=useState("US");
  const[season,setSeason]=useState("All");
  const[view,setView]=useState("hunter");
  const[trendTerms,setTrendTerms]=useState<{term:string;listings:number;avgPrice:number;season:string;previousListings?:number;listingChange?:number;changePercent?:number;direction?:string}[]>([]);
  const[sort,setSort]=useState("price");
  const[products,setProducts]=useState<Product[]>([]);
  const[saved,setSaved]=useState<string[]>([]);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const[dataSource,setDataSource]=useState("Reference");
  const[supplier,setSupplier]=useState<Record<string,Supplier>>({});
  const[supplierLoading,setSupplierLoading]=useState<string|null>(null);
  const[shipping,setShipping]=useState(0);
  const[feeRate,setFeeRate]=useState(13);
  const[minProfit,setMinProfit]=useState(0);
  const[studioProduct,setStudioProduct]=useState<Product|null>(null);
  const requestId=useRef(0);

  const findSupplier=async(p:Product)=>{
    setSupplierLoading(p.id);setError("");
    try{
      const params=new URLSearchParams({provider:"aliexpress",market:country,q:p.title});
      const response=await fetch(`/api/sourcing/search?${params.toString()}`,{cache:"no-store"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error?.message||"AliExpress sourcing failed");
      const match=data.items?.[0];
      if(match)setSupplier(x=>({...x,[p.id]:match}));
    }catch(e){setError(e instanceof Error?e.message:"AliExpress sourcing failed");}
    finally{setSupplierLoading(null);}
  };

  const load=async()=>{
    const id=++requestId.current;
    setLoading(true);setError("");
    try{
      const params=new URLSearchParams({market:country,q:q.trim(),limit:"50",refresh:String(Date.now())});
      const response=await fetch(`/api/ebay/search?${params.toString()}`,{cache:"no-store"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Unable to load eBay data");
      if(id!==requestId.current)return;
      setProducts(data.items||[]);
      setDataSource(data.liveWeb?"Live web":"Reference");
      const counts=new Map<string,{term:string;listings:number;total:number;season:string}>();
      (data.items||[]).forEach((p:Product)=>String(p.title).toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter((w:string)=>w.length>=4&&!["with","and","for","the","new","set","from","inch","of","in","on","to"].includes(w)).forEach((term:string)=>{const x=counts.get(term)||{term,listings:0,total:0,season:p.season};x.listings++;x.total+=p.price||0;counts.set(term,x);}));
      const current=[...counts.values()].map(x=>({term:x.term,listings:x.listings,avgPrice:Number((x.total/x.listings).toFixed(2)),season:x.season})).sort((a,b)=>b.listings-a.listings).slice(0,20);
      const trendResponse=await fetch("/api/trends",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({market:country,query:q.trim(),terms:current,refresh:Date.now()}),cache:"no-store"});
      if(id!==requestId.current)return;
      if(trendResponse.ok){const trendData=await trendResponse.json();setTrendTerms((trendData.items||[]).slice(0,12));}else setTrendTerms(current.slice(0,12));
    }catch(e){
      if(id===requestId.current){setProducts([]);setError(e instanceof Error?e.message:"Unable to load eBay data");}
    }finally{if(id===requestId.current)setLoading(false);}
  };

  useEffect(()=>{load();},[country]);
  useEffect(()=>{const t=setTimeout(()=>{if(q.trim())load();else setTrendTerms([]);},450);return()=>clearTimeout(t);},[q]);

  const economics=(p:Product)=>{const s=supplier[p.id];if(!s||s.price==null||!Number.isFinite(Number(s.price)))return null;const fee=p.price*(feeRate/100);const profit=p.price-fee-Number(s.price)-shipping;return {fee,profit,margin:p.price>0?profit/p.price:0};};
  const toggleSaved=(id:string)=>setSaved(x=>x.includes(id)?x.filter(v=>v!==id):[...x,id]);

  const filtered=useMemo(()=>{
    let rows=products.filter(p=>(season==="All"||p.season===season)&&(view!=="saved"||saved.includes(p.id)));
    return [...rows].filter(p=>{const e=economics(p);return !e||e.profit>=minProfit;}).sort((a,b)=>sort==="price"?b.price-a.price:sort==="title"?a.title.localeCompare(b.title):b.price-a.price);
  },[products,season,view,saved,sort,supplier,feeRate,shipping,minProfit]);
  const money=(p:{price:number;currency:string})=>new Intl.NumberFormat(undefined,{style:"currency",currency:p.currency||"USD"}).format(p.price);

  return <main>
    <aside>
      <div className="brand"><div className="logo">PH</div><div><b>Product Hunter</b><span>eBay Intelligence</span></div></div>
      <nav>{["hunter","trending","seasonal","saved"].map(x=><button className={view===x?"active":""} onClick={()=>setView(x)} key={x}>{x==="hunter"?<Search/>:x==="trending"?<TrendingUp/>:x==="seasonal"?<Package/>:<Bookmark/>}{x[0].toUpperCase()+x.slice(1)}</button>)}</nav>
      <div className="sidebox"><small>MARKET</small><select value={country} onChange={e=>setCountry(e.target.value)}>{markets.map(m=><option key={m}>{m}</option>)}</select></div>
    </aside>
    <section className="content">
      <header><div><p className="eyebrow">MARKET RESEARCH: {country}</p><h1>{view==="hunter"?"Find eBay products":view==="trending"?"Trending keywords":"Product Intelligence"}</h1><p className="muted">{dataSource==="Live web"?"Direct eBay web research without the eBay API.":"Reference catalog fallback; not verified live eBay sales."}</p></div><button className="primary" onClick={load} disabled={loading}><RefreshCw className={loading?"spin":""}/>{loading?"Loading":"Refresh data"}</button></header>
      <div className="stats"><div><TrendingUp/><span>Research listings</span><strong>{products.length}</strong></div><div><ArrowUpRight/><span>Avg opportunity</span><strong>{products.length?Math.round(products.reduce((a,p)=>a+(p.opportunityScore||0),0)/products.length):0}</strong></div><div><ShoppingCart/><span>Market</span><strong>{country}</strong></div><div><Package/><span>Saved</span><strong>{saved.length}</strong></div><div><ArrowUpRight/><span>Data status</span><strong>{error?"Error":dataSource}</strong></div></div>
      {view==="trending"&&<div className="trend-grid">{trendTerms.map(t=><div className="trend-card" key={t.term}><b>{t.term}</b><span>{t.listings} listings · {t.season}</span><strong>{money({price:t.avgPrice,currency:country==="UK"?"GBP":country==="CA"?"CAD":country==="AU"?"AUD":["DE","FR","IT","ES"].includes(country)?"EUR":"USD"})} avg.</strong>{t.direction&&<small className={t.direction==="Rising"?"trend-up":t.direction==="Falling"?"trend-down":"trend-flat"}>{t.direction} {t.listingChange!==undefined&&t.changePercent!==undefined?` · ${t.listingChange>=0?"+":""}${t.listingChange} (${t.changePercent}%)`:""}</small>}</div>)}</div>}
      <div className="toolbar"><div className="search"><Search/><input placeholder="Search eBay products or keywords..." value={q} onChange={e=>setQ(e.target.value)}/></div><select value={season} onChange={e=>setSeason(e.target.value)}>{seasons.map(s=><option key={s}>{s}</option>)}</select><div className="profit-settings"><label>Fee % <input type="number" min="0" max="100" value={feeRate} onChange={e=>setFeeRate(Number(e.target.value))}/></label><label>Ship <input type="number" min="0" value={shipping} onChange={e=>setShipping(Number(e.target.value))}/></label><label>Min profit <input type="number" min="0" value={minProfit} onChange={e=>setMinProfit(Number(e.target.value))}/></label></div></div>
      {error&&<div className="notice"><b>Research search error</b><span>{error}</span><small>No eBay API credentials are required for this mode.</small></div>}
      <div className="sectionhead"><div><h2>Product research opportunities</h2><p>{filtered.length} matching research listings</p></div><select value={sort} onChange={e=>setSort(e.target.value)}><option value="price">Sort: Price</option><option value="title">Sort: Title</option></select></div>
      <div className="table"><div className="thead"><span>PRODUCT</span><span>PRICE</span><span>STATUS</span><span>SELLER</span><span>DEMAND</span><span>SOURCE</span><span></span><span></span></div>
      {filtered.map(p=><div className="row" key={p.id}><div className="product">{p.image?<img className="thumbimg" src={p.image} alt=""/>:<div className="thumb">{p.title.slice(0,2).toUpperCase()}</div>}<div><b>{p.title}</b><small>{p.condition||"Listing"} · {p.market}</small></div></div><strong>{money(p)}</strong><span className="live">RESEARCH</span><span>{p.seller||"—"}</span><span className="score">{p.opportunityScore??"—"}</span><span className={supplier[p.id]?"profit":"unknown"}>{(()=>{const e=economics(p);const s=supplier[p.id];return e?`${e.profit>=0?"+":""}${money({price:e.profit,currency:p.currency})} · ${Math.round(e.margin*100)}%`:s?<a href={s.url} target="_blank" rel="noreferrer">Open AliExpress search</a>:"No supplier cost yet"})()}</span><button className="supplier-btn" onClick={()=>findSupplier(p)} disabled={supplierLoading===p.id}>{supplierLoading===p.id?"Opening…":"AliExpress source"}</button><button className="supplier-btn" onClick={()=>setStudioProduct(p)}><Sparkles size={13}/> Studio</button>{p.url&&<a className="icon" href={p.url} target="_blank" rel="noreferrer" title="Open source listing"><ExternalLink size={17}/></a>}<button className="icon" onClick={()=>toggleSaved(p.id)} title="Save"><Bookmark size={17} fill={saved.includes(p.id)?"currentColor":"none"}/></button></div>)}
      {!loading&&!filtered.length&&!error&&<div className="empty">No matching listings. Try another keyword or market.</div>}
      </div>
    </section>
    {studioProduct&&<ListingStudio product={studioProduct} market={country} onClose={()=>setStudioProduct(null)}/>}
  </main>;
}