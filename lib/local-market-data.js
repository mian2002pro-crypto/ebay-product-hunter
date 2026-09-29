const CATALOG = [
  {id:"seed-pet-hair-remover",title:"Reusable Pet Hair Remover Roller",category:"Pet Supplies",price:14.99,currency:"USD",condition:"New",seller:"Research Catalog",image:"",market:"US",season:"Evergreen"},
  {id:"seed-car-cleaning-gel",title:"Car Cleaning Gel Dust Removal Tool",category:"Automotive",price:9.99,currency:"USD",condition:"New",seller:"Research Catalog",image:"",market:"US",season:"Evergreen"},
  {id:"seed-led-projector",title:"LED Star Projector Night Light",category:"Home & Garden",price:19.99,currency:"USD",condition:"New",seller:"Research Catalog",image:"",market:"US",season:"Christmas"},
  {id:"seed-pet-travel-bowl",title:"Portable Collapsible Pet Travel Bowl",category:"Pet Supplies",price:12.99,currency:"USD",condition:"New",seller:"Research Catalog",image:"",market:"US",season:"Evergreen"},
  {id:"seed-halloween-decor",title:"Halloween Pumpkin String Lights Decoration",category:"Seasonal",price:16.99,currency:"USD",condition:"New",seller:"Research Catalog",image:"",market:"US",season:"Halloween"},
  {id:"seed-christmas-lights",title:"Christmas LED Window String Lights",category:"Seasonal",price:22.99,currency:"USD",condition:"New",seller:"Research Catalog",image:"",market:"US",season:"Christmas"},
  {id:"seed-fall-decor",title:"Fall Autumn Leaf Garland Home Decoration",category:"Seasonal",price:18.99,currency:"USD",condition:"New",seller:"Research Catalog",image:"",market:"US",season:"Fall"},
  {id:"seed-lint-remover",title:"Electric Fabric Lint Remover Shaver",category:"Home & Garden",price:17.49,currency:"USD",condition:"New",seller:"Research Catalog",image:"",market:"US",season:"Evergreen"}
];

const MARKET_CURRENCY={US:"USD",UK:"GBP",CA:"CAD",AU:"AUD",DE:"EUR",FR:"EUR",IT:"EUR",ES:"EUR"};

function searchLocalMarket({market="US",q="",limit=50}={}){
  const normalized=String(q).trim().toLowerCase();
  const rows=CATALOG
    .filter(p=>!normalized||p.title.toLowerCase().includes(normalized)||p.category.toLowerCase().includes(normalized))
    .slice(0,Math.min(Math.max(Number(limit)||50,1),100))
    .map(p=>({...p,market,currency:MARKET_CURRENCY[market]||"USD",url:""}));
  return {total:rows.length,items:rows};
}

module.exports={CATALOG,searchLocalMarket};
