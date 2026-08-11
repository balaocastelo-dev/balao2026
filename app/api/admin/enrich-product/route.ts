
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { enrichProductWithAI } from "@/lib/ai-service";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { products } = body; // Array of { id, name }

        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: "No products provided" }, { status: 400 });
        }

        const results = [];
        const logs = [];

        for (const product of products) {
            try {
                // 1. Call AI Service
                const enrichment = await enrichProductWithAI(product.name);
                
                // 2. Prepare Update (Don't save yet, just return preview)
                // If the user requested "commit: true", we would save. 
                // But the UI flow asks for preview first usually.
                // However, for "automated processing" as requested, we might want to return the proposed changes.
                
                results.push({
                    id: product.id,
                    name: product.name,
                    original_specs: product.specs || {},
                    original_description: product.description || "",
                    new_specs: enrichment.specs,
                    new_description: enrichment.description,
                    seo_title: enrichment.seo_title,
                    seo_description: enrichment.seo_description,
                    bullet_points: enrichment.bullet_points,
                    json_ld: enrichment.json_ld,
                    status: 'success'
                });

            } catch (err: any) {
                console.error(`Error enriching product ${product.id}:`, err);
                results.push({
                    id: product.id,
                    name: product.name,
                    error: err.message,
                    status: 'error'
                });
            }
        }

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error("Enrichment API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    // Commit changes
    try {
        const body = await req.json();
        const { updates } = body; // Array of { id, specs, description }

        if (!updates || !Array.isArray(updates)) {
            return NextResponse.json({ error: "Invalid updates" }, { status: 400 });
        }

        const successIds = [];
        const errors = [];

        for (const update of updates) {
            const { error } = await supabaseAdmin
                .from('products')
                .update({ 
                    specs: update.specs,
                    description: update.description,
                    // updated_at is handled by trigger usually, but we can set it
                })
                .eq('id', update.id);

            if (error) {
                errors.push({ id: update.id, error: error.message });
            } else {
                successIds.push(update.id);
                
                // Log Audit
                await supabaseAdmin.from('audit_logs').insert({
                    action: 'AI_ENRICHMENT',
                    entity_type: 'product',
                    entity_id: update.id,
                    details: {
                        specs_updated: true,
                        description_updated: !!update.description
                    }
                });
            }
        }

        return NextResponse.json({ success: true, updated: successIds, errors });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
