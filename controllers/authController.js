// IMPORTED REQUIRED PACKAGES
const { jwt, bcrypt, crypto } = require("../utils/packages");

// UTILITY/HELPER FUNCTIONS
const sendEmail = require("../utils/email");

// MODELS
const Token = require("../models/token");
const User = require("../models/user");

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
          status: 403, // forbidden
          success: true,
          message: "USER DOES NOT EXIST!",
        });
      } else {
        User.findOneAndUpdate(
          { email: email },
          {
            name: req.body.firstName + " " + req.body.lastName,
            password: bcrypt.hashSync(req.body.password, salt),
            sign_type: "PLATFORM",
          }
        ).exec((err, user) => {
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
              message: "An email is sent to the admin... please verify...",
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
                  const message = `${process.env.BASE_URL}/superadmin/admin/verify/${user._id}/${req.body.email}/${token.token}`;
                  await sendEmail(req.body.email, "Verify Email", message);
                }
              }
            );
          }
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

// exports.googleAuth = (req, res) => {
//   try {
//     console.log(req);
//   } catch (error) {
//     console.log("ERROR: " + error.message);
//   }
// };

// exports.extra = async(req, res) => {
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
