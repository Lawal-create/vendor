import { Request, Response } from "express";
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  request,
  requestBody,
  requestParam,
  response
} from "inversify-express-utils";

import { ApplicationError } from "@app/internal/errors";
import { Controller } from "@app/internal/controller";
import { StatusCodes } from "http-status-codes";
import TYPES from "@app/config/inversify.types";
import { inject } from "inversify";
import { Form, FormDTO, FormRepository } from "@app/forms";
import { ProductRepository } from "@app/products";
import { checkAdmin, verifyToken } from "@app/http/middlewares";

@controller("/forms")
export class FormController extends Controller<any> {
  @inject(TYPES.FormRepository) private forms: FormRepository;
  @inject(TYPES.ProductRepository) private productRepo: ProductRepository;

  @httpGet("/:id", verifyToken)
  async fetchForm(@request() req: Request, @response() res: Response, @requestParam("id") id: string) {
    try {
      const response = await this.forms.getForm(id);
      if (!response) {
        throw new ApplicationError(StatusCodes.NOT_FOUND, "This form does not exist");
      }
      return this.send(req, res, response);
    } catch (error) {
      this.log.error(error);
      throw error;
    }
  }

  @httpGet("/userA/:id", verifyToken)
  async fetchUserA(@request() req: Request, @response() res: Response, @requestParam("id") id: string) {
    try {
      const response = await this.forms.getFirstUserForm(id);
      return this.send(req, res, response);
    } catch (error) {
      this.log.error(error);
      throw error;
    }
  }

  @httpGet("/user/second", verifyToken, checkAdmin)
  async fetchUserB(@request() req: Request, @response() res: Response) {
    try {
      const response = await this.forms.getSecondUserForm();
      return this.send(req, res, response);
    } catch (error) {
      this.log.error(error);
      throw error;
    }
  }

  @httpGet("/", verifyToken)
  async fetchAllForms(@request() req: Request, @response() res: Response) {
    const response = await this.forms.getForms();
    return this.send(req, res, response);
  }

  @httpPut("/:id", verifyToken, checkAdmin)
  async updateForm(
    @request() req: Request,
    @response() res: Response,
    @requestParam("id") id: string,
    @requestBody() dto: Partial<Form>
  ) {
    try {
      const form = await this.forms.fetchForm(id);
      if (!form) {
        throw new ApplicationError(StatusCodes.NOT_FOUND, "This form does not exist");
      }
      const userid = req["user"]["uid"];

      const response = await this.forms.updateForm(id, { ...dto, second_user_id: userid });
      return this.send(req, res, response);
    } catch (error) {
      this.log.error(error);
      throw error;
    }
  }

  @httpPost("/", verifyToken)
  async createForm(@request() req: Request, @response() res: Response, @requestBody() dto: FormDTO) {
    const product = await this.productRepo.getProduct(dto.product_id);
    const userid = req["user"]["uid"];
    const response = await this.forms.createForm({ ...dto, vendor_id: product.vendor_id, first_user_id: userid });
    return this.send(req, res, response);
  }
}
