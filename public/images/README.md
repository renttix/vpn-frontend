# Logo Images

This directory contains the logo images for the VPN News website.

## Required Logo Files

1. `vpn-logo-black.png` - Black logo for light mode in the header
2. `vpn-logo-white.png` - White logo for dark mode in the header and for the footer

## Implementation Details

The logos have been implemented in the following components:

### Header Component

The header uses both the black and white logos, switching between them based on the theme:
- Black logo is shown in light mode
- White logo is shown in dark mode

The logos appear in two places in the header:
1. Main header area (larger size)
2. Compact header that appears when scrolling (smaller size)

### Footer Component

The footer uses only the white logo since it has a dark background.

## Image Dimensions

For optimal display, the logo images should have the following dimensions:

- Header (main): 200px × 64px
- Header (compact): 80px × 32px
- Footer: 128px × 48px

The Next.js Image component will handle resizing and optimization, but starting with images close to these dimensions will provide the best results.
