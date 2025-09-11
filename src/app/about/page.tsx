'use client'

import { UnifiedNavigation } from '../../components/navigation'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <UnifiedNavigation mode="simple" />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        <div className="glass-effect p-8 rounded-2xl">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">
            About <span className="text-orange-400">Tech</span>Kwiz
          </h1>

          <div className="space-y-8 text-white">
            <section className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-xl text-blue-200 leading-relaxed">
                Empowering developers and tech enthusiasts worldwide through interactive learning and skill assessment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-orange-400 mb-4">Our Mission</h2>
              <div className="text-blue-100 space-y-4">
                <p>
                  TechKwiz is dedicated to making technology education accessible, engaging, and effective for everyone. We believe that learning should be interactive, challenging, and rewarding.
                </p>
                <p>
                  Our platform serves developers, students, job seekers, and tech enthusiasts who want to test their knowledge, identify skill gaps, and continuously improve their technical expertise.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-orange-400 mb-4">What We Offer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 p-6 rounded-xl">
                  <div className="text-3xl mb-3">📚</div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Comprehensive Categories</h3>
                  <p className="text-blue-200 text-sm">
                    8 major tech categories including Programming, AI/ML, Web Development, Mobile Development, Data Science, Cybersecurity, Cloud Computing, and Blockchain.
                  </p>
                </div>

                <div className="bg-white/10 p-6 rounded-xl">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Multiple Difficulty Levels</h3>
                  <p className="text-blue-200 text-sm">
                    Beginner, Intermediate, and Advanced levels ensure appropriate challenges for all skill levels.
                  </p>
                </div>

                <div className="bg-white/10 p-6 rounded-xl">
                  <div className="text-3xl mb-3">💡</div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Expert-Crafted Content</h3>
                  <p className="text-blue-200 text-sm">
                    All quiz questions are carefully crafted by experienced developers and tech professionals.
                  </p>
                </div>

                <div className="bg-white/10 p-6 rounded-xl">
                  <div className="text-3xl mb-3">🏆</div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Gamified Learning</h3>
                  <p className="text-blue-200 text-sm">
                    Earn coins, unlock achievements, compete on leaderboards, and track your progress.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-orange-400 mb-4">Why Choose TechKwiz?</h2>
              <div className="text-blue-100 space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <strong className="text-white">Free Access:</strong> All quizzes and features are completely free to use.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <strong className="text-white">Mobile Optimized:</strong> Perfect experience on all devices - mobile, tablet, and desktop.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <strong className="text-white">Instant Feedback:</strong> Get immediate results with detailed explanations and fun facts.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <strong className="text-white">Progress Tracking:</strong> Monitor your learning journey with comprehensive statistics.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <strong className="text-white">Community:</strong> Join thousands of learners and compete globally.
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-orange-400 mb-4">Our Commitment</h2>
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-xl">
                <div className="text-blue-100 space-y-3">
                  <p>
                    <strong className="text-white">Quality Education:</strong> We continuously update our content to reflect the latest industry trends and technologies.
                  </p>
                  <p>
                    <strong className="text-white">User Privacy:</strong> Your data privacy and security are our top priorities.
                  </p>
                  <p>
                    <strong className="text-white">Accessibility:</strong> We strive to make our platform accessible to learners worldwide.
                  </p>
                  <p>
                    <strong className="text-white">Continuous Improvement:</strong> We actively listen to user feedback and constantly enhance our platform.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-orange-400 mb-4">Perfect For</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-3xl mb-2">👨‍💻</div>
                  <h3 className="font-semibold text-yellow-300 mb-2">Developers</h3>
                  <p className="text-blue-200 text-sm">Test and improve your coding skills</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-3xl mb-2">🎓</div>
                  <h3 className="font-semibold text-yellow-300 mb-2">Students</h3>
                  <p className="text-blue-200 text-sm">Supplement your tech education</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-3xl mb-2">💼</div>
                  <h3 className="font-semibold text-yellow-300 mb-2">Job Seekers</h3>
                  <p className="text-blue-200 text-sm">Prepare for technical interviews</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-orange-400 mb-4">Get Started Today</h2>
              <div className="text-center">
                <p className="text-blue-200 mb-6">
                  Join thousands of tech enthusiasts who are already improving their skills with TechKwiz.
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors"
                >
                  Start Your Learning Journey
                </button>
              </div>
            </section>

            <section className="text-center pt-8 border-t border-white/10">
              <h2 className="text-2xl font-semibold text-orange-400 mb-4">Contact Us</h2>
              <div className="text-blue-200">
                <p>Have questions or feedback? We'd love to hear from you!</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:contact@techkwiz.com" className="text-orange-400 hover:text-orange-300">contact@techkwiz.com</a></p>
                  <p><strong>Support:</strong> <a href="mailto:support@techkwiz.com" className="text-orange-400 hover:text-orange-300">support@techkwiz.com</a></p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}