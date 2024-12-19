import url from "url";
import extractTriggers from "./extractTriggers.js";

// This is an independently executed script that parses triggers
// from a functions package directory.

("use strict");
var EXIT = function () {
  process.exit(0);
};

async function loadModule(packageDir) {
  try {
    return require(packageDir);
  } catch (e) {
    if (e.code === "ERR_REQUIRE_ESM") {
      const modulePath = require.resolve(packageDir);
      // Resolve module path to file:// URL. Required for windows support.
      const moduleURL = url.pathToFileURL(modulePath).href;
      return await import(moduleURL);
    }
    throw e;
  }
}

(async function () {
  if (!process.send) {
    console.warn("Could not parse function triggers (process.send === undefined).");
    process.exit(1);
  }

  // wrap in function to allow return without exiting process
  var packageDir = process.argv[2];
  if (!packageDir) {
    process.send({ error: "Must supply package directory for functions trigger parsing." }, EXIT);
    return;
  }

  var mod;
  var triggers = [];
  try {
    mod = await loadModule(packageDir);
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      process.send(
        {
          error:
            "Error parsing triggers: " +
            e.message +
            '\n\nTry running "npm install" in your functions directory before deploying.',
        },
        EXIT,
      );
      return;
    }
    if (/Firebase config variables are not available/.test(e.message)) {
      process.send(
        {
          error:
            "Error occurred while parsing your function triggers. " +
            'Please ensure you have the latest firebase-functions SDK by running "npm i --save firebase-functions@latest" inside your functions folder.\n\n' +
            e.stack,
        },
        EXIT,
      );
      return;
    }

    process.send(
      {
        error: "Error occurred while parsing your function triggers.\n\n" + e.stack,
      },
      EXIT,
    );
    return;
  }

  try {
    extractTriggers(mod, triggers);
  } catch (err) {
    if (/Maximum call stack size exceeded/.test(err.message)) {
      process.send(
        {
          error:
            "Error occurred while parsing your function triggers. Please ensure that index.js only " +
            "exports cloud functions.\n\n",
        },
        EXIT,
      );
      return;
    }
    process.send({ error: err.message }, EXIT);
  }

  process.send({ triggers: triggers }, EXIT);
})();
