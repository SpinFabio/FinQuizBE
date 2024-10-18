import  { Request, Response, NextFunction } from 'express';



export default function errorHandler(err: Error, _: Request, res: Response, next: NextFunction){
  console.error(err.stack);
  res
    .status(500)
    .json({ message: 'Something broke!', error: err.message });
}