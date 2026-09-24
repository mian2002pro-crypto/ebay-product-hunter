"use client";
import {useEffect,useMemo,useState} from "react";
import {Search,TrendingUp,Package,ShoppingCart,Bookmark,SlidersHorizontal,ArrowUpRight,RefreshCw,ExternalLink} from "lucide-react";

type Product={id:string;title:string;category:string;price:number;currency:string;sold:number|null;active:number;trend:number|null;supplier:number|null;season:string;market:string;condition:string;seller:string;url:string;image:string};

const markets=["US","UK","CA","AU","DE","FR","IT","ES"];
const seasons=["All","Halloween","Christmas","Fall","Winter","Spring","Evergreen"];

export default function Home(){
  const[q,setQ]=useState("");
  const[country,setCountry]=useState("US");
  const[season,setSeason]=useState("All");
  const[view,setView]=useState("hunter");
  const[sort,setSort]=useState("price");
  const[products,setProducts]=useState<Product[]>([]);
  const[saved,setSaved]=useState<string[]>([]);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");

  const load=async()=>{
    setLoading(true);setError("");
    try{
      const params=new URLSearchParams({market:country,q:q.trim(),limit:"50"});
      const response=await fetch(`/api/ebay/search?${params.toString()}`,{cache:"no-store"});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Unable to load eBay data");
      setProducts(data.items||[]);
    }catch(e){setProducts([]);setError(e instanceof Error?e.message:"Unable to load eBay data");}
    finally{setLoading(false);}
  };

  useEffect(()=>{load();},[country]);
  useEffect(()=>{const t=setTimeout(()=>{if(q.trim())load();},450);return()=>clearTimeout(t);},[q]);

  const filtered=useMemo(()=>{
    let rows=products.filter(p=>(season==="All"||p.season===season)&&(view!=="saved"||saved.includes(p.id)));
    return [...rows].sort((a,b)=>sort==="price"?b.price-a.price:sort==="title"?a.title.localeCompare(b.title):b.price-a.price);
  },[products,season,view,saved,sort]);

  const toggleSaved=(id:string)=>setSaved(x=>x.includes(id)?x.filter(v=>v!==id):[...x,id]);
  const money=(p:Product)=>new Intl.NumberFormat(undefined,{style:"currency",currency:p.currency||"USD"}).format(p.price);

  return <main>
    <aside>
      <div className="brand"><div className="logo">PH</div><div><b>Product Hunter</b><span>eBay Intelligence</span></div></div>
      <nav>{["hunter","trending","seasonal","saved"].map(x=><button className={view===x?"active":""} onClick={()=>setView(x)} key={x}>{x==="hunter"?<Search/>:x==="trending"?<TrendingUp/>:x==="seasonal"?<Package/>:<Bookmark/>}{x[0].toUpperCase()+x.slice(1)}</button>)}</nav>
      <div className="sidebox"><small>MARKET</small><select value={country} onChange={e=>setCountry(e.target.value)}>{markets.map(m=><option key={m}>{m}</option>)}</select></div>
    </aside>
    <section className="content">
      <header><div><p className="eyebrow">LIVE EBAY MARKET: {country}</p><h1>{view==="hunter"?"Find eBay products":"Product Intelligence"}</h1><p className="muted">Live active-listing research. Sold-demand and supplier data will be added as separate providers.</p></div><button className="primary" onClick={load} disabled={loading}><RefreshCw className={loading?"spin":""}/>{loading?"Loading":"Refresh data"}</button></header>
      <div className="stats"><div><TrendingUp/><span>Live listings</span><strong>{products.length}</strong></div><div><ShoppingCart/><span>Market</span><strong>{country}</strong></div><div><Package/><span>Saved</span><strong>{saved.length}</strong></div><div><ArrowUpRight/><span>Data status</span><strong>{error?"Setup":"Live"}</strong></div></div>
      <div className="toolbar"><div className="search"><Search/><input placeholder="Search eBay products or keywords..." value={q} onChange={e=>setQ(e.target.value)}/></div><select value={season} onChange={e=>setSeason(e.target.value)}>{seasons.map(s=><option key={s}>{s}</option>)}</select><button className="filter"><SlidersHorizontal/> Filters</button></div>
      {error&&<div className="notice"><b>eBay connection needs configuration.</b><span>{error}</span><small>Add EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in your deployment environment.</small></div>}
      <div className="sectionhead"><div><h2>Live product opportunities</h2><p>{filtered.length} matching active listings</p></div><select value={sort} onChange={e=>setSort(e.target.value)}><option value="price">Sort: Price</option><option value="title">Sort: Title</option></select></div>
      <div className="table"><div className="thead"><span>PRODUCT</span><span>PRICE</span><span>STATUS</span><span>SELLER</span><span>DEMAND</span><span>SOURCE</span><span></span></div>
      {filtered.map(p=><div className="row" key={p.id}><div className="product">{p.image?<img className="thumbimg" src={p.image} alt=""/>:<div className="thumb">{p.title.slice(0,2).toUpperCase()}</div>}<div><b>{p.title}</b><small>{p.condition||"Listing"} · {p.market}</small></div></div><strong>{money(p)}</strong><span className="live">ACTIVE</span><span>{p.seller||"—"}</span><span className="unknown">Not available</span><a className="icon" href={p.url} target="_blank" rel="noreferrer" title="Open eBay listing"><ExternalLink size={17}/></a><button className="icon" onClick={()=>toggleSaved(p.id)} title="Save"><Bookmark size={17} fill={saved.includes(p.id)?"currentColor":"none"}/></button></div>)}
      {!loading&&!filtered.length&&!error&&<div className="empty">No matching listings. Try another keyword or market.</div>}
      </div>
    </section>
  </main>
}