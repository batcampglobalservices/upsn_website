import Carousel from "../components/Carousel";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import schoolImage from "../assets/img/caroussel2.jpg";
import Navbar from "../components/Navbar";

function ScrollAnimate({ children }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 100 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function Home() {
  return (
    <>
      <Navbar />
      <div className="bg-gray-950 min-h-screen text-gray-100 font-serif">
        {/* Carousel Section */}
        <Carousel />

        {/* About Section */}
        <ScrollAnimate>
          <section className="max-w-6xl mx-auto py-20 px-6">
            <h1 className="text-5xl font-bold text-center mb-14 tracking-tight">
              About <span className="text-blue-400">Us</span>
            </h1>

            {/* Vision Section */}
            <div className="flex flex-col md:flex-row items-center gap-12 mb-16 bg-gray-900/70 p-8 rounded-3xl shadow-lg shadow-blue-500/5 border border-gray-800 hover:shadow-blue-500/20 transition-all">
              <div className="md:w-1/2">
                <img
                  src={schoolImage}
                  alt="school"
                  className="rounded-2xl w-full h-[320px] object-cover ring-1 ring-gray-800 hover:ring-blue-400 transition-all"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-semibold text-blue-400 mb-4">
                  Our Vision
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  The University of Nigeria Primary School, Nsukka, proudly sits
                  on the historic Nsukka campus — a hub of learning and
                  innovation. Guided by the motto{" "}
                  <span className="italic text-blue-400">
                    “In Pursuit of Excellence,”
                  </span>{" "}
                  we strive to instill passion, confidence, and moral integrity
                  in our students.
                </p>
              </div>
            </div>

            {/* Mission Section */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 bg-gray-900/70 p-8 rounded-3xl shadow-lg shadow-blue-500/5 border border-gray-800 hover:shadow-blue-500/20 transition-all">
              <div className="md:w-1/2">
                <img
                  src={schoolImage}
                  alt="school"
                  className="rounded-2xl w-full h-[320px] object-cover ring-1 ring-gray-800 hover:ring-blue-400 transition-all"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-semibold text-blue-400 mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  To nurture creative thinkers and future leaders through
                  quality education, discipline, and compassion. Our goal is to
                  empower each child to reach their highest potential —
                  academically and morally.
                </p>
              </div>
            </div>
          </section>
        </ScrollAnimate>

        {/* Why UPSN Section */}
        <ScrollAnimate>
          <section className="max-w-6xl mx-auto pt-10 pb-20 px-6">
            <h2 className="text-4xl font-bold text-center mb-12 tracking-tight">
              Why <span className="text-blue-400">UPSN</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                {
                  icon: "🏫",
                  title: "State-of-the-Art Facilities",
                  text: "We pride ourselves on having excellent facilities — from labs to sports fields designed for holistic development.",
                },
                {
                  icon: "🎓",
                  title: "Career Readiness",
                  text: "Our guidance and counseling system helps prepare pupils for lifelong learning and leadership roles.",
                },
                {
                  icon: "🤝",
                  title: "Safe & Supportive Environment",
                  text: "We ensure a caring and inclusive atmosphere where every child feels valued and supported.",
                },
                {
                  icon: "💡",
                  title: "Values & Ethics",
                  text: "We nurture discipline, empathy, and responsibility — preparing children for a morally upright future.",
                },
                {
                  icon: "👨‍👩‍👧",
                  title: "Parental Involvement",
                  text: "We encourage strong school-home partnerships to support each child’s growth and potential.",
                },
                {
                  icon: "🌍",
                  title: "Community Engagement",
                  text: "We inspire pupils to take part in activities that promote teamwork and civic responsibility.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-900/70 border border-gray-800 hover:border-blue-500 rounded-3xl p-8 shadow-md hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-semibold text-gray-100 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-base leading-relaxed mb-4">
                    {item.text}
                  </p>
                  <a
                    href="#"
                    className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
                  >
                    Read more →
                  </a>
                </div>
              ))}
            </div>
          </section>
        </ScrollAnimate>

        {/* Footer */}
        <footer className="bg-gray-900/80 text-center py-8 border-t border-gray-800 shadow-inner">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} University of Nigeria Primary School,
            Nsukka. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}

export default Home;
