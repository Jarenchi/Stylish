function searchProduct(keyword: string) {
  cy.get("input").type(keyword);
  cy.get("[data-testid='search-button']").click();
}

describe("Search Product", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");
    cy.viewport(1280, 720);
  });
  it("get search data test", () => {
    searchProduct("襯衫");
    cy.get("[data-testid='products-container'] .object-cover")
      .should("have.attr", "src")
      .should("include", "main_image-1699628007501product.png");
    cy.get("[data-testid='product-container'] .text-xl").eq(0).should("contain.text", "格子襯衫(男)");
    cy.get("[data-testid='product-container'] .text-xl").eq(1).should("contain.text", "TWD.2200");
  });
  it("no search data test", () => {
    searchProduct("123");
    cy.get("[data-testid='nodatatext']").should("contain.text", "目前沒有相關資料，請更換其他關鍵字");
  });
});
