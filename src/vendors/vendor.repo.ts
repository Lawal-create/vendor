import { Repository } from "@app/internal/postgres";
import { Vendor } from "./vendor.model";

export class VendorRepository extends Repository<Vendor> {
  private db = this.setup("vendor");

  async createVendor(name: string) {
    const [request] = await this.db().insert(
      {
        name
      },
      "*"
    );

    return request;
  }
}
