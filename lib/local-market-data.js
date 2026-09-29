const MARKET_CURRENCY={US:"USD",UK:"GBP",CA:"CAD",AU:"AUD",DE:"EUR",FR:"EUR",IT:"EUR",ES:"EUR"};
const MARKET_PRODUCTS={
 US:[
  ["us-pet-hair","Reusable Pet Hair Remover Roller","Pet Supplies",14.99,"Evergreen"],
  ["us-pet-bowl","Portable Collapsible Pet Travel Bowl","Pet Supplies",12.99,"Evergreen"],
  ["us-car-gel","Car Cleaning Gel Dust Removal Tool","Automotive",9.99,"Evergreen"],
  ["us-projector","LED Star Projector Night Light","Home & Garden",19.99,"Christmas"],
  ["us-halloween","Halloween Pumpkin String Lights Decoration","Seasonal",16.99,"Halloween"],
  ["us-christmas","Christmas LED Window String Lights","Seasonal",22.99,"Christmas"],
  ["us-fall","Fall Autumn Leaf Garland Home Decoration","Seasonal",18.99,"Fall"],
  ["us-lint","Electric Fabric Lint Remover Shaver","Home & Garden",17.49,"Evergreen"]
 ],
 UK:[
  ["uk-pet-grooming","Pet Grooming Deshedding Brush","Pet Supplies",11.99,"Evergreen"],
  ["uk-travel-bowl","Foldable Pet Travel Water Bowl","Pet Supplies",9.49,"Evergreen"],
  ["uk-storage","Under Bed Storage Organiser Bag","Home & Garden",13.99,"Evergreen"],
  ["uk-led","LED Ambient Desk Lamp","Home & Garden",18.49,"Evergreen"],
  ["uk-halloween","Halloween Pumpkin Window Decoration","Seasonal",12.99,"Halloween"],
  ["uk-christmas","Christmas Tree LED Fairy Lights","Seasonal",16.99,"Christmas"],
  ["uk-autumn","Autumn Leaf Garland Decoration","Seasonal",14.49,"Fall"],
  ["uk-lint","Rechargeable Fabric Lint Remover","Home & Garden",15.99,"Evergreen"]
 ],
 CA:[
  ["ca-pet","Portable Pet Grooming Brush","Pet Supplies",15.99,"Evergreen"],
  ["ca-travel","Collapsible Pet Travel Bowl","Pet Supplies",13.49,"Evergreen"],
  ["ca-clean","Multi Purpose Cleaning Gel","Home & Garden",10.99,"Evergreen"],
  ["ca-light","LED Star Projector","Home & Garden",21.99,"Christmas"],
  ["ca-halloween","Halloween Pumpkin Lights","Seasonal",17.99,"Halloween"],
  ["ca-christmas","Christmas Window Lights","Seasonal",24.99,"Christmas"],
  ["ca-fall","Autumn Leaf Garland","Seasonal",20.99,"Fall"],
  ["ca-lint","Electric Lint Remover","Home & Garden",18.99,"Evergreen"]
 ],
 AU:[
  ["au-pet","Pet Hair Removal Roller","Pet Supplies",16.99,"Evergreen"],
  ["au-bowl","Portable Pet Travel Bowl","Pet Supplies",14.49,"Evergreen"],
  ["au-clean","Car Cleaning Dust Gel","Automotive",11.49,"Evergreen"],
  ["au-light","LED Night Projector","Home & Garden",23.99,"Christmas"],
  ["au-halloween","Halloween Pumpkin Decoration","Seasonal",18.99,"Halloween"],
  ["au-christmas","Christmas LED Lights","Seasonal",25.99,"Christmas"],
  ["au-fall","Autumn Leaf Home Garland","Seasonal",21.49,"Fall"],
  ["au-lint","Fabric Lint Shaver","Home & Garden",20.49,"Evergreen"]
 ],
 DE:[
  ["de-pet","Tierhaarentferner Roller","Pet Supplies",13.99,"Evergreen"],
  ["de-bowl","Faltbarer Reisenapf für Haustiere","Pet Supplies",11.49,"Evergreen"],
  ["de-clean","Auto Reinigungs Gel","Automotive",8.99,"Evergreen"],
  ["de-light","LED Sternenprojektor","Home & Garden",18.99,"Christmas"],
  ["de-halloween","Halloween Kürbis Lichter","Seasonal",15.99,"Halloween"],
  ["de-christmas","Weihnachts LED Lichterkette","Seasonal",21.99,"Christmas"],
  ["de-fall","Herbst Blätter Girlande","Seasonal",17.99,"Fall"],
  ["de-lint","Elektrischer Fusselrasierer","Home & Garden",16.49,"Evergreen"]
 ],
 FR:[
  ["fr-pet","Rouleau Anti-Poils pour Animaux","Pet Supplies",13.99,"Evergreen"],
  ["fr-bowl","Bol de Voyage Pliable pour Animal","Pet Supplies",10.99,"Evergreen"],
  ["fr-clean","Gel Nettoyant Auto","Automotive",8.49,"Evergreen"],
  ["fr-light","Projecteur LED Étoiles","Home & Garden",19.49,"Christmas"],
  ["fr-halloween","Décoration Citrouille Halloween","Seasonal",14.99,"Halloween"],
  ["fr-christmas","Guirlande LED de Noël","Seasonal",20.99,"Christmas"],
  ["fr-fall","Guirlande Feuilles Automne","Seasonal",16.99,"Fall"],
  ["fr-lint","Rasoir Anti-Bouloches Électrique","Home & Garden",15.99,"Evergreen"]
 ],
 IT:[
  ["it-pet","Rullo Rimuovi Peli Animali","Pet Supplies",13.49,"Evergreen"],
  ["it-bowl","Ciotola da Viaggio Pieghevole","Pet Supplies",10.49,"Evergreen"],
  ["it-clean","Gel Pulizia Auto","Automotive",8.49,"Evergreen"],
  ["it-light","Proiettore LED Stelle","Home & Garden",18.99,"Christmas"],
  ["it-halloween","Decorazione Zucca Halloween","Seasonal",14.49,"Halloween"],
  ["it-christmas","Luci LED Natalizie","Seasonal",20.49,"Christmas"],
  ["it-fall","Ghirlanda Foglie Autunnali","Seasonal",16.49,"Fall"],
  ["it-lint","Rimuovi Pelucchi Elettrico","Home & Garden",15.49,"Evergreen"]
 ],
 ES:[
  ["es-pet","Rodillo Quitapelos para Mascotas","Pet Supplies",13.49,"Evergreen"],
  ["es-bowl","Cuenco de Viaje Plegable para Mascotas","Pet Supplies",10.49,"Evergreen"],
  ["es-clean","Gel Limpiador para Coche","Automotive",8.49,"Evergreen"],
  ["es-light","Proyector LED de Estrellas","Home & Garden",18.99,"Christmas"],
  ["es-halloween","Decoración Calabaza Halloween","Seasonal",14.49,"Halloween"],
  ["es-christmas","Luces LED de Navidad","Seasonal",20.49,"Christmas"],
  ["es-fall","Guirnalda Hojas Otoño","Seasonal",16.49,"Fall"],
  ["es-lint","Quitapelusas Eléctrico","Home & Garden",15.49,"Evergreen"]
 ]
};
const CATALOG=Object.entries(MARKET_PRODUCTS).flatMap(([market,items])=>items.map(([id,title,category,price,season])=>({id,title,category,price,currency:MARKET_CURRENCY[market],condition:"New",seller:"Research Catalog",image:"",market,season})));
function searchLocalMarket({market="US",q="",limit=50}={}){
 const normalized=String(q).trim().toLowerCase();
 const rows=CATALOG.filter(p=>p.market===market && (!normalized||p.title.toLowerCase().includes(normalized)||p.category.toLowerCase().includes(normalized))).slice(0,Math.min(Math.max(Number(limit)||50,1),100)).map(p=>({...p,url:""}));
 return {total:rows.length,items:rows};
}
module.exports={CATALOG,searchLocalMarket};