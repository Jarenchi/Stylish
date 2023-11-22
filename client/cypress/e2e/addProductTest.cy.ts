describe("Add Product to Cart", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");
    cy.viewport(1280, 1000);
  });
  it("get search data test", () => {
    cy.get("[data-testid=cart-count]").should("have.text", "0");
    cy.get("[data-testid=product-cards]:first-child").click();
    cy.get("[data-testid=product-size-button]").first().click();
    cy.get("button:contains('+')").click();
    cy.get("button:contains('加入購物車')").click();
    cy.on("window:alert", (text) => {
      expect(text).to.equal("已加入購物車");
    });
    cy.get("[data-testid=cart-count]").should("have.text", "1");
  });
});
