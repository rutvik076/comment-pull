import Link from 'next/link'
import { Youtube } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — CommentPull',
  description: 'Privacy Policy for CommentPull. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-black tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-white/50 text-sm">Learn how we collect, use, and protect your personal information</p>
          <p className="text-white/30 text-xs mt-2">Actual since publication: March 01, 2026</p>
        </div>

        {/* Intro notice */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-5 mb-10 text-sm text-white/60 leading-relaxed">
          <p>
            Dear visitor, please read our Privacy Policy carefully. We encourage all visitors (users) to read our <strong className="text-white/80">PRIVACY POLICY</strong> and also our <Link href="/terms" className="text-red-400 hover:text-red-300">TERMS OF USE</Link>. By simply accessing this website you agree and accept all of our terms and conditions and our privacy policy, which can be changed at any time.
          </p>
          <p className="mt-3">
            If you can read this privacy policy available for CommentPull, it means that you agree with all the terms listed here. If you do not agree with our privacy policy, you should leave this website immediately.
          </p>
          <p className="mt-3">
            You should know that <strong className="text-white/80">we respect your privacy, and we will never sell your information to anyone.</strong> We hate spam as much as you do — you will only ever receive an email from us that you have requested. We use secure hosting and other security measures to protect our database and any information provided.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Tracking</h2>
            <p>
              We don't directly track your presence on this website. Your IP address may be logged and we look at server logs on occasion, but only in an aggregate fashion for the purpose of determining why people visit us — for example, which websites send us traffic and what keywords people use to find us via search engines such as Google.
            </p>
            <p className="mt-3">
              We do not build or associate such data to create a user profile or to track you individually. We do not share or sell such data. We remove automatically stored logs periodically and do not retain them for extended periods.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Cookies</h2>
            <p>
              "Cookies" are small data files sent to your web browser from a web server that can store information about user preferences. Most web browsers accept cookies by default, but you can set them to reject cookies or delete them manually. These options are generally found under the "Privacy" setting in your browser.
            </p>
            <p className="mt-3">
              CommentPull uses browser <strong className="text-white/80">localStorage</strong> to keep you signed in between sessions. This stores only your user ID and session token — it is not used for advertising or tracking purposes.
            </p>
            <p className="mt-3">
              You can adjust your browser cookie settings via:&nbsp;
              <a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">Internet Explorer</a>,&nbsp;
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">Google Chrome</a>,&nbsp;
              <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">Mozilla Firefox</a>,&nbsp;
              <a href="https://support.apple.com/en-us/105082" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">Safari</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Information We Collect</h2>
            <p>When you create an account, we collect your <strong className="text-white/80">email address and name</strong>. If you sign in with Google, we receive your email, name, and profile picture from Google's OAuth service.</p>
            <p className="mt-3">We collect data about how you use CommentPull, including which YouTube video IDs you fetch comments from, your download count, and activity timestamps. <strong className="text-white/80">We do NOT store the actual YouTube comment content</strong> — all comment data goes directly from the YouTube API to your browser.</p>
            <p className="mt-3">For Premium subscriptions, payments are processed entirely by <strong className="text-white/80">Razorpay</strong>. We never store your card details, UPI ID, or any payment credentials on our servers.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">How We Use Your Information</h2>
            <p>Your email is used to:</p>
            <ul className="mt-2 space-y-1.5 pl-4">
              {[
                'Authenticate your account and keep you signed in',
                'Enforce the free plan limit of 5 downloads per day',
                'Verify and manage your Premium subscription status',
                'Send important service updates (no marketing spam)',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 mt-0.5">→</span>{item}
                </li>
              ))}
            </ul>
            <p className="mt-3">Aggregated, anonymized usage data helps us understand which features to build next. We do not sell, rent, or trade your personal information to any third party.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Data Storage & Security</h2>
            <p>Your account data is stored in <strong className="text-white/80">Supabase</strong> (secure cloud database). Our application runs on <strong className="text-white/80">Vercel</strong>. Payment records are maintained by <strong className="text-white/80">Razorpay</strong>.</p>
            <p className="mt-3">We use industry-standard security measures including HTTPS encryption, Row Level Security (RLS) on our database, and secure server-side API key handling. Passwords are hashed and never stored in plain text.</p>
            <p className="mt-3">Your account data is retained as long as your account is active. You can request deletion at any time by emailing <a href="mailto:hello@crestlabs.in" className="text-red-400 hover:text-red-300">hello@crestlabs.in</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Third-Party Services</h2>
            <p>CommentPull uses the following third-party services, each with their own privacy policies:</p>
            <ul className="mt-2 space-y-1.5 pl-4">
              {[
                'Supabase — database and authentication',
                'Vercel — hosting and serverless functions',
                'Razorpay — payment processing',
                'Google OAuth — optional sign-in method',
                'YouTube Data API v3 — comment data source',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 mt-0.5">→</span>{item}
                </li>
              ))}
            </ul>
            <p className="mt-3">CommentPull is <strong className="text-white/80">not officially partnered or affiliated</strong> with YouTube, Google, Instagram, Facebook, or any other social media platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Your Rights</h2>
            <p>If you are located in certain countries, including those under the scope of the <strong className="text-white/80">GDPR</strong>, data protection laws give you the following rights with respect to your personal data:</p>
            <ul className="mt-2 space-y-1.5 pl-4">
              {[
                'Request access to your personal data',
                'Request correction or deletion of your personal data',
                'Object to our use and processing of your personal data',
                'Request that we limit our use and processing of your personal data',
                'Request portability of your personal data',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 mt-0.5">→</span>{item}
                </li>
              ))}
            </ul>
            <p className="mt-3">You can access and manage most of your data through your dashboard. For other requests, email us at <a href="mailto:hello@crestlabs.in" className="text-red-400 hover:text-red-300">hello@crestlabs.in</a>. EU individuals also have the right to make a complaint to a government supervisory authority.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Children's Privacy</h2>
            <p>CommentPull is not intended for children under 13. We do not knowingly collect personal information from children. If you believe a child has registered an account, contact us immediately at <a href="mailto:hello@crestlabs.in" className="text-red-400 hover:text-red-300">hello@crestlabs.in</a> and we will remove the account.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Changes to This Policy</h2>
            <p>We reserve the right to update this Privacy Policy at any time. We encourage you to visit this page frequently to stay informed. Continued use of CommentPull after any changes constitutes your acceptance of the updated policy. Significant changes will be communicated to registered users by email.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Contact</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="mt-3 bg-white/3 border border-white/8 rounded-xl p-4">
              <p><strong className="text-white/80">Crestlabs</strong></p>
              <p className="mt-1">Email: <a href="mailto:hello@crestlabs.in" className="text-red-400 hover:text-red-300">hello@crestlabs.in</a></p>
              <p className="mt-1">Website: <Link href="/" className="text-red-400 hover:text-red-300">CommentPull</Link></p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-sm">
          <Link href="/terms" className="text-red-400 hover:text-red-300 transition-colors">Terms of Service →</Link>
          <Link href="/" className="text-white/40 hover:text-white transition-colors">Back to CommentPull →</Link>
        </div>
      </div>
    </main>
  )
}
