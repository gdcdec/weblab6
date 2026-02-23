import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import userModel from "../database/model/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            const user = await userModel.findByPk(payload.id);
            if(user) {
                return done(null, user);
            }
            return done(null, false);
        } catch(error) {
            return done(error, false);
        }
    })
);

const requireJwt = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if(err) {
      console.error(err);
      return res.status(500).json({
          message: 'Authentication error', error: err.message
      });
    }
    if(!user) {
      const msg = 'Unauthorized';
      return res.status(401).json({ message: msg });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export { passport, requireJwt };
