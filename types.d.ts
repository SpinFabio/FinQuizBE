import { UserFE,AuthCookies } from "./src/common/user-interfaces";

declare global {
  namespace Express {
    interface Request {
      user?: UserFE;
      cookies?: AuthCookies;
    }
  }
}
