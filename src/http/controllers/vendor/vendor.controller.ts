import { Request, Response } from "express";
import { controller, httpGet, httpPost, request, requestBody, response } from "inversify-express-utils";

import { ApplicationError } from "@app/internal/errors";
import { Controller } from "@app/internal/controller";
import { StatusCodes } from "http-status-codes";
import TYPES from "@app/config/inversify.types";
import { VendorDTO, VendorRepository } from "@app/vendors";
import { inject } from "inversify";

@controller("/vendors")
export class VendorController extends Controller<any> {
  @inject(TYPES.VendorRepository) private vendor: VendorRepository;

  @httpPost("/")
  async create(@request() req: Request, @response() res: Response, @requestBody() dto: VendorDTO) {
    const response = await this.vendor.createVendor(dto.name);
    return this.send(req, res, response);
  }

  @httpGet("/:id")
  async get(@request() req: Request, @response() res: Response, @requestBody() dto: VendorDTO) {
    const response = await this.vendor.createVendor(dto.name);
    if (!response) {
      throw new ApplicationError(StatusCodes.NOT_FOUND, "This vendor does not exist");
    }
    return this.send(req, res, response);
  }
}
