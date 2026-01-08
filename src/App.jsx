import { Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import Editor from "./components/Editor";
import AnnotationViewer from "./components/Viewer";
import KeypointAnnotator from "./components/KeyPoint";

function Home() {
  useEffect(() => {
    document.title = "Emplitech • Image Annotation Tool";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
          Emplitech Image Annotation
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
          Upload images, draw precise Free hand drawing annotations, visualize results,
          and export annotations in <span className="font-semibold">COCO format</span>
          — perfect for computer vision and ML projects.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/editor"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
          >
            Start Annotating
          </Link>
          <Link
            to="/viewer"
            className="px-6 py-3 rounded-xl bg-white text-blue-600 font-medium border border-blue-200 hover:bg-blue-50 transition"
          >
            View Annotations
          </Link>
          <Link
            to="/keypoints"
            className="px-6 py-3 rounded-xl bg-white text-blue-600 font-medium border border-blue-200 hover:bg-blue-50 transition"
          >
            Key-Point Annotations
          </Link>

        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Use Emplitech?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Precise Line Annotation",
              desc: "Draw straight, accurate lines on images with an intuitive editor built for speed and clarity.",
            },
            {
              title: "COCO Format Export",
              desc: "Automatically convert your annotations into COCO JSON format, ready for ML training pipelines.",
            },
            {
              title: "Visual Annotation Viewer",
              desc: "Preview and verify annotated images to ensure accuracy before exporting or sharing.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group bg-white p-6 rounded-2xl shadow hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              "Upload Image",
              "Free Hand Drawing",
              "Review Annotations",
              "Save as COCO JSON",
            ].map((step, index) => (
              <div
                key={index}
                className="rounded-xl border p-6 hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {index + 1}
                </div>
                <p className="font-medium text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 text-center">
        <h3 className="text-2xl font-semibold mb-4">
          Ready to Annotate Your Images?
        </h3>
        <p className="text-gray-600 mb-6">
          Create clean, structured annotations for your computer vision projects.
        </p>
        <Link
          to="/editor"
          className="px-8 py-3 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
        >
          Open Annotation Editor
        </Link>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/viewer" element={<AnnotationViewer />} />
      <Route path="/keypoints" element={<KeypointAnnotator />} />
    </Routes>
  );
}
