// QA harness: set PLAYWRIGHT_MODULE and CHROMIUM_MODULE to installed package paths.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const chromiumImport = require(
  process.env.CHROMIUM_MODULE || "@sparticuz/chromium",
);
const chromiumBinary = chromiumImport.default || chromiumImport;
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const server = require("node:child_process").spawn("python3", [
    "-m",
    "http.server",
    "3000",
    "--directory",
    "out",
  ]);
  const baselineServer = require("node:child_process").spawn("python3", [
    "-m",
    "http.server",
    "3001",
    "--directory",
    "baseline",
  ]);
  process.on("exit", () => {
    server.kill();
    baselineServer.kill();
  });
  await new Promise((r) => setTimeout(r, 700));
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_BIN || (await chromiumBinary.executablePath()),
    args: chromiumBinary.args,
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  fs.mkdirSync("evidence", { recursive: true });
  const baseline = await context.newPage();
  await baseline.goto("http://127.0.0.1:3001");
  await baseline.screenshot({
    path: "evidence/before-overview.png",
    fullPage: true,
  });
  await baseline.goto("http://127.0.0.1:3001/#simulation");
  await baseline
    .getByRole("button", {
      name: "Tout est déjà écrit en français sur l’affiche.",
    })
    .click();
  await baseline.screenshot({
    path: "evidence/before-wrong-feedback.png",
    fullPage: true,
  });
  await baseline.close();
  await page.goto("http://127.0.0.1:3000");
  await page.getByRole("button", { name: "Commencer ma formation" }).waitFor();
  await page.waitForTimeout(2200);
  await page.screenshot({
    path: "evidence/after-overview.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Commencer ma formation" }).click();
  await page.getByRole("checkbox").first().waitFor();
  for (const checkbox of await page.getByRole("checkbox").all())
    await checkbox.check();
  await page.getByRole("button", { name: "Passer à la simulation" }).click();
  await page.getByRole("button", { name: /Tout est déjà écrit/ }).click();
  await page
    .getByRole("region", { name: "Retour sur votre réponse" })
    .waitFor();
  assert.match(
    await page.locator(".feedback").innerText(),
    /L’affiche ne répond pas/,
  );
  await page.waitForTimeout(300);
  assert.equal(
    await page.evaluate(() =>
      document.activeElement.classList.contains("feedback"),
    ),
    true,
  );
  await page.screenshot({
    path: "evidence/after-recovery.png",
    fullPage: true,
  });
  await page.reload();
  await page.getByRole("button", { name: "Réessayer", exact: true }).waitFor();
  await page.getByRole("button", { name: "Réessayer", exact: true }).click();
  await page.getByRole("button", { name: /Bien sûr/ }).click();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await page.getByRole("button", { name: /D’accord. Regardons/ }).click();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await page.getByRole("button", { name: /Je peux vous remettre/ }).click();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await page.getByRole("button", { name: "Consolider mes acquis" }).click();
  for (const name of [
    /Préférez-vous le français/,
    /Une étape, une reformulation/,
    /Pour vérifier si j’ai été clair/,
  ]) {
    await page.getByRole("button", { name }).click();
    await page.getByRole("button", { name: "Continuer", exact: true }).click();
  }
  await page.getByRole("button", { name: "Découvrir mon bilan" }).click();
  await page.locator(".big-number").waitFor();
  assert.equal(await page.locator(".big-number").innerText(), "100%");
  assert.match(
    await page.locator(".summary-stat").first().innerText(),
    /2 \/ 3/,
  );
  await page.screenshot({ path: "evidence/after-review.png", fullPage: true });
  await page.getByRole("button", { name: "Réinitialiser le parcours" }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.match(
    await page.evaluate(() => document.activeElement.textContent),
    /Réinitialiser/,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("link", { name: "Mon espace", exact: true }).click();
  await page.getByRole("button", { name: "Voir mon bilan" }).waitFor();
  await page.waitForTimeout(350);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: "evidence/after-mobile.png", fullPage: true });
  await page.getByRole("link", { name: "Pratiquer" }).click();
  await page.getByRole("button", { name: "Consulter mes réponses" }).click();
  await page.locator("summary").first().click();
  await page
    .getByRole("button", { name: "Pratiquer cette étape" })
    .first()
    .click();
  await page.getByRole("button", { name: /Tout est déjà écrit/ }).waitFor();
  await page.screenshot({
    path: "evidence/after-mobile-exercise.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  const failure = await context.newPage();
  await failure.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new Error("Storage denied");
    };
  });
  await failure.goto("http://127.0.0.1:3000/#simulation");
  await failure.getByRole("button", { name: /Tout est déjà écrit/ }).click();
  await failure.locator(".save-warning").waitFor();
  assert.match(await failure.locator(".feedback").innerText(), /L’affiche/);
  await failure.screenshot({
    path: "evidence/after-storage-error.png",
    fullPage: true,
  });
  const corrupt = await browser.newContext();
  const cp = await corrupt.newPage();
  await cp.addInitScript(() =>
    localStorage.setItem("bp-learning-eagle-v2", "{broken"),
  );
  await cp.goto("http://127.0.0.1:3000");
  await cp.locator(".save-warning").waitFor();
  assert.match(await cp.locator(".save-warning").innerText(), /illisible/);
  const reduced = await browser.newContext({ reducedMotion: "reduce" });
  const rp = await reduced.newPage();
  await rp.goto("http://127.0.0.1:3000");
  await rp.getByRole("button", { name: "Commencer ma formation" }).waitFor();
  await rp.waitForTimeout(500);
  assert.equal(await rp.locator("canvas").count(), 0);
  await rp.getByRole("link", { name: "Aller au contenu" }).focus();
  await rp.keyboard.press("Enter");
  assert.equal(await rp.evaluate(() => document.activeElement.id), "content");
  fs.writeFileSync(
    "evidence/automated-results.json",
    JSON.stringify(
      {
        passed: [
          "full nine-activity path",
          "answer-specific feedback",
          "retry preserves first attempt",
          "refresh restores pending feedback",
          "feedback focus",
          "100% completion with 2/3 first-attempt simulation score",
          "reset Escape and focus restoration",
          "390px overview and exercise no overflow",
          "storage-write error allows continued feedback",
          "corrupt storage warning",
          "reduced-motion disables WebGL",
          "skip-link keyboard navigation",
        ],
        pageErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: 12, pageErrors: errors }));
  await browser.close();
  server.kill();
  baselineServer.kill();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
