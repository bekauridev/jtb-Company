import { expect, test } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:4173'

test('storefront cart creates a demo order notification', async ({ page }) => {
  await page.goto(baseUrl)
  await expect(page.getByRole('heading', { name: /სისუფთავე/ }).first()).toBeVisible()
  await page.getByRole('button', { name: 'დამატება' }).first().click()
  await expect(page.getByRole('heading', { name: 'კალათა' })).toBeVisible()
  await page.getByRole('button', { name: /შეკვეთის გაფორმება/ }).click()
  await expect(page.getByText('თქვენ გაქვთ ახალი შეკვეთა')).toBeVisible()
})

test('admin changes persist to the storefront', async ({ page }) => {
  await page.goto(`${baseUrl}/admin`)
  const nameInput = page.getByLabel('პროდუქტის დასახელება')
  await nameInput.fill('ხალასი — დემო')
  await page.getByRole('button', { name: /ცვლილებების შენახვა/ }).click()
  await page.goto(baseUrl)
  await expect(page.getByRole('heading', { name: 'ხალასი — დემო' }).first()).toBeVisible()
})

test('notification route shows desktop and mobile push examples', async ({ page }) => {
  await page.goto(`${baseUrl}/notification`)
  await expect(page.getByRole('heading', { name: 'შეტყობინება ყველა ეკრანზე' })).toBeVisible()
  await expect(page.getByRole('img', { name: /ლეპტოპზე/ })).toBeVisible()
  await expect(page.getByRole('img', { name: /Safari web push/ })).toBeVisible()
})
