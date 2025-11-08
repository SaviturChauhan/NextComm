import React from "react";
import { Link } from "react-router-dom";
import {
  FiTarget,
  FiUsers,
  FiAward,
  FiBook,
  FiCode,
  FiMessageSquare,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

const About = () => {
  const features = [
    {
      icon: FiMessageSquare,
      title: "Ask Anything",
      description:
        "Stuck on a tricky concept? Need help with a real-world implementation? Post your question and get detailed, practical answers from peers and industry experts.",
    },
    {
      icon: FiUsers,
      title: "Share Your Expertise",
      description:
        "Help others by providing clear, well-explained answers. Every great answer builds your reputation and contributes to the community's collective knowledge.",
    },
    {
      icon: FiAward,
      title: "Build Your Reputation",
      description:
        "We believe in recognizing contributions. By asking insightful questions and providing valuable answers, you'll earn points and badges, showcasing your expertise and standing within the wireless communication field.",
    },
    {
      icon: FiBook,
      title: "Learn and Grow",
      description:
        "Browse topics, follow discussions, and discover new insights on our curated platform, designed to help you stay at the forefront of the industry.",
    },
  ];

  const audience = [
    {
      icon: FiBook,
      title: "Students",
      description:
        "Navigating complex coursework and looking for clear explanations.",
    },
    {
      icon: FiCode,
      title: "Professional Engineers",
      description:
        "Tackling a new design challenge or seeking a fresh perspective.",
    },
    {
      icon: FiZap,
      title: "Hobbyists & Enthusiasts",
      description: "Passionate about the technology that connects our world.",
    },
    {
      icon: FiTrendingUp,
      title: "Academics & Researchers",
      description: "Looking to discuss and refine cutting-edge concepts.",
    },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-6">
              <FiTarget className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              About NextComm
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The premier online community and knowledge hub dedicated to the
              world of wireless communication
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-2xl shadow-lg border border-primary/20 dark:border-primary/30 p-8 md:p-10 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission: Demystifying Wireless Communication
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
              <p className="text-lg mb-4">
                Welcome to NextComm, the premier online community and knowledge
                hub dedicated to the world of wireless communication. Our
                mission is simple: to create a single, accessible platform where
                students, professionals, and enthusiasts can come together to
                ask, answer, and learn about every facet of wireless technology.
              </p>
              <p className="mb-4">
                From the fundamentals of RF and signal processing to the
                complexities of 5G, MIMO, OFDM, and beyond, wireless
                communication is a field that is both rapidly evolving and
                notoriously complex. We believe that learning and
                problem-solving should be a collaborative effort.
              </p>
            </div>
          </div>

          {/* What We Do Section */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              What We Do
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              NextComm is more than just a Q&A site; it's a community-driven
              ecosystem for knowledge sharing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl shadow-md border border-primary/20 dark:border-primary/30 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Who We Are For Section */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Who We Are For
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              This platform is built for you, whether you are:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {audience.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl border border-primary/20 dark:border-primary/30 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/20 dark:bg-primary/30 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Join Community Section */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 dark:from-primary/20 dark:via-primary/10 dark:to-primary/20 rounded-2xl border border-primary/20 dark:border-primary/30 p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              NextComm is powered by its users. Your curiosity and willingness
              to share are what make this community thrive. So, whether you have
              a question to ask or knowledge to share, we invite you to sign up,
              dive in, and help us build the most comprehensive wireless
              communication resource on the web.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/ask"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FiMessageSquare className="w-5 h-5" />
                Ask a Question
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-primary border-2 border-primary rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors font-semibold"
              >
                <FiTrendingUp className="w-5 h-5" />
                View Leaderboard
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Ready to get started?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>{" "}
              or{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                log in
              </Link>{" "}
              to join the conversation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
