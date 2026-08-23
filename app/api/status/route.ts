import { GET as getCrmStatus } from "@/app/api/crm/status/route";

export const dynamic = "force-dynamic";

export async function GET() {
  return getCrmStatus();
}
