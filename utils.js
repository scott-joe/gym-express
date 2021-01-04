const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const fsOpts = { encoding: "utf-8" };

function getUserFilePath(username) {
  return path.join(__dirname, "data", "users", `${username}.json`);
}

// Read user json file and parse results
function getUser(username) {
  const address = {};
  // read specific user's file
  const user = JSON.parse(fs.readFileSync(getUserFilePath(username), fsOpts));
  // iterate over user's location data and apply StartCase
  for (const [key, value] of Object.entries(user.location)) {
    address[key] = _.startCase(value);
  }

  return {
    ...user,
    location: address,
    name: {
      ...user.name,
      full: _.startCase(`${user.name.first} ${user.name.last}`),
    },
  };
}

// Save user data to file
function saveUser(username, data) {
  try {
    const filename = getUserFilePath(username);
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), fsOpts);
  } catch (error) {
    log.error(error);
    throw error;
  }
}

// Verify user/file middleware
function verifyUser(req, res, next) {
  const filePath = getUserFilePath(req.params.username);
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.redirect(`/error/${req.params.username}`);
    } else {
      if (stats.isFile()) next();
    }
  });
}

const compare = (a, b) => {
  const splitA = a.name.full.split(" ");
  const splitB = b.name.full.split(" ");
  const lastA = splitA[splitA.length - 1];
  const lastB = splitB[splitB.length - 1];

  if (lastA < lastB) return -1;
  if (lastA > lastB) return 1;
  return 0;
};

exports.getUser = getUser;
exports.getUserFilePath = getUserFilePath;
exports.saveUser = saveUser;
exports.verifyUser = verifyUser;
exports.compare = compare;
