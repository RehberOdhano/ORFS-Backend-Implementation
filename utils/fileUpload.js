const { path, multer } = require("../utils/packages");

const fileSize = 1024 * 1024 * 5;

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/csv-files");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

exports.upload = multer({
  storage: fileStorageEngine,
  limits: { fileSize: fileSize },
  fileFilter: (req, file, cb) => {
    var ext = path.extname(file.originalname);
    if (file.size > fileSize) {
      return cb(new Error("FILE SIZE SHOULD NOT BE MORE THAN 5MBs!"));
    } else {
      if (ext !== ".csv") {
        return cb(new Error("ONLY CSV FILES ARE ALLOWED!"));
      } else {
        return cb(null, true);
      }
    }
  },
}).single("csv_file");
