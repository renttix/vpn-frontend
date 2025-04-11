# Source Logo Images

Place your source logo images in this directory for processing by the `convert-logos.js` script.

## Required Files

1. `black-logo.png` - The black version of the VPN logo (for light mode)
2. `white-logo.png` - The white version of the VPN logo (for dark mode and footer)

## Instructions

1. Save the black logo as `black-logo.png` in this directory
2. Save the white logo as `white-logo.png` in this directory
3. Run the conversion script from the project root:

```bash
cd frontend
node scripts/convert-logos.js
```

The script will:
- Resize the logos to the appropriate dimensions
- Optimize them for web use
- Save them to the `public/images` directory with the correct filenames

## Notes

- The logos should be high-quality PNG images with transparency
- If your logos are in a different format (e.g., SVG, JPG), convert them to PNG first
- The script uses the `sharp` package for image processing, which you may need to install:

```bash
npm install sharp
