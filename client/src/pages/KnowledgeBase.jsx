import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Video } from "lucide-react";
import apiService from "../services/api";
import Button from "../components/UI/Button";
import Spinner from "../components/UI/Spinner";
import EmptyState from "../components/UI/EmptyState";
import Seo from "../components/UI/Seo";

const isDirectVideoFile = (url) => /\.(mp4|webm|ogg)$/i.test(url);

/**
 * Knowledge Base page, backed entirely by the admin-managed
 * /api/public/knowledge-guides and /api/public/knowledge-videos resources.
 */
function KnowledgeBase() {
  const [guides, setGuides] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiService.getKnowledgeGuides(), apiService.getKnowledgeVideos()])
      .then(([guideData, videoData]) => {
        setGuides(guideData);
        setVideos(videoData);
      })
      .catch((err) => setError(err.message || "Failed to load knowledge base"))
      .finally(() => setLoading(false));
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
  };

  return (
    <>
      <Seo
        title="Knowledge Base"
        description="Troubleshooting guides and video tutorials for common HVAC and refrigeration issues, from our facility maintenance experts."
        path="/knowledge-base"
      />
      <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="container mx-auto px-6 py-12 min-h-[60vh]"
      role="main"
      aria-label="Knowledge Base Page"
    >
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800 dark:text-white flex items-center justify-center space-x-2">
        <BookOpen className="w-8 h-8 text-primary" />
        <span>Knowledge Base</span>
      </h1>

      {loading && <Spinner size="lg" />}
      {error && <p className="text-red-500 text-center mb-8">{error}</p>}

      {!loading && !error && (
        <>
          <section className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center space-x-2">
              <BookOpen className="w-6 h-6" />
              <span>Troubleshooting Guides</span>
            </h2>
            {guides.length === 0 ? (
              <EmptyState message="No guides published yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guides.map((guide, index) => (
                  <motion.div
                    key={guide.id}
                    variants={cardVariants}
                    custom={index}
                    className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{guide.title}</h3>
                    <ul className="list-disc mt-4 space-y-2 text-gray-600 dark:text-gray-300 pl-4">
                      {guide.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center space-x-2">
              <Video className="w-6 h-6" />
              <span>Video Tutorials</span>
            </h2>
            {videos.length === 0 ? (
              <EmptyState message="No videos published yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    variants={cardVariants}
                    custom={index}
                    className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{video.title}</h3>
                    {isDirectVideoFile(video.video_url) ? (
                      <video controls className="w-full h-48 rounded" aria-label={video.title}>
                        <source src={video.video_url} />
                      </video>
                    ) : (
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Watch video →
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              If you're uncomfortable performing these steps, or if the problem persists, our professionals
              are ready to help.
            </p>
            <Button href="/contact" className="bg-primary text-white py-3 px-6 rounded-lg font-semibold">
              Contact Us
            </Button>
          </section>
        </>
      )}
    </motion.div>
    </>
  );
}

export default KnowledgeBase;
