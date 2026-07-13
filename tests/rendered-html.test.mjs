import assert from "node:assert/strict";
import test from "node:test";
import worker from "../dist/server/index.js";

test("renders the resume shell", async () => {
  const response = await worker.fetch(
    new Request("https://resume.test/"),
    {},
    { waitUntil() {} },
  );
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /丁爱民/);
  assert.match(html, /工作经历/);
  assert.match(html, /专业技能/);
});
