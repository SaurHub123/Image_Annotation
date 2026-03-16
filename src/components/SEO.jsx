import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, name, type, image, url }) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title ? `${title} | AnnoForge` : 'AnnoForge • AI Annotation Tools'}</title>
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />

            {/* End standard metadata tags */}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}
            {url && <meta property="og:url" content={url} />}
            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
            {/* End Twitter tags */}

            <link rel="canonical" href={url || window.location.href} />
        </Helmet>
    );
}

SEO.defaultProps = {
    title: 'AnnoForge',
    description: 'A unified platform for all your image annotation needs. Label polygons, bounding boxes, and keypoints with pixel-perfect precision.',
    keywords: 'annotation, computer vision, ai, machine learning, polygon, bounding box, keypoint, skeleton, yolo format',
    name: 'AnnoForge',
    type: 'website',
    image: '/og-image.png', // Ensure you have a default OG image in public folder or remove/replace
    url: ''
};

export default SEO;
