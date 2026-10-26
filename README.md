# ClearCut — High-Quality Background Remover

A small HTML, CSS and JavaScript web app that removes image backgrounds with an AI model and exports transparent PNG files.

## Features
- Upload by file picker or drag-and-drop.
- Original and processed previews.
- Transparent PNG download.
- Exports PNG at the processed image's dimensions.
- Responsive layout for desktop and mobile.
- No account or API key required.
- Image processing runs in the browser after the library/model loads.

## Run it

Because this app uses JavaScript ES modules and loads an AI library from a CDN, open it through a local web server instead of double-clicking `index.html`.

### Option A — VS Code Live Server
1. Extract the ZIP.
2. Open the `high_quality_background_remover` folder in VS Code.
3. Install the **Live Server** extension if needed.
4. Right-click `index.html` and select **Open with Live Server**.

### Option B — Python local server
If Python is installed, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Important notes
- An internet connection is required initially to download the JavaScript library and AI model from the CDN.
- Processing speed depends on the device and image size. The first run may take longer.
- The app currently accepts JPG, PNG and WebP images up to 25 MB.
- Output is a transparent PNG, not a JPEG, because JPEG does not support transparency.
- The output retains the dimensions returned by the AI library. Always compare dimensions for critical print or production work.
- AI background removal is not perfect for every image. Hair, transparent glass, shadows, and subjects with colors similar to the background may need manual cleanup.
- This starter app does not promise lossless recovery of original detail. AI segmentation can alter edge pixels, and PNG export cannot restore detail absent from the source.
- This project uses `@imgly/background-removal`. Review the package's current license and usage terms before deploying it commercially: https://github.com/imgly/background-removal-js

## Files
- `index.html` — app structure
- `style.css` — responsive design
- `script.js` — file handling, AI processing and PNG download
