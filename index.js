const express = require("express");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const cons = require("consolidate");
const bodyParser = require("body-parser");
const debug = require("debug");

const { NODE_ENV } = process.env;
const fsOpts = { encoding: "utf-8" };
const log = {
  error: debug("error"),
  console: debug("console"),
};

// =================================
// ========== DATA HELPERS =========
// =================================
function getUserFilePath(username) {
  return path.join(__dirname, "users", `${username}.json`);
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

// =================================
// ===== CONFIGURE APPLICATION =====
// =================================
// Instantiate Express app instance
const app = express();
// Set up body parser
app.use(bodyParser.urlencoded({ extended: true }));
// Set up images directory
app.use("/images", express.static("images"));
// Kill requests for the favicon
app.get("/favicon.ico", (_req, res) => res.end());

// User routes
app.get("/:username", (req, res) => {
  const username = req.params?.username;
  // Fetch the current user's data out of the user store
  const user = getUser(username);

  cons.handlebars(
    "views/user.hbs",
    { user: user, address: user.location },
    function (err, html) {
      if (err) throw err;
      res.send(html);
    }
  );
});
app.put("/:username", (req, res) => {
  try {
    // Get username from params
    const username = req.params?.username;
    // Get user data from file
    const user = getUser(username);
    // Get location information from form submission
    user.location = req.body;
    // save user data
    saveUser(username, user);
    // send response
    // res.end()
    res.status(200).send("User Updated");
  } catch (error) {
    log.error(error);
    res.status(500).send(NODE_ENV ? "Error updating user" : error);
    throw error;
  }
});
app.delete("/:username", (req, res) => {
  try {
    // get username
    const username = req.params.username;
    const filename = getUserFilePath(username);
    // delete user file
    fs.unlinkSync(filename);
    res.status(200).send("User Deleted");
  } catch (error) {
    log.error(error);
    res.status(500).send(NODE_ENV ? "Error deleting user" : error);
    throw error;
  }
});

// Index
// app.get("/", (_req, res) => {
//   // Read users directory for filenames
//   fs.readdir("users", (_err, files) => {
//     // Read those filenames and create useful data from the contents
//     const users = files.map((filename) => {
//       const filePath = path.join(__dirname, "users", filename);
//       const user = JSON.parse(fs.readFileSync(filePath, fsOpts));

//       // Format data on it's way out
//       return {
//         username: user?.username,
//         name: {
//           full: _.startCase(`${user?.name.first} ${user?.name.last}`),
//         },
//       };
//     });

//     return cons.handlebars("views/index.hbs", { users }, function (err, html) {
//       if (err) throw err;
//       res.send(html);
//     });
//   });
// });

app.get("/", function (req, res) {
  const users = [];

  fs.readdir("users", function (err, files) {
    files.forEach(function (file) {
      const callback = (err, data) => {
        const user = JSON.parse(data);
        users.push({
          username: user?.username,
          name: {
            ...user?.name,
            full: _.startCase(`${user?.name.first} ${user?.name.last}`),
          },
        });

        if (users.length === files.length) {
          const compare = (a, b) => {
            const splitA = a.name.full.split(" ");
            const splitB = b.name.full.split(" ");
            const lastA = splitA[splitA.length - 1];
            const lastB = splitB[splitB.length - 1];

            if (lastA < lastB) return -1;
            if (lastA > lastB) return 1;
            return 0;
          };

          users.sort(compare);
          cons.handlebars("views/index.hbs", { users }, function (err, html) {
            if (err) throw err;
            res.send(html);
          });
        }
      };

      fs.readFile(path.join(__dirname, "users", file), fsOpts, callback);
    });
  });
});

// =================================
// ========= START SERVER ==========
// =================================
// Create Server listening on port 3000 & capture server object to use later
const server = app.listen(3000, () => {
  console.log(`App is running on port ${server.address().port}`);
});
