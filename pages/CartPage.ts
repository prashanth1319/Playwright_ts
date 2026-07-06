import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('#checkout');
    this.continueShoppingButton = page.locator('#continue-shopping');
  }

  async getCartItemNames(): Promise<string[]> {
    return this.cartItems.locator('.inventory_item_name').allTextContents();
  }

  async checkout(): Promise<void> {
    await this.click(this.checkoutButton);
  }
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutInfoPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.locator('#continue');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async fillInfo({ firstName, lastName, postalCode }: CheckoutInfo): Promise<void> {
    await this.fill(this.firstNameInput, firstName);
    await this.fill(this.lastNameInput, lastName);
    await this.fill(this.postalCodeInput, postalCode);
  }

  async continueToOverview(): Promise<void> {
    await this.click(this.continueButton);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }
}

export class CheckoutOverviewPage extends BasePage {
  readonly finishButton: Locator;
  readonly summaryTotalLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.finishButton = page.locator('#finish');
    this.summaryTotalLabel = page.locator('.summary_total_label');
  }

  async finish(): Promise<void> {
    await this.click(this.finishButton);
  }

  async getTotal(): Promise<string> {
    return this.getText(this.summaryTotalLabel);
  }
}

export class CheckoutCompletePage extends BasePage {
  readonly completeHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.completeHeader = page.locator('.complete-header');
  }

  async getCompleteMessage(): Promise<string> {
    return this.getText(this.completeHeader);
  }
}
