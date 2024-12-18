import { expect } from "chai";
import nock from "nock";

import { AuthCloudFunction } from "./cloudFunctions.js";
import { EmulatorRegistry } from "../registry.js";
import { Emulators } from "../types.js";
import { FakeEmulator } from "../testing/fakeEmulator.js";

describe("cloudFunctions", () => {
  describe("dispatch", () => {
    before(async () => {
      const emu = await FakeEmulator.create(Emulators.FUNCTIONS);
      await EmulatorRegistry.start(emu);
      nock(EmulatorRegistry.url(Emulators.FUNCTIONS).toString())
        .post("/functions/projects/project-foo/trigger_multicast", {
          eventId: /.*/,
          eventType: "providers/firebase.auth/eventTypes/user.create",
          resource: {
            name: "projects/project-foo",
            service: "firebaseauth.googleapis.com",
          },
          params: {},
          timestamp: /.*/,
          data: { uid: "foobar", metadata: {}, customClaims: {} },
        })
        .reply(200, {});
    });

    after(async () => {
      await EmulatorRegistry.stopAll();
      nock.cleanAll();
    });

    it("should make a request to the functions emulator", async () => {
      const cf = new AuthCloudFunction("project-foo");
      await cf.dispatch("create", { localId: "foobar" });
      expect(nock.isDone()).to.be.true;
    });
  });
}).timeout(2000);
