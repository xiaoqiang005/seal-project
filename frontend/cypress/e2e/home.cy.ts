describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the home page', () => {
    cy.get('h1').should('be.visible')
  })

  it('should have working navigation', () => {
    cy.getBySel('nav-menu').should('be.visible')
  })
}) 