import { Product } from "./product.model";
import { Repository } from "@app/internal/postgres";

export const selection = ["product.*", "vendor.name as vendor_name"];

export class ProductRepository extends Repository<Product> {
  private db = this.setup("product");

  async createProduct(name: string, vendorID: string) {
    const [request] = await this.db().insert(
      {
        name,
        vendor_id: vendorID
      },
      "*"
    );

    return request;
  }

  async getProduct(id: string) {
    return await this.db().where("id", id).first();
  }

  async getProducts() {
    return await this.db()
      .join("vendor", "product.vendor_id", "vendor.id")
      .select(...selection);
  }
}
