import { CreateFormDTO, Form } from "./form.model";

import { Repository } from "@app/internal/postgres";

export const selection = ["form.*", "product.name as product_name", "vendor.name as vendor_name"];

export class FormRepository extends Repository<Form> {
  private db = this.setup("form");

  async createForm(dto: CreateFormDTO): Promise<Form> {
    const [request] = await this.db().insert(dto, "*");

    return request;
  }

  async updateForm(id: string, dto: Partial<Form>): Promise<Form> {
    const [request] = await this.db().update(dto, "*").where("id", id);
    return request;
  }

  async getForm(id: string): Promise<Form> {
    return await this.db()
      .where("id", id)
      .join("product", "form.product_id", "product.id")
      .join("vendor", "form.vendor_id", "vendor.id")
      .select(...selection)
      .first();
  }

  async fetchForm(id: string): Promise<Form> {
    return await this.db().where("id", id).first();
  }

  async getFirstUserForm(id: string): Promise<Form[]> {
    return await this.db()
      .where("first_user_id", id)
      .join("product", "form.product_id", "product.id")
      .join("vendor", "form.vendor_id", "vendor.id")
      .select(...selection);
  }

  async getSecondUserForm(): Promise<Form[]> {
    return await this.db()
      .whereNotNull("first_user_id")
      .andWhere({ second_user_id: null })
      .join("product", "form.product_id", "product.id")
      .join("vendor", "form.vendor_id", "vendor.id")
      .select(...selection);
  }

  async getForms(): Promise<Form[]> {
    return await this.db()
      .join("product", "form.product_id", "product.id")
      .join("vendor", "form.vendor_id", "vendor.id")
      .select(...selection);
  }
}
