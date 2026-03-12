# AnnoForge

**The Modern Suite for Computer Vision Data Annotation**

**AnnoForge** is a comprehensive, web-based image annotation platform designed for computer vision researchers and developers. It provides a unified interface for creating high-quality datasets with pixel-perfect precision.

---

## Project Overview

We built **AnnoForge** as an in-house, semi-automated image annotation tool to streamline labeling across large, diverse datasets locally. Our solution bridges the gap between manual precision and automated efficiency by offering a versatile, offline-first platform that supports polygon segmentation, bounding box detection, keypoint annotation, and skeleton-based pose estimation.

The tool leverages pre-trained models to enable auto-annotation capabilities across different domains, eliminating the need for cloud uploads while maintaining data privacy. Whether you're working with biodiversity datasets, pose estimation projects, or general object detection tasks, **AnnoForge** combines ease of use with professional-grade features—including session saving, intelligent class management, and skeleton templates—making both automated and manual annotation smooth, efficient, and scalable.

---

## Key Features

The suite consists of four specialized tools, simplified into a single modern application:

### 1. AnnoPoly (Polygon Segmentation)
*   **Best for:** Semantic segmentation, irregular object shapes.
*   **Features:**
    *   Precise freehand and polygon drawing.
    *   Edit, drag, and reshape existing polygons.
    *   **Auto-Close**: Automatically closes shapes when near the starting point.
    *   **Filters**: Apply Grayscale, Invert, or Contrast filters to the image for better visibility.

### 2. AnnoBox (Bounding Box)
*   **Best for:** Object detection (YOLO, R-CNN).
*   **Features:**
    *   Fast drag-and-drop bounding box creation.
    *   Resize and move boxes easily.
    *   **Label Management**: Assign class labels to each box.
    *   **Sub-Pixel Accuracy**: High-precision coordinates.

### 3. AnnoPoint (Keypoint Annotation)
*   **Best for:** Pose estimation, facial landmark detection.
*   **Features:**
    *   Place individual points (keypoints) on specific features.
    *   **Skeleton Linking**: Connect keypoints to define structural relationships (e.g., Elbow -> Wrist).
    *   **Visibility Flags**: Mark points as Visible, Occluded, or Absent.
    *   **Smart Layout**: Collapsible sidebar for managing complex lists of points.

### 4. AnnoSkeleton (Skeleton Creator)
*   **Best for:** Defining custom topology for pose models.
*   **Features:**
    *   Design and save custom skeleton templates.
    *   **Unified Format**: Create templates once, use them across your dataset.
    *   **Standard Layout**: Consistent UI with PixelPoint for seamless switching.

---

## Visual & Usability Highlights

*   **COCO Export**: One-click export to the industry-standard COCO JSON format.
*   **Offline Capable**: Work mostly on the client-side; no heavy server dependencies.
*   **Validation Viewer**: Built-in viewer to inspect and verify your JSON annotations.
*   **Responsive Design**: Modern, glassmorphism-inspired UI built with Tailwind CSS.
*   **Dark Mode**: Fully supported dark/light themes for eye comfort.


---

## Tech Stack

*   **Frontend**: React.js 18, Vite
*   **Canvas Engine**: Konva.js / React-Konva
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Routing**: React Router DOM

---

## Installation & Setup

### Tauri & Vite Project Commands

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Install Tauri CLI

```bash
npm install --save-dev @tauri-apps/cli
```

#### 3. Run Desktop App (Development)

```bash
npx tauri dev
```

#### 4. Build Frontend

```bash
npm run build
```

#### 5. Build Desktop Application (.exe / .app / .deb)

```bash
npx tauri build
```

#### 6. Run Frontend Only (Browser)

```bash
npm run dev
```

#### 7. Preview Production Build

```bash
npm run preview
```

#### Built Desktop App Location

```
src-tauri/target/release/bundle/
```

---

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
