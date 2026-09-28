const WORKFLOW_STATES=["Hunted","Sourced","Listing Generated","Ready"];

function advanceWorkflow(state){
  const index=WORKFLOW_STATES.indexOf(state);
  if(index<0)return "Hunted";
  return WORKFLOW_STATES[Math.min(index+1,WORKFLOW_STATES.length-1)];
}

function createWorkflowProduct(product){
  return {...product,status:product.status||"Hunted",listingOutputs:product.listingOutputs||{USA:{},UK:{}}};
}

function markSourced(product,supplier){ return {...createWorkflowProduct(product),status:"Sourced",supplier}; }\n\nmodule.exports={WORKFLOW_STATES,advanceWorkflow,createWorkflowProduct,markSourced};
