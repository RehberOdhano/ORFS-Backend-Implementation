const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = (req, res) => {
  try {
    let salt = bcrypt.genSaltSync(10);
    const email = req.body.email;
    User.findOne({ email: email, verified: false })
      .exec((err, user) => {
        if (err) {
          res.send({
            status: 500,
            success: false,
            message: err.message,
          });
        } else {
          User.updateOne(
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
              };
              res.json(successObject);
            }
          });
        }
      })
      .clone();
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
