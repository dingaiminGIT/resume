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
  assert.match(html, /履历工坊｜白牙技术笔记/);
  assert.match(html, /京ICP备2026045992号-1/);
  assert.match(html, /https:\/\/beian\.miit\.gov\.cn\//);
  assert.match(html, /基本信息/);
  assert.match(html, /打印 \/ PDF/);
  assert.match(html, /更换二维码/);
  assert.match(html, /自动识别并裁剪二维码/);
  assert.match(html, /value="baiya"/);
  assert.match(html, /src="\/default-wechat-qr\.jpg"/);
  assert.doesNotMatch(html, /jianchuan\.lin@example\.com/);
  assert.doesNotMatch(html, /丁爱民/);
});
