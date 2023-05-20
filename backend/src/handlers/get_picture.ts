import { GetPictureInput, GetPictureOutput } from "dwf-3-models-tjb";
import API from "./api";
import APIError from "./api_error";
import IDB from "../db";
import PictureAccessor from "../picture_accessor/picture_accessor";

export class GetPicture extends API {
  private readonly pictureAccessor: PictureAccessor;

  constructor(db: IDB, pictureAccessor: PictureAccessor) {
    super(db, "GET", "picture");

    this.pictureAccessor = pictureAccessor;
  }

  public getInput(body: any): GetPictureInput {
    if ("id" in body) {
      return {
        id: body.id,
      };
    } else {
      throw new APIError(400, "id must be provided, picture not returned");
    }
  }

  public async process(
    db: IDB,
    input: GetPictureInput
  ): Promise<GetPictureOutput> {
    const query = "select filename from picture where id = ?;";
    const params = [input.id];

    try {
      const result = await db.query(query, params);
      const filename = result.rows[0].filename;
      return await this.pictureAccessor.getPicture(filename);
    } catch (error) {
      throw new APIError(500, "database issue, picture not fetched");
    }
  }

  public getContentType(): string {
    return "image/png";
  }

  public serializeOutput(output: any): any {
    return output;
  }
}
