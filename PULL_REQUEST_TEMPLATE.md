## Add Bright Colour Graphics Shirt — featured product on homepage

This PR adds a new product to the site and features it on the homepage.

Changes:
- Add placeholder product image: `assets/bright-graphic-shirt.svg`
- Add product to `script.js` products array (id: 9)
- Insert featured product card in `index.html` (below the hero)
- Add responsive styles in `styles.css` for the featured card

Details:
- Product: Bright Colour Graphics Shirt
- Price: $29.99
- Short blurb: Eye-catching bright graphic tee — soft, breathable, and available in S–XL.
- The "Add to bag" button uses the existing cart logic (class `add`, `data-id="9"`).

Preview locally:
```
 git fetch origin
 git checkout feature/add-bright-graphic-shirt
 open index.html in your browser or run your dev server
```

Notes:
- The product image is a placeholder SVG located at `assets/bright-graphic-shirt.svg`. Replace with a real photo if available.
- If you'd like a dedicated product page URL (e.g. `/products/bright-colour-graphics-shirt`) I can add one in a follow-up.

Checklist:
- [ ] Featured card displays below home hero
- [ ] Add to bag increments cart count and shows item in cart
- [ ] Replace placeholder image with production asset (optional)
