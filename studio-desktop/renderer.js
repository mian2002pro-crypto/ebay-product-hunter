import {loadSettings,saveSettings,DEFAULTS} from "./settings.js";
let settings=loadSettings();
let market="US";
const fields=["title","description","options","image"];

function renderSettings(){
  const container=document.getElementById("promptFields");
  container.innerHTML="";
  for(const field of fields){
    const label=document.createElement("label"); label.textContent=field.toUpperCase()+" PROMPT";
    const area=document.createElement("textarea"); area.id="prompt-"+field; area.value=settings[market]?.[field]||"";
    container.append(label,area);
  }
  document.getElementById("marketLabel").textContent=market==="US"?"USA":"UK";
}
function collectSettings(){
  const next={...settings,[market]:{...(settings[market]||{})}};
  for(const field of fields) next[market][field]=document.getElementById("prompt-"+field).value;
  settings=next;
}
function switchMarket(value){collectSettings();market=value;renderSettings();document.getElementById("market").value=value;}
document.getElementById("market").addEventListener("change",e=>switchMarket(e.target.value));
document.querySelectorAll(".nav").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
  document.getElementById("studioView").hidden=btn.dataset.view!=="studio";
  document.getElementById("settingsView").hidden=btn.dataset.view!=="settings";
  if(btn.dataset.view==="settings")renderSettings();
}));
document.getElementById("save").addEventListener("click",()=>{collectSettings();saveSettings(settings);document.getElementById("saved").textContent="Saved on this PC.";});
document.getElementById("generate").addEventListener("click",()=>{
  const product=document.getElementById("title").value.trim();
  const facts=document.getElementById("facts").value.trim();
  const prompt=settings[market]?.description||"Use supplied facts only. Never invent unsupported specifications.";
  document.getElementById("output").textContent="Market: "+market+"\n\nPrompt:\n"+prompt+"\n\nProduct:\n"+product+"\n\nFacts:\n"+facts+"\n\nReady for AI generation.";
});
renderSettings();