'use client'

import { SimpleNavigation } from '../../components/SimpleNavigation'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <SimpleNavigation />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        <div className="glass-effect p-8 rounded-2xl">
          <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
          <p className="text-blue-200 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-white">
            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">1. Information We Collect</h2>
              <div className="space-y-3 text-blue-100">
                <p>
                  TechKwiz collects information to provide better services to our users. We collect information in the following ways:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Account Information:</strong> When you create an account, we collect your email address and name.</li>
                  <li><strong>Quiz Data:</strong> We store your quiz responses, scores, and progress to provide personalized learning experiences.</li>
                  <li><strong>Usage Information:</strong> We collect information about how you use our services, including pages visited and time spent.</li>
                  <li><strong>Device Information:</strong> We may collect device-specific information such as browser type, operating system, and IP address.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">2. How We Use Information</h2>
              <div className="space-y-3 text-blue-100">
                <p>We use the information we collect for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our quiz platform services</li>
                  <li>Personalize your learning experience and track progress</li>
                  <li>Communicate with you about your account and services</li>
                  <li>Improve our services and develop new features</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">3. Information Sharing</h2>
              <div className="space-y-3 text-blue-100">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>With service providers who assist us in operating our platform (subject to confidentiality agreements)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">4. Cookies and Tracking Technologies</h2>
              <div className="space-y-3 text-blue-100">
                <p>We use cookies and similar tracking technologies to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Provide personalized content and advertisements</li>
                  <li>Improve our services and user experience</li>
                </ul>
                <p className="mt-3">
                  You can manage cookie preferences through your browser settings. However, disabling cookies may affect the functionality of our services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">5. Third-Party Services</h2>
              <div className="space-y-3 text-blue-100">
                <h3 className="font-medium text-yellow-300">Google AdSense</h3>
                <p>
                  We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your visits to our site and other sites on the Internet. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-orange-400 underline">Google's Ads Settings</a>.
                </p>
                
                <h3 className="font-medium text-yellow-300 mt-4">Google Analytics</h3>
                <p>
                  We use Google Analytics to analyze website usage. Google Analytics uses cookies to collect information about how visitors use our site. You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" className="text-orange-400 underline">Google Analytics Opt-out Browser Add-on</a>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">6. Data Security</h2>
              <div className="space-y-3 text-blue-100">
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">7. Your Rights</h2>
              <div className="space-y-3 text-blue-100">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a copy of your data</li>
                  <li>Object to processing of your personal information</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">8. Children's Privacy</h2>
              <div className="space-y-3 text-blue-100">
                <p>
                  Our services are designed for users aged 13 and above. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">9. International Data Transfers</h2>
              <div className="space-y-3 text-blue-100">
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">10. Changes to This Policy</h2>
              <div className="space-y-3 text-blue-100">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">11. Contact Us</h2>
              <div className="space-y-3 text-blue-100">
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="bg-white/10 p-4 rounded-lg">
                  <p><strong>Email:</strong> privacy@techkwiz.com</p>
                  <p><strong>Address:</strong> TechKwiz Privacy Team, [Your Business Address]</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}