import handler from "../handler";
import passport from "passport";
import session from "express-session";
import bodyParser from "body-parser";
import { getCookie } from "cookies-next";
import db from "../db";
const LocalStrategy = require("passport-local").Strategy;
const csrf = require("csurf");
const cors = require("cors");

var csrfProtection = csrf({ cookie: true });
handler.use(csrfProtection);
let parseForm = bodyParser.urlencoded({ extended: false });
handler.use(passport.initialize());
handler.use(passport.session());
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

handler.use(cors(corsOptions));

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (username, password, done) => {
      const result = await db.select().from("auth").where("email", username);
      console.log("result");
      // console.log(result[0]?.first_name);
      if (result.length != 1) {
        return done(null, false, { info: "You are not a valid user" });
      } else {
        if (result[0]?.password == password) {
          return done(null, {
            info: result[0].email,
            name: `${result[0]?.first_name} ${result[0]?.last_name}`,
          });
        } else {
          return done(null, false, { info: "Wrong email/password" });
        }
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log(user);
  console.log(`from serialize ${user.info}`);
  done(null, user);
});

passport.deserializeUser(async function (id, done) {
  console.log("deserializeUser (lookup) " + JSON.stringify(id.info));
  const result = await db.select().from("auth").where("email", id.info);
  console.log("info");
  done(null, result);
});

handler.post(parseForm, csrfProtection, async function (req, res, next) {
  // console.log(await Auth.find());

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(500).json(info);
    }

    req.logIn(user, async function (err) {
      if (err) {
        return next(err);
      }
      console.log(`for checking ${req?.session?.passport?.user?.info}`);
      const user = req?.session?.passport?.user?.info;
      const ck = getCookie("token", { req, res }) || null;
      const save_data = await db
        .select()
        .from("auth")
        .where("email", user)
        .update({
          email: user,
          did: ck,
        });

      return res
        .status(200)
        .json({ info: info, data: req.session, isAuth: req.isAuthenticated() });
    });
  })(req, res, next);
});

handler.get(parseForm,function (req, res) {
  res.json({session:req?.session,csrf:req.csrfToken()});
});

export default handler;
