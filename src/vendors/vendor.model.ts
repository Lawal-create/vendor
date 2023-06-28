import { Model } from "@app/internal/postgres";

export interface Vendor extends Model {
  name: string;
}

export type VendorDTO = Omit<Vendor, "id">;
