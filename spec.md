# Altifition Jewellery

## Current State
New project -- no existing code.

## Requested Changes (Diff)

### Add
- Public-facing luxury jewellery website with black and gold theme
- Header: black background, brand name "Altifition Jewellery", tagline "Luxury Jewellery Collection"
- Gold navigation bar with links: Home, Rings, Necklaces, Earrings, Contact
- Hero section (cream/warm #fdf2e9 background) with heading and subtitle
- Three product category sections: Rings, Necklaces, Earrings -- each showing product cards (image, name, description, "View Product" button in gold)
- About section with warm background and brand description text
- Contact section with Email and Phone placeholders
- Black footer with copyright
- Admin/management panel (login-protected) for CRUD operations on jewellery products
  - Fields: name, description, image (uploaded to blob-storage), category (Rings/Necklaces/Earrings)
  - List, add, edit, delete products
- Authorization component for admin login
- Blob-storage component for product images

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Select `authorization` and `blob-storage` Caffeine components
2. Generate Motoko backend with:
   - Product data type: id, name, description, imageUrl, category
   - CRUD functions: addProduct, updateProduct, deleteProduct, getProducts, getProductsByCategory
   - Admin-only write operations via authorization
3. Frontend:
   - Public pages: Home (hero + all sections), Rings, Necklaces, Earrings anchored sections, Contact, About
   - Admin panel route (/admin): login gate, product list, add/edit form with image upload, delete
   - Black and gold design system throughout
   - Responsive layout
