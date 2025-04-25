/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.getBySel('greeting')
     */
    getBySel(value: string): Chainable<JQuery<HTMLElement>>

    /**
     * Custom command to login
     * @example cy.login('user@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>
  }
} 