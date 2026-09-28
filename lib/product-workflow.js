const WORKFLOW_STATES=["Hunted","Sourced","Listing Generated","Ready"];

function advanceWorkflow(state){
  const index=WORKFLOW_STATES.indexOf(state);
  if(index<0)return "Hunted";
  return WORKFLOW_STATES[Math.min(index+1,WORKFLOW_STATES.length-1)];
}

function createWorkflowProduct(product){
  return {...product,status:product.status||"Hunted",listingOutputs:product.listingOutputs||{USA:{},UK:{}}};
}

function markSourced(product,supplier){ return {...createWorkflowProduct(product),status:"Sourced",supplier}; }\n\nfunction recordListingOutput(product,market,kind,output){\n  const next=createWorkflowProduct(product);\n  next.listingOutputs={...next.listingOutputs,[market]:{...next.listingOutputs[market],[kind]:output}};\n  const generated=next.listingOutputs[market];\n  if(["title","description","options","image"].every(key=>generated[key])) next.status="Ready";\n  else if(next.status==="Sourced"||next.status==="Hunted") next.status="Sourced";\n  else next.status="Listing Generated";\n  return next;\n}\n\nmodule.exports={WORKFLOW_STATES,advanceWorkflow,createWorkflowProduct,markSourced,recordListingOutput};
