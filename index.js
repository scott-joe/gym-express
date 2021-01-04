const express = require("express");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const cons = require("consolidate");
const bodyParser = require("body-parser");

const utils = require("./utils");

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

// Return user data as JSON
app.get("/api/:username", utils.verifyUser, (req, res) => {
  const username = req.params?.username;
  const user = utils.getUser(username);
  res.json(user);
});
// Return user data as file download
app.get("/file/:username", (req, res) => {
  const filePath = utils.getUserFilePath(req.params.username);
  res.download(filePath);
});
// Handle bad usernames
app.get("/error/:username", (req, res) => {
  utils.log.error(`${req.method} for ${req.params.username}`);
  res
    .status(404)
    .send(`<h4>No user named <u>${req.params.username}</u> found</h4>`);
});

// User routes
const userRouter = require("./username");
app.use("/:username", userRouter);

// Index
app.get("/", function (req, res) {
  const users = [];

  try {
    fs.readdir("users", function (_err, files) {
      files.forEach(function (file) {
        try {
          const callback = (err, data) => {
            if (err) throw err;
            const user = JSON.parse(data);

            users.push({
              username: user?.username,
              name: {
                ...user?.name,
                full: _.startCase(`${user?.name.first} ${user?.name.last}`),
              },
            });

            if (users.length === files.length) {
              users.sort(utils.compare);
              cons.handlebars(
                "views/index.hbs",
                { users },
                function (err, html) {
                  if (err) throw err;
                  res.send(html);
                }
              );
            }
          };

          fs.readFile(
            path.join(__dirname, "users", file),
            utils.fsOpts,
            callback
          );
        } catch (error) {
          utils.log.error(error);
        }
      });
    });
  } catch (error) {
    utils.log.error(error);
  }
});

// =================================
// ========= START SERVER ==========
// =================================
// Create Server listening on port 3000 & capture server object to use later
const server = app.listen(3000, () => {
  console.log(`App is running on port ${server.address().port}`);
});
