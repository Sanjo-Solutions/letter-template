import { test, expect } from "@playwright/test"

test("sendProduct for personal use (German)", async ({ page }) => {
  await buyProduct(
    page,
    "https://buy.stripe.com/test_4gwg12cg6gKh4AE288",
    "Herunterladen",
  )
})

test("sendProduct for business use (German)", async ({ page }) => {
  await buyProduct(
    page,
    "https://buy.stripe.com/test_fZeeWY1Bs2Tr0kofYZ",
    "Herunterladen",
  )
})

test.only("sendProduct for personal use (English)", async ({ page }) => {
  await buyProduct(
    page,
    "https://buy.stripe.com/test_7sI8yAeoe1Pnc367su",
    "Download",
  )
})

test("sendProduct for business use (English)", async ({ page }) => {
  await buyProduct(
    page,
    "https://buy.stripe.com/test_7sIcOQdkagKh9UY28b",
    "Download",
  )
})

async function buyProduct(page, url, downloadText) {
  await page.goto(url)

  await page.getByLabel("Email").fill("jonas.aschenbrenner@gmail.com")
  await page.getByTestId("card-tab-button").click()
  await page.getByPlaceholder("1234 1234 1234 1234").fill("4242 4242 4242 4242")
  await page.getByPlaceholder("MM / YY").fill("01 / 24")
  await page.getByPlaceholder("CVC").fill("123")
  await page.getByPlaceholder("Full name on card").fill("Jonas Aschenbrenner")
  await page.getByTestId("hosted-payment-submit-button").click()

  await page.waitForSelector(`text="${downloadText}"`, {
    timeout: 60000,
  })
}
