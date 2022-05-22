const User = require('../models/user');
const Complaint = require('../models/complaint');
const Category = require('../models/category');
const Customer = require('../models/customer')
const Department = require('../models/department');
const Complainee = require('../models/complainee');
const SP = require('../models/serviceProvider');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

exports.getUsersList = (req, res) => {
    try {
        const company_id = mongoose.Types.ObjectId(req.params.id);
        User.find({ company_id: company_id }).exec((err, result) => {
            if (err) return res.send("NOT ABLE TO FIND ANY USER!");
            else if (result == null) return res.send("USERS DOES NOT EXIST!");
            else return res.json(result);
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

// exports.getSpecificUser = async(req, res) => {
//     const user_id = req.params.id;
//     await User.findOne({ id: user_id }, (err, user) => {
//         if (err) res.send("USER DOES NOT EXIST!");
//         else res.send(user);
//     });
// }

exports.addSpecificUser = (req, res) => {
    try {
        let salt = bcrypt.genSaltSync(10);
        const full_name = req.body.name;
        const email = req.body.email;
        const role = req.body.role;
        User.findOne({ name: full_name, email: email }).exec((err, user) => {
            if (err) return res.send("1." + err);
            else if (user) return res.send("USER ALREADY EXISTS!");
            else {
                User.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: bcrypt.hashSync('user', salt),
                    role: role,
                    sign_type: 'PLATFORM',
                    company_id: mongoose.Types.ObjectId(req.params.id)
                }, (err, user) => {
                    if (err) {
                        return res.send("NOT ABLE TO ADD THE USER!" + err);
                    } else {
                        Customer.updateOne({ __id: req.params.id }, { $push: { employees: { email: user.email } } }).exec((err, result) => {
                            if (err) return res.send("NOT ABLE TO ADD THE USER'S EMAIL IN THE EMPLOYEES ARRAY!");
                            else {
                                if (role == "COMPLAINEE") {
                                    Complainee.create({
                                        user_id: user._id,
                                        company_id: user.company_id
                                    }, (err, result) => {
                                        if (err) return res.send("2." + err);
                                        else return res.send("BOTH USER AND COMPLAINEE ARE CREATED!");
                                    });
                                } else if (role == "SERVICEPROVIDER") {
                                    SP.create({
                                        user_id: user._id,
                                        company_id: user.company_id
                                    }, (err, result) => {
                                        if (err) return res.send("3." + err);
                                        else return res.send("BOTH USER AND SERVICEPROVIDER ARE CREATED!");
                                    });
                                }
                                return res.send("USER IS SUCCESSFULLY ADDED!");
                            }
                        });
                    }
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
        return;
    }
}

exports.updateSpecificUser = async(req, res) => {
    try {
        const id = req.params.id;
        const full_name = req.body.name;
        const email = req.body.email;
        await User.findByIdAndUpdate(id, { name: full_name, email: email }, (err, user) => {
            if (err) return res.send("NOT ABLE TO UPDATE THE USER!");
            else return res.send("USER IS SUCCESSFULLY UPDATED!");
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

exports.deleteSpecificUser = async(req, res) => {
    try {
        const user_id = req.params.id;
        await User.findByIdAndDelete(user_id, (err, user) => {
            if (err) return res.send("NOT ABLE TO DELETE THE USER!");
            else return res.send("USER IS SUCCESSFULLY DELETED!");
        });
    } catch (err) {
        console.log(err);
    }
}

exports.deleteMultipleUsers = (req, res) => {
    try {
        const user_ids = req.body.ids;
        user_ids.forEach(id => {
            User.findByIdAndDelete(id, (err, user) => {
                if (err) return res.send("NOT ABLE TO DELETE THE USER WITH ID: " + id);
                else return res.send("SUCCESSFULLY DELETED ALL THE MENTIONED USERS!");
            });
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

// exports.getRolesList = async(req, res) => {
//     try {
//         await Role.find({}, (err, roles) => {
//             if (err) res.send("OOPS... NO DATA IN THE DATABASE!");
//             else {
//                 res.send(roles);
//             }
//         });
//     } catch (err) {
//         console.log(err);
//     }
// }

// exports.getSpecificRole = async(req, res) => {
//     const _id = req.query.id;
//     await Role.findOne({ id: _id }, (err, role) => {
//         if (err) res.send("OOPS... NO DATA IN THE DATABASE!");
//         else res.send(role);
//     });
// }

// exports.updateSpecificRole = async(req, res) => {
//     const id = req.params.id;
//     await Role.findByIdAndUpdate(id, {}, (err, role) => {
//         if (role) res.send("NOT ABLE TO UPDATE THE ROLE!");
//         else res.send("ROLE IS SUCCESSFULLY UPDATED!");
//     });
// }

// exports.deleteSpecificRole = async(req, res) => {
//     const role_id = req.params.id;
//     await Role.findByIdAndDelete(role_id, (err, role) => {
//         if (err) res.send("NOT ABLE TO DELETE THE ROLE!");
//         else res.send("ROLE IS SUCCESSFULLY DELETED!");
//     });
// }

// exports.deleteMultipleRole = (req, res) => {
//     const role_ids = req.body.ids;
//     role_ids.forEach(id => {
//         Role.findByIdAndDelete(id, (err, role) => {
//             if (err) res.send("NOT ABLE TO DELETE THE ROLE WITH ID: " + id);
//         });
//         res.send("SUCCESSFULLY DELETED ALL THE MENTIONED ROLES!");
//     });
// }

exports.getComplaintsList = async(req, res) => {
    try {
        await Complaint.find({}, (err, complaints) => {
            if (err) return res.send("OOPS... NO DATA IN THE DATABASE!");
            else return res.send(complaints);
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

// exports.getSpecificComplaint = async(req, res) => {
//     try {
//         const _id = req.params.id;
//         await Complaint.findOne({ id: _id }, (err, complaint) => {
//             if (err) res.send("OOPS... NO DATA IN THE DATABASE!");
//             else res.send(complaint);
//         });
//     } catch (err) {
//         console.log(err);
//     }
// }

// ASSIGN COMPLAINT
exports.updateSpecificComplaint = async(req, res) => {
    try {
        const id = req.params.id;
        await Complaint.findByIdAndUpdate(id, {}, (err, complaint) => {
            if (err) return res.send("NOT ABLE TO UPDATE THE COMPLAINT!");
            else if (complaint == null) return res.send("COMPLAINT NOT FOUND!");
            else return res.send("COMPLAINT IS SUCCESSFULLY UPDATED!");
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

exports.deleteSpecificComplaint = async(req, res) => {
    try {
        const complaint_id = req.params.id;
        await Complaint.findByIdAndDelete(complaint_id, (err, complaint) => {
            if (err) return res.send("NOT ABLE TO DELETE THE COMPLAINT!");
            else if (complaint == null) return res.send("COMPLAINT NOT FOUND!");
            else return res.send("COMPLAINT IS SUCCESSFULLY DELETED!");
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

exports.archiveSpecificComplaint = async(req, res) => {
    try {
        const complaint_id = req.params.id;
        await Complaint.findByIdAndUpdate(complaint_id, { status: "archived" }, (err, complaint) => {
            if (err) return res.send("NOT ABLE TO ARCHIVE THE COMPLAINT!");
            else if (complaint == null) return res.send("COMPLAINT NOT FOUND!");
            else return res.send("COMPLAINT IS SUCCESSFULLY ARCHIVED!");
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

exports.getDeptsList = async(req, res) => {
    try {
        await Department.find({}, (err, depts) => {
            if (err) return res.send("OOPS... NO DATA IN THE DATABASE!");
            else return res.send(depts);
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

exports.getSpecificDept = async(req, res) => {
    try {
        const dept_id = req.query.id;
        await Department.findOne({ id: dept_id }, (err, dept) => {
            if (err) return res.send("DEPT DOES NOT EXIST!");
            else if (dept == null) return res.send("DEPT NOT FOUND!");
            else return res.send(dept);
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

exports.addSpecificDept = (req, res) => {
    try {
        const dept_title = req.body.title;
        const company_id = mongoose.Types.ObjectId(req.params.company_id);
        const category_title = req.body.category_title;
        const dept = new Department({ title: dept_title, company_id: company_id });
        const category = new Category({ title: category_title, company_id: company_id });
        dept.category.push(category);
        category.save();
        dept.save((err, dept) => {
            if (err) return res.send("NOT ABLE TO SAVE THE DEPARTMENT!");
            else {
                Department.findOne({ title: dept_title }).populate('category').exec((err, dept) => {
                    if (err) return res.send("NOT ABLE TO ADD DEPARTMENT!");
                    else return res.send("DEPARTMENT IS SUCCESSFULLY ADDED!" + JSON.stringify(dept));
                });
            }
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

exports.updateSpecificDept = async(req, res) => {
    try {
        const id = req.params.id;
        const dept_title = req.body.title;
        await Department.findByIdAndUpdate(id, { title: dept_title }, (err, dept) => {
            if (err) return res.send("NOT ABLE TO UPDATE THE DEPT!");
            else if (dept == null) return res.send("DEPT NOT FOUND!");
            else return res.send("DEPT IS SUCCESSFULLY UPDATED!");
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

exports.deleteSpecificDept = async(req, res) => {
    try {
        const dept_id = req.params.id;
        await Department.findByIdAndDelete(dept_id, (err, dept) => {
            if (err) return res.send("NOT ABLE TO DELETE THE DEPT!");
            else if (dept == null) return res.send("DEPT NOT FOUND!");
            else return res.send("DEPT IS SUCCESSFULLY DELETED!");
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}