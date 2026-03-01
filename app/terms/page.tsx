import Link from 'next/link'
import { Youtube } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — CommentPull',
  description: 'Terms of Service for CommentPull. Please review our terms carefully before using the platform.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Youtube size={16} /></div>
            <span className="font-bold text-lg">CommentPull</span>
          </Link>
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Back to home</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-3">Terms of Service</h1>
          <p className="text-white/50 text-sm">Please review our terms carefully before using the platform</p>
          <p className="text-white/30 text-xs mt-2">Actual since publication: March 01, 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Your Acceptance of the Terms of Service</h2>
            <p>
              By visiting and/or using CommentPull and/or creating an account, you signify that you have read, understood, and agree to be bound by these Terms of Service ("Terms of Service" or "Agreement"). These Terms of Service form a legally binding agreement between you and Crestlabs in relation to your use of the Services.
            </p>
            <p className="mt-3">
              We reserve the right, at our sole discretion, to change, modify, add, or delete portions of these Terms of Service at any time. If we do this, we will post the changes here. Your continued use of CommentPull after any such changes constitutes your acceptance of the new Terms of Service. If you do not agree to abide by these or any future Terms of Service, please do not use or access the platform. It is your responsibility to regularly review these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Description of Service</h2>
            <p>
              CommentPull is a tool that fetches publicly available YouTube comments via the official YouTube Data API v3 and allows you to export them as CSV files for personal or business use.
            </p>
            <ul className="mt-3 space-y-2 pl-4">
              <li className="flex items-start gap-2"><span className="text-red-400 shrink-0 mt-0.5">→</span><span><strong className="text-white/80">Free plan:</strong> up to 5 downloads per day, 100 comments per video.</span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 shrink-0 mt-0.5">→</span><span><strong className="text-white/80">Premium plan:</strong> unlimited daily downloads, up to 10,000 comments per video, plus API access.</span></li>
            </ul>
            <p className="mt-3">
              CommentPull is <strong className="text-white/80">not officially partnered or affiliated</strong> with youtube.com, google.com, instagram.com, facebook.com, tiktok.com or any other platform. As with the nature of the product, usage may interact with areas of their Terms of Service. However, CommentPull only accesses publicly available data through official APIs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Warranty Disclaimer</h2>
            <p className="uppercase text-white/50 text-xs leading-relaxed">
              THE SITE, THE CONTENT AND THE SERVICES PROVIDED BY COMMENTPULL ARE PROVIDED TO YOU ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES FROM CRESTLABS OF ANY KIND, EITHER EXPRESS OR IMPLIED. CRESTLABS EXPRESSLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. CRESTLABS DOES NOT REPRESENT OR WARRANT THAT SITE CONTENT IS ACCURATE, COMPLETE, RELIABLE, CURRENT OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Responsibility for Data</h2>
            <p>
              We do not make backups of your exported CSV files. Always keep a copy of data you download. While we try to ensure the service is error-free, we cannot guarantee that fetched comment data will be complete, accurate, or unaffected by changes to YouTube's API.
            </p>
            <p className="mt-3">
              You acknowledge that comment data comes directly from YouTube's API. CommentPull will not be responsible for missing, deleted, or inaccurate comments that YouTube's API does not return.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Limitation of Liability</h2>
            <p className="uppercase text-white/50 text-xs leading-relaxed">
              YOU WAIVE AND SHALL NOT ASSERT ANY CLAIMS OR ALLEGATIONS OF ANY NATURE WHATSOEVER AGAINST CRESTLABS, ITS AFFILIATES, CONTRACTORS, VENDORS OR OTHER PARTNERS, ANY OF THEIR SUCCESSORS OR ASSIGNS, OR ANY OF THEIR RESPECTIVE OFFICERS, DIRECTORS, AGENTS OR EMPLOYEES ARISING OUT OF OR IN ANY WAY RELATING TO YOUR USE OF COMMENTPULL OR ITS CONTENT.
            </p>
            <p className="mt-3">
              Without limitation of the foregoing, to the full extent permitted under law, neither Crestlabs nor any other released party shall be liable for any direct, special, indirect or consequential damages, or any other damages of any kind, including but not limited to loss of use, loss of profits or loss of data, arising out of or in any way connected with the use of CommentPull.
            </p>
            <p className="mt-3">
              Crestlabs' total liability for any claim arising from your use of CommentPull is limited to the amount you paid us in the 3 months prior to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Acceptable Use</h2>
            <p>You may use CommentPull for research, content analysis, sentiment analysis, academic studies, marketing insights, and legitimate business intelligence.</p>
            <p className="mt-3">You may <strong className="text-white/80">NOT</strong> use CommentPull to:</p>
            <ul className="mt-2 space-y-1.5 pl-4">
              {[
                'Harvest data for spam, harassment, or targeting individuals',
                'Build competing comment scraping or downloading services',
                'Attempt to reverse engineer, scrape, or abuse our API or systems',
                'Share your account credentials with others',
                'Use the service in any way that violates applicable laws',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 mt-0.5">→</span>{item}
                </li>
              ))}
            </ul>
            <p className="mt-3">By using CommentPull, you also agree to comply with <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">YouTube's Terms of Service</a>. The data you access is subject to YouTube's data policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. User Accounts & Registration</h2>
            <p>
              In order to register on the platform, you must provide full and accurate information in the registration form. You represent and warrant that you will be using CommentPull in the course of personal or professional activity.
            </p>
            <p className="mt-3">
              In case of an incomplete or erroneous registration, your account may be deactivated without notice. The login credentials are personal and should not be disclosed to third parties. All uses of the platform performed using your credentials shall be deemed to have been performed by you.
            </p>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms, without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Subscription & Payment</h2>
            <p>Premium subscriptions are billed monthly at <strong className="text-white/80">₹299/month</strong>. Payment is processed securely by Razorpay. Our services can be purchased online via UPI, debit/credit cards, or NetBanking. The delivery of Premium access is activated immediately once payment is processed, and you will be notified by email.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Refund Policy</h2>
            <p>
              If the service does not satisfy you or you have encountered problems that we were unable to solve, we will be happy to do a purchase cancellation and provide a refund. We offer a full refund within <strong className="text-white/80">7 days</strong> of your first subscription payment.
            </p>
            <p className="mt-3">
              The standard period from the moment of acceptance and confirmation of your refund request is 7 to 15 business days. In exceptional cases, the refund period may be extended, but we will notify you with an explanation. To request a refund, contact us at <a href="mailto:hello@crestlabs.in" className="text-red-400 hover:text-red-300">hello@crestlabs.in</a>.
            </p>
            <p className="mt-3">
              Cancellation of your subscription takes effect at the end of the current billing period. No partial refunds are given for unused time within a billing period after the 7-day window.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Copyright Policy</h2>
            <p>
              Do not use our services or intellectual property for any form of infringement. You are solely responsible for the data (e.g. URLs, exported files) which you send to or download from the CommentPull service. CommentPull does not monitor customer content.
            </p>
            <p className="mt-3">
              The CommentPull name, logo, website design, and underlying code are owned by Crestlabs. You may not copy or reproduce them without written permission. Premium users who use our API must credit CommentPull in their applications.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Governing Law and Jurisdiction</h2>
            <p>
              This website, any information contained on it, and these Terms of Service will be governed by and interpreted in accordance with the laws of <strong className="text-white/80">India</strong>. The Indian courts have jurisdiction to hear any disputes concerning matters involving this website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">12. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least <strong className="text-white/80">15 days' notice</strong> prior to any new terms taking effect via email to registered users. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">13. Contact</h2>
            <p>In case of any questions regarding these rules or the work of the service, you can contact us:</p>
            <div className="mt-3 bg-white/3 border border-white/8 rounded-xl p-4">
              <p><strong className="text-white/80">Crestlabs</strong></p>
              <p className="mt-1">Email: <a href="mailto:hello@crestlabs.in" className="text-red-400 hover:text-red-300">hello@crestlabs.in</a></p>
              <p className="mt-1">Website: <Link href="/" className="text-red-400 hover:text-red-300">CommentPull</Link></p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy" className="text-red-400 hover:text-red-300 transition-colors">Privacy Policy →</Link>
          <Link href="/" className="text-white/40 hover:text-white transition-colors">Back to CommentPull →</Link>
        </div>
      </div>
    </main>
  )
}
