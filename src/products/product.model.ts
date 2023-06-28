import { Model } from "@app/internal/postgres";

export interface Product extends Model {
  name: string;
  vendor_id: string;
}

export type ProductDTO = Pick<Product, "name" | "vendor_id">;
