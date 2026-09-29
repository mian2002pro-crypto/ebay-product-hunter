const KEY = "miaanStudioSettingsV1";
const DEFAULTS = {
  US:{title:"",description:"",options:"",image:""},
  UK:{title:"",description:"",options:"",image:""}
};

export function loadSettings(){
  try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(DEFAULTS); }
  catch { return structuredClone(DEFAULTS); }
}
export function saveSettings(settings){
  localStorage.setItem(KEY, JSON.stringify(settings));
  return settings;
}
export {DEFAULTS};