const WORKFLOW_STATES=["Hunted","Sourced","Listing Generated","Ready"];

function advanceWorkflow(state){
  const index=WORKFLOW_STATES.indexOf(state);
  if(index<0)return "Hunted";
  return WORKFLOW_STATES[Math.min(index+1,WORKFLOW_STATES.length-1)];
}

function createWorkflowProduct(product){
  return {...product,status:product.status||"Hunted",listingOutputs:product.listingOutputs||{USA:{},UK:{}}};
}

function markSourced(product,supplier){
  return {...createWorkflowProduct(product),status:"Sourced",supplier};
}

function recordListingOutput(product,market,kind,output){
  const next=createWorkflowProduct(product);
  next.listingOutputs={...next.listingOutputs,[market]:{...next.listingOutputs[market],[kind]:output}};
  const generated=next.listingOutputs[market];
  if(["title","description","options","image"].every(key=>generated[key])) next.status="Ready";
  else if(next.status==="Sourced"||next.status==="Hunted") next.status="Sourced";
  else next.status="Listing Generated";
  return next;
}

module.exports={WORKFLOW_STATES,advanceWorkflow,createWorkflowProduct,markSourced,recordListingOutput};
