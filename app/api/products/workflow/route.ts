import { NextRequest, NextResponse } from "next/server";
import { mergeWorkflowUpdate } from "../../../../lib/product-workflow-store.js";

const memory = globalThis.__miaanWorkflowProducts || (globalThis.__miaanWorkflowProducts = new Map());

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.product?.id) return NextResponse.json({error:"product.id is required"},{status:400});
    const existing = memory.get(String(body.product.id)) || body.product;
    const updated = mergeWorkflowUpdate(existing, body.update || {});
    memory.set(String(body.product.id), updated);
    return NextResponse.json({product:updated});
  } catch {
    return NextResponse.json({error:"Invalid workflow update"},{status:400});
  }
}

export async function GET(request: NextRequest) {
  const id=request.nextUrl.searchParams.get("id");
  if(!id) return NextResponse.json({error:"id is required"},{status:400});
  const product=memory.get(id);
  if(!product) return NextResponse.json({error:"Product not found"},{status:404});
  return NextResponse.json({product});
}
