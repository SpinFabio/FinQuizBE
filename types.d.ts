import { UserFE } from "./src/common/user-interfaces";
import { AuthCookies } from "./src/common/auth-interface";

declare global {
  namespace Express {
    interface Request {
      user?: UserFE;
      cookies?: AuthCookies;
    }
  }
}
