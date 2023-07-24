import passport from "passport";
import session from "express-session";
import { getCookie } from "cookies-next";
const LocalStrategy = require("passport-local").Strategy;
import handler from "../api/handler";

handler.get((req, res) => {
  const csrf = getCookie("_csrf", { req, res }) || null;
  console.log(csrf);
  res.json({ csrf: csrf });
});
export default handler;
