

export const homeSteps = [
    {
        target: 'body',
        placement: 'center',
        title: 'Welcome to PixelSuite!',
        content: 'Let\'s take a quick tour of the features.',
        disableBeacon: true,
    },
    {
        target: '.tour-nav-logo',
        title: "Navigation",
        content: 'This is the main navigation. You can always click here to return Home.',
        placement: 'bottom'
    },
    {
        target: '.tour-download-link',
        title: "Download App",
        content: 'Need to work offline? Download our desktop application here.',
        placement: 'bottom'
    },
    {
        target: '.tour-get-started',
        title: "Quick Start",
        content: 'Click here to jump straight to the tools section.',
        placement: 'left',
    },
    {
        target: '#tools',
        title: "Tool Suite",
        content: 'Here are all the available annotation tools: Polygon, Bounding Box, Keypoint, and Skeleton.',
        placement: 'top',
    },
    {
        target: '.tour-tool-poly',
        title: "Polygon Tool",
        content: 'Use PixelPoly for precise segmentation tasks.',
        placement: 'top'
    },
    {
        target: '.tour-tool-bbox',
        title: "Bounding Box Tool",
        content: 'Use PixelBox for fast object detection labeling.',
        placement: 'top'
    },
    {
        target: '.tour-tool-keypoint',
        title: "Keypoint Tool",
        content: 'Use PixelPoint for precise pose estimation and feature tracking.',
        placement: 'top'
    },
    {
        target: '.tour-tool-skeleton',
        title: "Skeleton Creator",
        content: 'Design custom skeleton structures to reuse across your projects.',
        placement: 'top'
    }
];

export const bboxSteps = [
    {
        target: 'body',
        placement: 'center',
        title: 'Welcome to PixelBox',
        content: 'This tool is designed for bounding box object detection labeling.',
        disableBeacon: true,
    },
    {
        target: '.tour-image-list',
        title: "Image List",
        content: 'Your loaded images will appear here. Navigate through them to annotate effectively.',
        placement: 'bottom',
    },
    {
        target: '.tour-canvas-area',
        title: "Annotation Area",
        content: 'Draw bounding boxes directly on the image here. Click and drag to label objects.',
        placement: 'left',
    }
];

export const editorSteps = [
    {
        target: 'body',
        placement: 'center',
        title: 'Welcome to PixelPoly',
        content: 'This tool is for detailed polygon segmentation.',
        disableBeacon: true,
    },
    {
        target: '.tour-upload-btn',
        title: "Open Folder",
        content: 'Start by opening a local folder containing your images.',
        placement: 'right',
    },
    {
        target: '.tour-toolbar',
        title: "Tools & Filters",
        content: 'Access polygon list, filters, and other controls here.',
        placement: 'right'
    },
    {
        target: '.tour-canvas',
        title: "Canvas",
        content: 'Click on the image to add polygon points. Click the first point again to close the shape.',
        placement: 'left',
    },
    {
        target: '.tour-export-btn',
        title: "Save Work",
        content: 'Save your annotations to local files instantly.',
        placement: 'top'
    }
];

export const keypointSteps = [
    {
        target: 'body',
        placement: 'center',
        title: 'Welcome to PixelPoint',
        content: 'Annotate keypoints for pose estimation.',
        disableBeacon: true,
    },
    {
        target: '.tour-nodes-list',
        title: "Keypoints List",
        content: 'View and manage all the keypoints you have placed on the image.',
        placement: 'right',
    },
    {
        target: '.tour-canvas',
        title: "Canvas",
        content: 'Click on the image to place keypoints. You can also drag them to adjust positions.',
        placement: 'left'
    }
];

export const skeletonSteps = [
    {
        target: 'body',
        placement: 'center',
        title: 'Welcome to PixelSkeleton',
        content: 'Create custom skeleton structures for your models.',
        disableBeacon: true,
    },
    {
        target: '.tour-node-panel',
        title: "Controls",
        content: 'Add new skeletons, save your work, or upload a reference image.',
        placement: 'right',
    },
    {
        target: '.tour-edge-btn',
        title: "Link Mode",
        content: 'Toggle Link Mode to connect nodes together and define the structure.',
        placement: 'right',
    },
    {
        target: '.tour-templates',
        title: "Saved Templates",
        content: 'Access your saved skeleton templates here.',
        placement: 'left',
    }
];
