import { campaign } from "@/lib/config/campaign";
import type { SheetRow } from "@/lib/integrations/google-sheets";

export type ParticipationForSheet = {
  id: number;
  folio: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  store_code: string;
  purchase_date: string;
  status: string;
  marketing_opt_in: boolean;
  created_at: string;
};

function storeLabel(storeCode: string): string {
  return campaign.allowedStores.find((store) => store.value === storeCode)?.label ?? storeCode;
}

function participationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    received: "Recibida",
    valid: "Válida",
    invalid: "Inválida",
    winner: "Ganadora",
    deleted: "Eliminada",
  };

  return labels[status] ?? status;
}

export function buildSheetRow(participation: ParticipationForSheet, syncedAt: string): SheetRow {
  return {
    folio: participation.folio,
    registeredAt: participation.created_at,
    firstName: participation.first_name,
    lastName: participation.last_name,
    email: participation.email,
    phone: participation.phone,
    store: storeLabel(participation.store_code),
    purchaseDate: participation.purchase_date,
    participationStatus: participationStatusLabel(participation.status),
    marketingOptIn: participation.marketing_opt_in,
    lastSyncedAt: syncedAt,
  };
}
