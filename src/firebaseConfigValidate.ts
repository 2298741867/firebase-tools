// Note: we are using ajv version 6.x because it's compatible with TypeScript
// 3.x, if we upgrade the TS version in this project we can upgrade ajv as well.
import { ValidateFunction, ErrorObject } from "ajv";
import Ajv from "ajv";
import schema from "../schema/firebase-config.json" with { type: "json" };
const ajv = new Ajv();
let _VALIDATOR: ValidateFunction | undefined = undefined;

/**
 * Lazily load the 'schema/firebase-config.json' file and return an AJV validation
 * function. By doing this lazily we don't impose this I/O cost on those using
 * the CLI as a Node module.
 */
export function getValidator(): ValidateFunction {
  if (!_VALIDATOR) {
    _VALIDATOR = ajv.compile(schema);
  }

  return _VALIDATOR!;
}

export function getErrorMessage(e: ErrorObject) {
  if (e.keyword === "additionalProperties") {
    return `Object "${e.dataPath}" in "firebase.json" has unknown property: ${JSON.stringify(
      e.params,
    )}`;
  } else if (e.keyword === "required") {
    return `Object "${
      e.dataPath
    }" in "firebase.json" is missing required property: ${JSON.stringify(e.params)}`;
  } else {
    return `Field "${e.dataPath}" in "firebase.json" is possibly invalid: ${e.message}`;
  }
}
