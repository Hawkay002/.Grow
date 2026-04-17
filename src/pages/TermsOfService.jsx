import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trees, ArrowLeft, FileText, AlertTriangle, Ban, Scale, RefreshCw, Users, Globe, Wrench, Mail, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { sortedCountryCodes } from '../utils/countryCodes';

const LAST_UPDATED = 'April 17, 2025';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: d } })
};

function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={fadeUp} custom={delay} className={className}>
      {children}
    </motion.div>
  );
}

const SECTIONS = [
  {
    icon: Users,
    title: 'Acceptance of Terms',
    content: [
      {
        subtitle: 'Agreement',
        text: 'By creating an account or using Grow-Voxly in any way, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.'
      },
      {
        subtitle: 'Age Requirement',
        text: 'You must be at least 13 years of age to use Grow-Voxly. By using the service, you represent that you meet this requirement. If you are under 18, you confirm you have parental or guardian consent.'
      },
      {
        subtitle: 'Changes to Terms',
        text: 'We may update these terms at any time. We will indicate the date of the most recent update at the top of this page. Continued use of Grow-Voxly after changes are posted constitutes acceptance of the revised terms.'
      },
    ]
  },
  {
    icon: Wrench,
    title: 'The Service',
    content: [
      {
        subtitle: 'What We Provide',
        text: 'Grow-Voxly is a URL shortening and QR code generation platform. We convert your URLs into procedurally generated 3D voxel tree visualisations and scannable QR codes hosted under our domain.'
      },
      {
        subtitle: 'Free Tier',
        text: 'Grow-Voxly is currently provided free of charge. We reserve the right to introduce paid plans, usage limits, or feature gates in the future with reasonable advance notice.'
      },
      {
        subtitle: 'Service Availability',
        text: 'We aim for high availability but do not guarantee uninterrupted access. Grow-Voxly may be unavailable during maintenance windows, unexpected outages, or circumstances beyond our control.'
      },
    ]
  },
  {
    icon: Scale,
    title: 'Your Account',
    content: [
      {
        subtitle: 'Account Responsibility',
        text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately if you suspect unauthorised access.'
      },
      {
        subtitle: 'Accurate Information',
        text: 'You agree to provide accurate and truthful information when creating your account and to keep it up to date. Accounts created with false information may be suspended without notice.'
      },
      {
        subtitle: 'One Account Per Person',
        text: 'Each person may maintain only one account. Creating multiple accounts to circumvent restrictions or abuse the free tier is prohibited and may result in all associated accounts being terminated.'
      },
    ]
  },
  {
    icon: Ban,
    title: 'Prohibited Uses',
    content: [
      {
        subtitle: 'Illegal Content',
        text: 'You may not use Grow-Voxly to shorten, share, or redirect to URLs hosting illegal content including but not limited to: child sexual abuse material, content that facilitates violence, stolen credentials, or counterfeit goods.'
      },
      {
        subtitle: 'Malicious Links',
        text: 'You may not use Grow-Voxly to distribute malware, phishing pages, drive-by download exploits, or any URL designed to deceive users or compromise their devices or accounts.'
      },
      {
        subtitle: 'Spam & Abuse',
        text: 'Mass distribution of Grow-Voxly QR codes for unsolicited bulk messaging (spam), pyramid schemes, or deceptive marketing practices is strictly prohibited.'
      },
      {
        subtitle: 'Platform Abuse',
        text: 'Automated creation of links, reverse-engineering the API, denial-of-service attacks, or any action intended to degrade the experience for other users is prohibited.'
      },
    ]
  },
  {
    icon: Globe,
    title: 'Your Content & Licence',
    content: [
      {
        subtitle: 'Ownership',
        text: 'You retain ownership of the URLs and titles you submit. By using Grow-Voxly, you grant us a limited, non-exclusive licence to store and serve your content solely for the purpose of operating the service.'
      },
      {
        subtitle: 'Content Responsibility',
        text: 'You are solely responsible for ensuring that the destination URLs you shorten comply with all applicable laws and do not infringe on the rights of any third party.'
      },
      {
        subtitle: 'Our Intellectual Property',
        text: 'The Grow-Voxly name, logo, tree generation engine, and all associated code and design are the intellectual property of the developer. You may not copy, reproduce, or create derivative works without explicit written permission.'
      },
    ]
  },
  {
    icon: AlertTriangle,
    title: 'Disclaimers & Liability',
    content: [
      {
        subtitle: 'Service Provided "As Is"',
        text: 'Grow-Voxly is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability or fitness for a particular purpose.'
      },
      {
        subtitle: 'Limitation of Liability',
        text: 'To the fullest extent permitted by law, Grow-Voxly and its developer shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of (or inability to use) the service.'
      },
      {
        subtitle: 'Link Accuracy',
        text: 'We do not review destination URLs for accuracy or safety beyond automated abuse detection. Grow-Voxly is not responsible for the content of any website your QR code redirects to.'
      },
    ]
  },
  {
    icon: RefreshCw,
    title: 'Termination & Data',
    content: [
      {
        subtitle: 'Your Right to Leave',
        text: 'You may stop using Grow-Voxly and request account deletion at any time by contacting us. Upon deletion, your links will cease to redirect and your data will be removed from our database within 30 days.'
      },
      {
        subtitle: 'Our Right to Terminate',
        text: 'We reserve the right to suspend or permanently terminate accounts that violate these terms, with or without prior notice depending on the severity of the violation.'
      },
      {
        subtitle: 'Effect of Termination',
        text: 'Upon termination, all your short links will become inactive. We will delete your personal data in accordance with our Privacy Policy. Provisions of these terms that by their nature should survive termination shall do so.'
      },
    ]
  },
  {
    icon: Scale,
    title: 'Governing Law',
    content: [
      {
        subtitle: 'Jurisdiction',
        text: 'These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of Grow-Voxly shall be subject to the exclusive jurisdiction of the courts of West Bengal, India.'
      },
      {
        subtitle: 'Severability',
        text: 'If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.'
      },
    ]
  },
];

const REASONS = [
  "Account Suspension Query",
  "Acceptable Use Verification",
  "Copyright/IP Issue",
  "General Terms Inquiry",
  "Other"
];

export default function TermsOfService() {
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '',
    email: '', countryCode: '+91', phone: '',
    reason: REASONS[0], customReason: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Replace the hardcoded strings with your environment variables
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    const finalReason = formData.reason === 'Other' ? formData.customReason : formData.reason;
    const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`;

    const textMsg = `
⚖️ *New Terms of Service Contact*
*Name:* ${fullName}
*Email:* ${formData.email}
*Phone:* ${formData.countryCode} ${formData.phone}
*Reason:* ${finalReason}

*Message:*
${formData.message}
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: textMsg, parse_mode: 'Markdown' })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ firstName: '', middleName: '', lastName: '', email: '', countryCode: '+91', phone: '', reason: REASONS[0], customReason: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      setSubmitStatus('error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-slate-100/60 to-transparent pointer-events-none" />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full px-6 py-6 lg:px-12 flex justify-between items-center border-b border-slate-100 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-2 text-emerald-950 font-serif font-bold text-2xl tracking-wide">
          <Trees size={26} className="text-emerald-600" />
          Grow-Voxly
        </div>
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors px-4 py-2 rounded-full hover:bg-emerald-50">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 mb-6 ring-1 ring-slate-200">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-500 font-medium">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
            These Terms of Service govern your use of Grow-Voxly. Please read them carefully. By using the service you agree to these terms. They are written to be human-readable — no lawyer required.
          </p>
        </motion.div>
      </div>

      {/* ── TABLE OF CONTENTS ───────────────────────────────────────────── */}
      <RevealSection className="max-w-4xl mx-auto px-6 mb-10">
        <div className="bg-white rounded-[2rem] ring-1 ring-slate-900/5 p-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-5">Table of Contents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SECTIONS.map((s, i) => (
              <div key={s.title} className="flex items-center gap-3 text-sm text-slate-600 font-medium py-1">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {s.title}
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-24 space-y-8">
        {SECTIONS.map((section, si) => {
          const Icon = section.icon;
          return (
            <RevealSection key={section.title} delay={si * 0.04}>
              <div className="bg-white rounded-[2rem] ring-1 ring-slate-900/5 overflow-hidden">
                <div className="flex items-center gap-4 px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                      {si + 1}
                    </span>
                    <h2 className="text-xl font-serif font-bold text-slate-900">{section.title}</h2>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {section.content.map((item) => (
                    <div key={item.subtitle} className="px-8 py-6">
                      <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">{item.subtitle}</h3>
                      <p className="text-slate-600 leading-relaxed text-[15px]">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          );
        })}

        {/* ── CONTACT FORM ────────────────────────────────────────────────── */}
        <RevealSection>
          <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-700/30 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="text-center mb-10 relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 text-slate-300 mb-4 border border-slate-700">
                <Mail size={22} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Terms & Policy Inquiries</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Have questions about our acceptable use or copyright policy? Send us a message below.
              </p>
            </div>

            {submitStatus === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center relative z-10">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Message Sent</h4>
                <p className="text-emerald-200/80 text-sm">We've received your request securely and will get back to you shortly.</p>
                <button onClick={() => setSubmitStatus(null)} className="mt-6 text-emerald-400 text-sm font-semibold hover:text-emerald-300">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">First Name *</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Middle Name</label>
                    <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="(Optional)" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Last Name *</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Phone Number *</label>
                    <div className="flex">
                      <select name="countryCode" value={formData.countryCode} onChange={handleChange} className="bg-slate-800 border border-slate-700 rounded-l-xl px-2 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all border-r-0 cursor-pointer max-w-[120px]">
                        {sortedCountryCodes.map((c, i) => (
                          <option key={`cc-${i}`} value={c.code}>{c.code} ({c.iso.toUpperCase()})</option>
                        ))}
                      </select>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-r-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="1234567890" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Reason for Contact *</label>
                  <select name="reason" value={formData.reason} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer">
                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {formData.reason === 'Other' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 mt-2">Specify Reason *</label>
                    <input required type="text" name="customReason" value={formData.customReason} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Please specify your reason..." />
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Message *</label>
                  <textarea required name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none" placeholder="Provide details about your inquiry..."></textarea>
                </div>

                {submitStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl text-sm font-medium">
                    <AlertCircle size={16} /> Something went wrong. Please try again.
                  </div>
                )}

                <button disabled={isSubmitting} type="submit" className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-bold px-7 py-4 rounded-xl hover:bg-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0">
                  {isSubmitting ? 'Sending Request...' : <><Send size={18} /> Submit Request</>}
                </button>
              </form>
            )}
          </div>
        </RevealSection>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 border-t border-slate-800 py-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trees size={18} className="text-emerald-500" />
            <span className="font-serif font-bold text-white">Grow-Voxly</span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <Link to="/" className="text-slate-500 hover:text-emerald-400 font-medium transition-colors">Home</Link>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-500 font-bold">Terms of Service</span>
            <span className="text-slate-700">·</span>
            <Link to="/privacy" className="text-slate-500 hover:text-emerald-400 font-medium transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Grow-Voxly</p>
        </div>
      </footer>
    </div>
  );
}
