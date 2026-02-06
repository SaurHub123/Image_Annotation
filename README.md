# PixelLabel Suite 🎨🤖

**The Modern Suite for Computer Vision Data Annotation**

PixelLabel Suite is a comprehensive, web-based image annotation platform designed for computer vision researchers and developers. It provides a unified interface for creating high-quality datasets with pixel-perfect precision.

> **Designed and Developed by [Saurabh Kumar](https://saurabh-codes.onrender.com/)**  
> 🔗 **Repository**: [https://github.com/SaurHub123/Image_Annotation](https://github.com/SaurHub123/Image_Annotation)

---

## 🚀 Key Features

The suite consists of four specialized tools, simplified into a single modern application:

### 1. PixelPoly (Polygon Segmentation) 🖊️
*   **Best for:** Semantic segmentation, irregular object shapes.
*   **Features:**
    *   Precise freehand and polygon drawing.
    *   Edit, drag, and reshape existing polygons.
    *   **Auto-Close**: Automatically closes shapes when near the starting point.
    *   **Filters**: Apply Grayscale, Invert, or Contrast filters to the image for better visibility.

### 2. PixelBox (Bounding Box) 📦
*   **Best for:** Object detection (YOLO, R-CNN).
*   **Features:**
    *   Fast drag-and-drop bounding box creation.
    *   Resize and move boxes easily.
    *   **Label Management**: Assign class labels to each box.
    *   **Sub-Pixel Accuracy**: High-precision coordinates.

### 3. PixelPoint (Keypoint Annotation) 🎯
*   **Best for:** Pose estimation, facial landmark detection.
*   **Features:**
    *   Place individual points (keypoints) on specific features.
    *   **Skeleton Linking**: Connect keypoints to define structural relationships (e.g., Elbow -> Wrist).
    *   **Visibility Flags**: Mark points as Visible, Occluded, or Absent.
    *   **Smart Layout**: Collapsible sidebar for managing complex lists of points.

### 4. PixelSkeleton (Skeleton Creator) 🦴
*   **Best for:** Defining custom topology for pose models.
*   **Features:**
    *   Design and save custom skeleton templates.
    *   **Unified Format**: Create templates once, use them across your dataset.
    *   **Standard Layout**: Consistent UI with PixelPoint for seamless switching.

---

## 🌟 Visual & Usability Highlights

*   **COCO Export**: One-click export to the industry-standard COCO JSON format.
*   **Dark Mode**: Fully supported dark/light themes for eye comfort.
*   **Offline Capable**: Work mostly on the client-side; no heavy server dependencies.
*   **Validation Viewer**: Built-in viewer to inspect and verify your JSON annotations.
*   **Responsive Design**: Modern, glassmorphism-inspired UI built with Tailwind CSS.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js 18, Vite
*   **Canvas Engine**: Konva.js / React-Konva
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Routing**: React Router DOM

---

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SaurHub123/Image_Annotation.git
    cd Image_Annotation
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:5173` to start annotating!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Made with ❤️ by [Saurabh Kumar](https://github.com/SaurHub123)*
