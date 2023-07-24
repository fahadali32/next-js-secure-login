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
      return done(null, { info: username });
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log(`from serialize ${user.info}`);
  done(null, user);
});

passport.deserializeUser(async function (id, done) {
  console.log("deserializeUser (lookup) " + JSON.stringify(id));
  const result = await db.select().from("auth").where("email", id?.info);
  console.log(result);
  done(null, result);
});

handler.post(csrfProtection, parseForm, async (req, res, next) => {
  const { username, password, firstname, lastname, email, type } = req.body;

  const emailFind = await db.select().from("auth").where("email", email);
  console.log(emailFind);
  const userName = await await db
    .select()
    .from("auth")
    .where("username", username);
  console.log(emailFind.length == 0);
  if (emailFind.length != 0) {
    res.status(200).json("This email is already used");
  } else if (userName.length != 0) {
    res.status(200).json("This username is already used");
  } else {
    try {
      const data = await db
        .insert({
          username: username,
          password: password,
          first_name: firstname,
          last_name: lastname,
          email: email,
          type: type,
        })
        .into("auth");

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
          console.log(save_data);
          return res.status(200).json({
            info: info,
            data: req.session,
            isAuth: req.isAuthenticated(),
          });
        });
      })(req, res, next);
    } catch (error) {
      console.log(error);
      res.json(JSON.stringify(error));
    }
  }
});

handler.get(parseForm, function (req, res) {
  res.send(req.csrfToken());
});

// handler.post(parseForm, csrfProtection, async function (req, res) {
//   // console.log(req.csrfToken());
//   const { username, password, firstname, lastname, email, type } = req.body;
//   console.log(req.body);
//   res.json({
//     username: username,
//     password: password,
//     first_name: firstname,
//     last_name: lastname,
//     email: email,
//     type: type,
//   });
// });

export default handler;
