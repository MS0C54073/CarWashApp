# Images Folder

This folder contains images used by the SuCAR application.

## Homepage Background Image

**Image Name:** `homepage-background.jpg` (or `.png`)

### Recommended Specifications:
- **Format:** JPG or PNG
- **Resolution:** 1920x1080 or higher (for best quality on all devices)
- **File Size:** Under 2MB for optimal performance
- **Aspect Ratio:** 16:9 or wider (landscape orientation)

### Usage:
The image will be used as the background for the landing page hero section, aligned to the **top-left corner** of the page.

### How to Add Your Image:
1. Place your image file in this folder (`frontend/public/images/`)
2. Name it `homepage-background.jpg` (or `.png` if using PNG format)
3. The system will automatically use it as a fallback if the Google Drive image fails to load

### Current Setup:
The homepage currently uses a Google Drive image as the primary source. If you want to:
- **Use only a local image:** Update `LandingPage.tsx` and change `GOOGLE_DRIVE_IMAGE_URL` to point to `/images/homepage-background.jpg`
- **Update the Google Drive link:** Edit the `GOOGLE_DRIVE_IMAGE_ID` constant in `frontend/src/pages/LandingPage.tsx`

### Image Loading Behavior:
1. **Primary:** Attempts to load from Google Drive
2. **Fallback:** If Google Drive fails, uses local image from this folder
3. **Final Fallback:** If both fail, displays a gradient background

### Notes:
- Images in the `public` folder are served statically and accessible at `/images/filename.ext`
- The background image uses `background-attachment: fixed` on desktop for a parallax effect
- On mobile devices, `background-attachment` is set to `scroll` for better performance
- An overlay is applied to ensure text readability over the background image
