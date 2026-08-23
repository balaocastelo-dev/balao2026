
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { turso } from "@/lib/turso";
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
            try {
                await turso.execute({
                    sql: `UPDATE products SET specs = ?, description = ?, updated_at = ? WHERE id = ?`,
                    args: [
                        typeof update.specs === 'object' ? JSON.stringify(update.specs) : update.specs,
                        update.description ?? null,
                        new Date().toISOString(),
                        update.id,
                    ],
                });
                successIds.push(update.id);

                // Log Audit
                await turso.execute({
                    sql: `INSERT INTO audit_logs (id, action, entity_type, entity_id, details, created_at)
                          VALUES (?, ?, ?, ?, ?, ?)`,
                    args: [
                        randomUUID(),
                        'AI_ENRICHMENT',
                        'product',
                        update.id,
                        JSON.stringify({
                            specs_updated: true,
                            description_updated: !!update.description
                        }),
                        new Date().toISOString(),
                    ],
                });
            } catch (err: any) {
                errors.push({ id: update.id, error: err.message });
            }
        }

        return NextResponse.json({ success: true, updated: successIds, errors });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
