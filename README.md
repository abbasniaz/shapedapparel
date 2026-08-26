# SHAPED Netlify Website

## Deploy
1. Replace placeholder email and phone details in `index.html`.
2. If desired, replace the current logo URL references in `index.html` and `success.html` with your own hosted logo asset.
3. Upload the contents of this folder to a GitHub repository and connect the repository to Netlify, or deploy the folder using Netlify's manual deployment interface.
4. No build command is required. The publish directory is `.`.
5. In Netlify, open Forms after deployment and verify that the `custom-order` form is detected.

## Important before launch
- Product prices and descriptions are sample content. Edit the `products` array in `script.js`.
- The shopping bag is a front-end demonstration and does not process payments.
- Replace `hello@shapedapparel.com` and `(312) 555-0198` with the correct contact details.
- Connect a checkout or e-commerce provider before taking online payments.
- Add your privacy, returns, shipping and terms pages before public sales.

## Files
- `index.html`: website structure and content
- `styles.css`: responsive visual design
- `script.js`: product filtering, local shopping bag and interactions
- `designer.js`: Design Studio interactions and design-to-quote summary flow
- `success.html`: quote-form confirmation page
- `assets/shaped-logo.svg`: legacy starter logo asset (not currently referenced)
- `netlify.toml`: Netlify configuration
