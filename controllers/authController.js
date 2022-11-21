// IMPORTED REQUIRED PACKAGES
const { jwt, bcrypt, crypto, OAuth2Client } = require("../utils/packages");
const client = new OAuth2Client(process.env.CLIENT_ID);
// UTILITY/HELPER FUNCTIONS
const sendEmail = require("../utils/email");

// MODELS
const Token = require("../models/token");
const User = require("../models/user");

/*
=============================================================================
|                                 AUTH ROUTES                               |
=============================================================================
*/

exports.register = (req, res) => {
  try {
    let salt = bcrypt.genSaltSync(10);
    const email = req.body.email;
    User.findOne({ email: email, verified: false }).exec((err, user) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (!user) {
        res.send({
          status: 403,
          success: true,
          message: "USER DOES NOT EXIST!",
        });
      } else {
        const userObj = {
          name: req.body.firstName + " " + req.body.lastName,
          password: bcrypt.hashSync(req.body.password, salt),
          sign_type: "PLATFORM",
          status: "ACTIVE",
        };
        options = { new: true, upsert: true };
        User.findOneAndUpdate({ email: email }, userObj, options).exec(
          (err, user) => {
            if (err) {
              res.send({
                status: 500,
                success: false,
                message: err.message,
              });
            } else {
              let successObject = {
                token: jwt.sign({ _id: user._id }, process.env.JWTSECRET, {
                  expiresIn: "60m",
                }),
                user,
                message: "An email is sent to the admin... Please verify...",
              };
              Token.create(
                {
                  userId: user._id,
                  token: crypto.randomBytes(32).toString("hex"),
                },
                async (err, token) => {
                  if (err) {
                    res.send({
                      status: 500,
                      success: false,
                      message: err.message,
                    });
                  } else {
                    res.json(successObject);
                    const message = `${process.env.FRONTEND}/superadmin/admin/verify/${user._id}/${req.body.email}/${token.token}`;
                    await sendEmail(req.body.email, "Verify Email", message);
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (err) {
    res.send({
      status: 500,
      success: false,
      message: err.message,
    });
  }
};

exports.login = (req, res) => {
  try {
    User.findOne({ email: req.body.email }).exec((err, user) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (user && bcrypt.compareSync(req.body.password, user.password)) {
        payload = {
          role: user.role,
          _id: user.id,
        };
        let successObject = {
          token: jwt.sign(payload, process.env.JWTSECRET, { expiresIn: "1d" }),
          user,
        };
        res.json(successObject);
      } else {
        res.send({
          status: 500,
          success: false,
          message: "INCORRECT CREDENTIALS!",
        });
      }
    });
  } catch (err) {
    res.send({
      status: 500,
      success: false,
      message: err.message,
    });
  }
};

exports.googleSignIn = async (req, res) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log(ticket?.payload);
    const email = ticket?.payload?.email;
    console.log(email);

    User.find({ email: email }).exec((err, user) => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          message: err.message,
        });
      } else if (!user) {
        res.send({
          status: 404, // user not found
          success: true,
          message: `USER ISN'T AUTHORIZED TO SIGN UP!`,
        });
      } else {
        if (user.status === "UNREGISTERED") {
          User.findOneAndUpdate(
            { email: email },
            {
              email: ticket?.payload?.email,
              pdf: ticket?.payload?.picture,
              verified: true,
              status: "ACTIVE",
              sign_type: "GOOGLE",
            }
          ).exec((err, updatedUser) => {
            if (err) {
              res.send({
                status: 500,
                success: false,
                message: err.message,
              });
            } else {
              res.send({
                status: 200,
                success: true,
                userObj: {
                  message: "USER IS SUCCESSFULLY REGISTERED!",
                  token: jwt.sign(payload, process.env.JWTSECRET, {
                    expiresIn: "1d",
                  }),
                  updatedUser,
                },
              });
            }
          });
        }
      }
    });
  } catch (error) {
    console.log("ERROR: " + error.message);
  }
};

// const createNewUser = async(req, res) => {
//     let salt = bcrypt.genSaltSync(10);
//     try{
//         await User.create({
//             name: "Rehber Odhano",
//             email: "rehber.odhano30@gmail.com",
//             password: bcrypt.hashSync('testpass', salt),
//             role: "SUPERADMIN",
//             sign_type: "PLATFORM",
//             company_id: "628a427b37e194b45b798a3a"
//         }, (err, user) => {
//             if (err) res.send(err)
//             res.send(user)
//         })
//     } catch (err) {
//         console.log(err)
//     }
// }

// exports.profile = (requiresAuth(), (req, res) => {
//     res.send(req.oidc.isAuthenticated() ? req.oidc.user : "Logged out!");
// });
