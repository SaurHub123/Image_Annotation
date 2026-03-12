Introduction
AnnoForge is an image annotation platform developed in-house to support computer vision research and dataset preparation workflows.
The suite brings together four purpose-built annotation tools under a single, unified interface, allowing users to perform polygon segmentation,
bounding box labeling, keypoint annotation, and custom skeleton design without switching between separate applications.

AnnoForge exports annotations in industry-standard formats, including COCO JSON and YOLO v8 formats, making it directly compatible with popular machine learning
frameworks and training pipelines.



Overview
This document provides a comprehensive reference for installing, configuring, and using AnnoForge. It covers the four annotation modules
available within the suite, the technologies used to build the software, and step-by-step instructions for common workflows. All sections
are intended to be followed sequentially for first-time users.



------------------------- TECHNOLOGIES USED TO DEVELOP THE SOFTWARE ----------------------------------------------------------

FRONTEND:

	HTML5 - Structure of the user interface

	CSS3 - Styling and layout of the user interface

	JavaScript (ES6+) - Frontend logic, state management, and interactivity

	React.js 18 - Component-based UI framework for building the single-page application

	Vite - Frontend build tool and development server

CANVAS ENGINE:

	Konva.js / React-Konva - 2D canvas rendering library used for all annotation drawing surfaces

STYLING:

	Tailwind CSS - Utility-first CSS framework for layout and design

ROUTING:

	React Router DOM - Client-side routing between annotation modules

ICONS:

	Lucide React - Icon library used throughout the interface

PACKAGING & DEPLOYMENT:

	Vite Build - Production build bundling and optimization

	Tauri - Desktop application packaging for Windows, macOS, and Linux



------------------------- LANGUAGES USED FOR DEVELOPING THE SOFTWARE ---------------------------------------------------------

1. HTML
2. CSS
3. JavaScript (ES6+)



------------------------- ANNOTATION MODULES INCLUDED IN THE SUITE -----------------------------------------------------------

AnnoForge contains four specialized annotation tools, each accessible from the main landing page:


1. ANNOPOLY - POLYGON SEGMENTATION

   Purpose: Semantic segmentation and labeling of irregular object shapes.

   Key Capabilities:
   - Freehand and polygon drawing on images.
   - Edit, drag, and reshape existing polygon annotations.
   - Auto-Close feature: Automatically closes a polygon when the cursor approaches the starting point.
   - Image Filters: Apply Grayscale, Invert, or Contrast filters to improve visibility during annotation.
   - Undo support for removing the last placed point.
   - COCO JSON export for downstream model training.


2. ANNOBOX - BOUNDING BOX ANNOTATION

   Purpose: Object detection labeling compatible with YOLO, R-CNN, and similar architectures.

   Key Capabilities:
   - Drag-and-drop bounding box creation directly on the image canvas.
   - Resize and reposition existing bounding boxes.
   - Class label assignment per bounding box.
   - Sub-pixel accuracy for high-precision coordinates.
   - Dual-format export: COCO JSON and YOLO v8 TXT formats.


3. ANNOPOINT - KEYPOINT ANNOTATION

   Purpose: Pose estimation and facial landmark detection labeling.

   Key Capabilities:
   - Place individual keypoints on specific anatomical or structural features.
   - Skeleton Linking: Connect keypoints to define structural relationships (e.g., Elbow to Wrist).
   - Visibility Flags: Mark each keypoint as Visible, Occluded, or Absent.
   - Collapsible sidebar for managing large sets of keypoints cleanly.
   - Compatible with custom skeleton templates created in AnnoSkeleton.
   - Multi-format export: COCO JSON and YOLO v8 Pose formats.


4. ANNOSKELETON - SKELETON CREATOR

   Purpose: Designing and saving custom skeleton topologies for use with pose estimation models.

   Key Capabilities:
   - Create skeleton templates by placing and linking named keypoints.
   - Save templates for reuse across annotation sessions and datasets.
   - Consistent interface layout with AnnoPoint for seamless workflow transition.
   - Template library accessible from the dedicated Skeleton Store.



------------------------- STEP-BY-STEP GUIDE TO INSTALL AND RUN THE SOFTWARE ------------------------------------------------

Note: An active internet connection is required during the initial dependency installation step.

1. Ensure Node.js (version 18 or later) is installed on the system. Node.js can be obtained from the
   official Node.js website. Verify the installation by running the following command in a terminal:

   node --version

2. Clone or extract the AnnoForge repository to a preferred location on the local machine.

3. Open a terminal and navigate to the root directory of the extracted or cloned project.

4. Run the following command to install all required dependencies:

   npm install

   Wait for the installation to complete. This may take a few minutes depending on the network speed.

5. Once installation is complete, start the development server by running:

   npm run dev

6. Open a web browser and navigate to the following address to access the application:

   http://localhost:5173

Note: The application will not run correctly if the dependency installation step is skipped or
      if an incompatible version of Node.js is used.



------------------------- STEP-BY-STEP GUIDE TO USE THE SOFTWARE AFTER INSTALLATION ------------------------------------------


LANDING PAGE (HOME PAGE):

A. Upon opening the application, the main landing page will display the four annotation module cards:
   AnnoPoly, AnnoBox, AnnoPoint, and AnnoSkeleton.

B. Click on any module card to navigate directly to that annotation tool.

C. A guided product tour will automatically launch on first visit to any module. This tour highlights
   the key controls and interface sections. To skip the tour, close it using the provided button.



USING ANNOPOLY - POLYGON SEGMENTATION:

A. Click on the "AnnoPoly" card from the landing page.

B. Click the folder icon or the "Open Folder" button to select an input directory containing the images
   to be annotated. The images will be loaded into the navigation panel.

C. Select an output directory where the exported annotation files will be saved.

D. Use the left and right navigation controls below the canvas to move between images in the loaded folder.

E. Select a class label from the sidebar before drawing.

F. Left-click on the image canvas to begin placing polygon points. Each click adds a new vertex.

G. To close the polygon, click near the first point. The shape will close automatically when within
   the auto-close proximity threshold.

H. To apply an image filter for better visibility, use the filter selector in the toolbar. Available
   options are Grayscale, Invert, and Contrast.

I. To undo the last placed point, use the Undo button in the toolbar.

J. To delete a completed polygon, hover over it and use the provided delete control.

K. Once all polygons on an image are finalized, click the export button to save the annotations in
   COCO JSON format to the selected output directory. AnnoPoly does not support YOLO format.



USING ANNOBOX - BOUNDING BOX ANNOTATION:

A. Click on the "AnnoBox" card from the landing page.

B. Load an input folder and select an output directory using the respective buttons in the interface.

C. Select a class label from the sidebar panel.

D. Click and drag on the image canvas to draw a bounding box around the target object. Release the
   mouse button to finalize the box.

E. To resize an existing bounding box, click on it to select it, then drag any of the corner or edge
   handles to the desired size.

F. To move a bounding box, click and drag it from its center to the new position.

G. To delete a bounding box, select it and use the delete control that appears.

H. Navigate between images using the forward and backward controls.

I. Export the annotations in COCO JSON or YOLO v8 TXT format using the export button. Select your preferred
   format from the export dialog.



USING ANNOPOINT - KEYPOINT ANNOTATION:

A. Click on the "AnnoPoint" card from the landing page.

B. Load an input folder and select an output directory.

C. Select or load a skeleton template from the Skeleton Store to define which keypoints are expected
   for the subjects being annotated.

D. Click on the image canvas at the precise location of each keypoint to place it according to the
   template definition.

E. For each placed keypoint, set the visibility flag using the sidebar controls:
   - Visible: The keypoint is clearly visible in the image.
   - Occluded: The keypoint exists but is partially or fully hidden.
   - Absent: The keypoint is not present or not applicable for this subject.

F. Skeleton connections between keypoints will be rendered automatically based on the loaded template.

G. Use the collapsible sidebar to manage and review the list of placed keypoints.

H. Navigate between images and export annotations in COCO JSON or YOLO v8 Pose format when complete.
   Select your preferred format from the export dialog.



USING ANNOSKELETON - SKELETON CREATOR:

A. Click on the "AnnoSkeleton" card from the landing page.

B. Use the canvas area to place named keypoints that define the skeleton structure.

C. Connect keypoints by selecting a starting keypoint and then selecting the destination keypoint.
   This creates a directed link representing a limb or structural connection.

D. Assign a name to the skeleton template using the name field provided.

E. Click "Save" to store the template in the Skeleton Store. Saved templates will be available
   for selection in AnnoPoint sessions.

F. To edit or delete an existing template, navigate to the Skeleton Store from the landing page and
   use the provided controls.



USING THE ANNOTATION VIEWER:

A. The Annotation Viewer can be used to inspect and verify previously exported COCO JSON annotation files.

B. Load the COCO JSON file and the corresponding image directory using the controls provided.

C. The viewer will overlay all annotations onto the images for visual review.

D. Navigate between images to check annotation quality and completeness before using the dataset for training.



USING THE DOWNLOAD PAGE:

A. The Download page provides access to saved exports and allows users to retrieve annotation files
   organized by session.

B. Navigate to the Download page using the navigation controls available in the header.



------------------------- IMPORTANT NOTES ---------------------------------------------------------------------------------------------


Note: AnnoForge supports multiple export formats:
      - COCO JSON: Standard COCO annotation specification compatible with COCO API, Detectron2, MMDetection, and similar frameworks.
      - YOLO v8: YOLO v8 format compatible with YOLOv8 and other YOLO-based detection models.
      - YOLO v8 Pose: Extended YOLO v8 format for keypoint and pose estimation tasks.

Note: For best performance and rendering accuracy, it is recommended to use a monitor with a resolution of
      1280 x 800 pixels or higher. The application is designed for desktop use and is not optimized for
      mobile or tablet screen sizes.


---------------------------------------------------------------------------------------------------------------------------------------------


ANNOTATION EXPORT FORMAT REFERENCE:


COCO JSON FORMAT:

The COCO JSON format used by AnnoForge for exports follows the structure below:

   images:
      - id: Unique integer identifier for the image.
      - file_name: File name of the image (e.g., "image_001.jpg").
      - width: Width of the image in pixels.
      - height: Height of the image in pixels.

   annotations:
      - id: Unique integer identifier for the annotation.
      - image_id: Reference to the corresponding image id.
      - category_id: Reference to the corresponding category id.
      - segmentation: List of polygon point coordinates (for AnnoPoly).
      - bbox: Bounding box coordinates in [x, y, width, height] format (for AnnoBox).
      - keypoints: Flattened list of [x, y, visibility] values (for AnnoPoint).
      - area: Area of the annotated region.
      - iscrowd: Set to 0 for all individual object annotations.

   categories:
      - id: Unique integer identifier for the category.
      - name: Human-readable class label name.
      - supercategory: Parent category name, if applicable.
      - keypoints: List of keypoint names (for keypoint annotations).
      - skeleton: List of keypoint index pairs defining limb connections.


YOLO v8 TXT FORMAT (For Bounding Box Annotations):

The YOLO v8 format exports bounding box annotations as .txt files corresponding to each image file:

   File Structure:
      - One annotation file per image with the same filename but .txt extension.
      - Example: image_001.jpg → image_001.txt

   File Content:
      - Each line represents one bounding box.
      - Format: <class_id> <x_center> <y_center> <width> <height>
      - All coordinates are normalized to [0, 1] range relative to image dimensions.
      - Multiple bounding boxes are represented on separate lines.

   Examples:
      - 0 0.5 0.5 0.3 0.4 (class_id=0, center at 50% horizontal, 50% vertical, width=30%, height=40%)
      - 1 0.2 0.7 0.15 0.25 (class_id=1, center at 20% horizontal, 70% vertical)


YOLO v8 POSE FORMAT (For Keypoint Annotations):

The YOLO v8 Pose format extends YOLO v8 TXT format to include keypoint information:

   File Content:
      - Format: <class_id> <x_center> <y_center> <width> <height> <kp1_x> <kp1_y> <kp1_v> <kp2_x> <kp2_y> <kp2_v> ...
      - Coordinates and dimensions follow YOLO v8 TXT format (normalized to [0, 1]).
      - Keypoint visibility (v): 0 = absent, 1 = occluded, 2 = visible.
      - Keypoints are listed in the order defined by the skeleton template.

   Examples:
      - 0 0.5 0.5 0.3 0.4 0.45 0.4 2 0.55 0.4 2 0.5 0.6 1 (bounding box with 3 keypoints)


---------------------------------------------------------------------------------------------------------------------------------------------
