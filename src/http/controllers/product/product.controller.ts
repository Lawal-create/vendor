import { Request, Response } from "express";
import { controller, httpGet, httpPost, request, requestBody, requestParam, response } from "inversify-express-utils";

import { ApplicationError } from "@app/internal/errors";
import { Controller } from "@app/internal/controller";
import { ProductDTO, ProductRepository } from "@app/products";
import { StatusCodes } from "http-status-codes";
import TYPES from "@app/config/inversify.types";
import { inject } from "inversify";

@controller("/products")
export class ProductController extends Controller<any> {
  @inject(TYPES.ProductRepository) private product: ProductRepository;

  @httpGet("")
  async fetchAllProducts(@request() req: Request, @response() res: Response) {
    const response = await this.product.getProducts();
    console.log({ response });
    return this.send(req, res, response);
  }

  @httpGet("/:id")
  async fetchProduct(@request() req: Request, @response() res: Response, @requestParam("id") id: string) {
    const response = await this.product.getProduct(id);
    if (!response) {
      throw new ApplicationError(StatusCodes.NOT_FOUND, "This product does not exist");
    }
    return this.send(req, res, response);
  }

  @httpPost("/")
  async createProduct(@request() req: Request, @response() res: Response, @requestBody() dto: ProductDTO) {
    const response = await this.product.createProduct(dto.name, dto.vendor_id);
    return this.send(req, res, response);
  }
}
