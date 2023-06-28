import { Model } from "@app/internal/postgres";

export interface Form extends Model {
  product_id: string;
  user_name: string;
  vendor_id: string;
  first_user_note: string;
  second_user_note?: string;
  first_user_id: string;
  second_user_id?: string;
  has_good_taste?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FormDTO {
  product_id: string;
  user_name: string;
  first_user_note: string;
  first_user_id: string;
}

export interface CreateFormDTO extends FormDTO {
  vendor_id: string;
}
