import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiArrowRight, FiUsers, FiMessageSquare, FiAward, FiZap } from 'react-icons/fi';

const Welcome = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FiMessageSquare className="w-8 h-8 text-primary" />,
      title: "Ask Questions",
      description: "Get help with wireless communication concepts from experts and peers."
    },
    {
      icon: <FiUsers className="w-8 h-8 text-primary" />,
      title: "Community Learning",
      description: "Connect with fellow students and professionals in the field."
    },
    {
      icon: <FiAward className="w-8 h-8 text-primary" />,
      title: "Earn Points",
      description: "Build your reputation by asking great questions and providing helpful answers."
    },
    {
      icon: <FiZap className="w-8 h-8 text-primary" />,
      title: "Real-time Help",
      description: "Get instant answers to your wireless communication questions."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
        <div 
          className="h-[400px] md:h-[500px] lg:h-[600px] w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4 text-center text-white">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to the Wireless Q&A Hub
          </h1>
          <p className="max-w-[700px] text-lg md:text-xl">
            Your go-to platform for wireless communication questions and answers. 
            Earn points, build your knowledge, and connect with fellow students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-white shadow-lg transition-transform duration-200 ease-in-out hover:scale-105"
              >
                Go to Dashboard
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-white shadow-lg transition-transform duration-200 ease-in-out hover:scale-105"
                >
                  Join Now
                  <FiArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm px-8 text-base font-bold text-white border border-white/30 hover:bg-white/30 transition-colors"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide the best tools and community for learning wireless communication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5 dark:bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals already using our platform
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-white hover:bg-primary/90 transition-colors"
              >
                Create Account
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-primary text-primary px-8 text-base font-bold hover:bg-primary hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Welcome;

