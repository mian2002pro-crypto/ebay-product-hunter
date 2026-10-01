function mergeWorkflowUpdate(product,update){
  return {
    ...product,
    ...update,
    listingOutputs:{
      ...(product.listingOutputs||{}),
      ...(update.listingOutputs||{})
    }
  };
}
module.exports={mergeWorkflowUpdate};
