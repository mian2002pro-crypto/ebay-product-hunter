const MARKET_CURRENCY={US:"USD",UK:"GBP",CA:"CAD",AU:"AUD",DE:"EUR",FR:"EUR",IT:"EUR",ES:"EUR"};
const BASE=[
 {id:"sup-pet-hair",title:"Reusable Pet Hair Remover Roller",price:4.25},
 {id:"sup-pet-bowl",title:"Portable Collapsible Pet Travel Bowl",price:3.75},
 {id:"sup-cleaning-gel",title:"Car Cleaning Gel Dust Removal Tool",price:2.9},
 {id:"sup-lint",title:"Electric Fabric Lint Remover Shaver",price:5.4},
 {id:"sup-led",title:"LED Star Projector Night Light",price:6.8},
 {id:"sup-halloween",title:"Halloween Pumpkin String Lights Decoration",price:5.1},
 {id:"sup-christmas",title:"Christmas LED Window String Lights",price:7.2},
 {id:"sup-fall",title:"Fall Autumn Leaf Garland Home Decoration",price:4.8}
];
function searchLocalSupplier({q="",market="US",minCost,maxCost,page=1,size=20}={}){
 const currency=MARKET_CURRENCY[market]||"USD";
 const n=String(q).toLowerCase();
 const rows=BASE.filter(p=>!n||p.title.toLowerCase().includes(n)).filter(p=>(minCost==null||p.price>=minCost)&&(maxCost==null||p.price<=maxCost)).slice((page-1)*size,page*size).map(p=>({...p,id:p.id+"-"+market.toLowerCase(),currency,source:"Local Supplier Catalog",market,url:""}));
 return {provider:"local",total:rows.length,page,size,items:rows};
}
module.exports={searchLocalSupplier};
