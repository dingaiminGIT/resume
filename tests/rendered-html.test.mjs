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
  assert.match(html, /履历工坊/);
  assert.match(html, /基本信息/);
  assert.match(html, /打印 \/ PDF/);
  assert.match(html, /上传微信二维码/);
  assert.doesNotMatch(html, /丁爱民/);
});
