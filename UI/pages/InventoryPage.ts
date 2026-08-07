import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly inventoryItems: Locator;
  readonly cartBadge: Locator;
  readonly cartIcon: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.inventoryItems = page.locator('.inventory_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartIcon = page.locator('.shopping_cart_link');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  addProductToCartByName(name: string): Promise<void> {
    const item = this.page.locator('.inventory_item', { hasText: name });
    return item.locator('button', { hasText: 'Add to cart' }).click();
  }

  removeProductFromCartByName(name: string): Promise<void> {
    const item = this.page.locator('.inventory_item', { hasText: name });
    return item.locator('button', { hasText: 'Remove' }).click();
  }

  async getCartCount(): Promise<number> {
    const visible = await this.isVisible(this.cartBadge);
    if (!visible) return 0;
    const text = await this.getText(this.cartBadge);
    return parseInt(text, 10);
  }

  async goToCart(): Promise<void> {
    await this.click(this.cartIcon);
  }

  async sortBy(optionValue: string): Promise<void> {
    await this.sortDropdown.selectOption(optionValue);
  }

  async getProductNames(): Promise<string[]> {
    return this.inventoryItems.locator('.inventory_item_name').allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.inventoryItems.locator('.inventory_item_price').allTextContents();
    return priceTexts.map((p) => parseFloat(p.replace('$', '')));
  }
}
