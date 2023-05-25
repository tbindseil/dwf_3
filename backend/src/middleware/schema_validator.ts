// import { Request, Response, NextFunction } from 'express';
// import _schema from './_schema';
// import { UserPostRequest } from './schema_definition';
// import Ajv from 'ajv';
//
// // validation middleware
// function validateBody(schema: object) {
//     // compile schema
//     const validate = ajv.compile(schema);
//     // middleware that returns error if schema is not ok
//     return (req: any, res: any, next: NextFunction) => {
//         if (!validate(req.body)) return res.status(400).json(validate.errors);
//         return next();
//     };
// }
//
//
// // .T???
// app.post(
//     '/user',
//     validateBody(_schema.UserPostRequest),
//
// // TODO probably want to create in app.ts and inject (with function arg binding) into the middleware
// const ajv = new Ajv();
//
// export const validateRequestBodySchema = (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     res;
//
//     // this is probably where we need to get the schema validation object with the path
//
//     // man, things are spiralling quite a bit
//     //
//     // seems like now I would have to have a single place to define routes
//     //
//     // maybe the apihandlers could define routes? and know their schema object?
//     //
//     // naw
//     //
//     // it would just need to be input type, path
//     //
//     // then, the handler/api can ...
//
//     req.path;
//
//     next();
// };
//
//
//
//
//
// import express, { Request, Response, NextFunction } from "express";
// import _schema from "./_schema";
// import { UserPostRequest } from "./schema_definition";
// import Ajv from "ajv";
//
// const app = express();
// app.use(express.json());
//
// const ajv = new Ajv();
//
// // validation middleware
// function validateBody(schema: object) {
//   // compile schema
//   const validate = ajv.compile(schema);
//   // middleware that returns error if schema is not ok
//   return (req: any, res: any, next: NextFunction) => {
//     if (!validate(req.body)) return res.status(400).json(validate.errors);
//     return next();
//   };
// }
//
// // helper type
// type RequestBody<T> = Request<{}, {}, T>;
//
// // dummy function
// function addUser(name: string) {}
//
// // .T???
// app.post("/user", validateBody(_schema.UserPostRequest), (req: RequestBody<UserPostRequest>, res: Response) => {
//   return addUser(req.body.name); // name will never be undefined
// });
//
// app.listen(3000);
//
