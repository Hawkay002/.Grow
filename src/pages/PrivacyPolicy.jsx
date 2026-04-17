import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trees, ArrowLeft, Shield, Eye, Database, Cookie, UserCheck, Mail, Globe, Lock, CheckCircle2, AlertCircle, Send } from 'lucide-react';
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
    icon: Database,
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you create an account we collect your email address and, if you sign in via Google, your display name and profile picture. We do not collect payment information — Grow-Voxly is free to use.'
      },
      {
        subtitle: 'Content You Create',
        text: 'We store the URLs you shorten, the custom slugs you choose, and the tree species and tile shape you select. This data is necessary to serve your QR codes and redirect visitors.'
      },
      {
        subtitle: 'Usage Data',
        text: 'Each time a visitor scans one of your QR codes, we increment a click counter associated with that link. We do not log the IP address or device of the scanner.'
      },
    ]
  },
  {
    icon: Eye,
    title: 'How We Use Your Information',
    content: [
      {
        subtitle: 'To Operate the Service',
        text: 'Your email is used to authenticate your account and send transactional messages (e.g. password resets). Your link data is used solely to generate QR codes and redirect end-users.'
      },
      {
        subtitle: 'To Improve the Service',
        text: 'Aggregate, anonymised usage patterns help us understand which tree species are most popular and how the engine performs under load. This data cannot be traced back to an individual user.'
      },
      {
        subtitle: 'We Do Not Sell Your Data',
        text: 'Grow-Voxly does not sell, rent, or trade your personal information to any third party, for any purpose, ever.'
      },
    ]
  },
  {
    icon: Globe,
    title: 'Third-Party Services',
    content: [
      {
        subtitle: 'Firebase (Google)',
        text: 'Authentication and database storage are handled by Google Firebase. Your data is stored in Firebase\'s servers and governed by Google\'s privacy policies in addition to ours. We use Firestore and Firebase Authentication.'
      },
      {
        subtitle: 'Vercel',
        text: 'Grow-Voxly is hosted on Vercel. Server request logs (including IP addresses) may be retained by Vercel according to their own data retention policies. We do not access these logs in normal operation.'
      },
      {
        subtitle: 'Google Sign-In',
        text: 'If you choose to log in with Google, Google will share your email address and public profile with us. We do not receive your Google password or any private profile data.'
      },
    ]
  },
  {
    icon: Cookie,
    title: 'Cookies & Local Storage',
    content: [
      {
        subtitle: 'Authentication Cookies',
        text: 'Firebase sets a session cookie to keep you logged in between visits. This cookie is strictly necessary for the service to function and is not used for tracking or advertising.'
      },
      {
        subtitle: 'No Analytics Cookies',
        text: 'We do not use Google Analytics, Meta Pixel, or any third-party advertising or tracking cookies. No cross-site tracking is performed on Grow-Voxly.'
      },
    ]
  },
  {
    icon: Lock,
    title: 'Data Security',
    content: [
      {
        subtitle: 'Encryption in Transit',
        text: 'All communication between your browser and our servers is encrypted via HTTPS/TLS. Firebase enforces HTTPS on all requests.'
      },
      {
        subtitle: 'Access Controls',
        text: 'Firestore Security Rules ensure that each user can only read and write their own link data. No user can access another user\'s trees, slugs, or click counts.'
      },
      {
        subtitle: 'Limitations',
        text: 'No system is perfectly secure. While we take reasonable precautions, we cannot guarantee the absolute security of data transmitted over the internet. Please use a strong, unique password.'
      },
    ]
  },
  {
    icon: UserCheck,
    title: 'Your Rights',
    content: [
      {
        subtitle: 'Access & Deletion',
        text: 'You can view all data we hold about you via your Dashboard. You may delete any link at any time. To permanently delete your account and all associated data, contact us at the email below.'
      },
      {
        subtitle: 'Data Portability',
        text: 'You can copy any of your short links and QR images directly from the Dashboard. No special export request is needed.'
      },
      {
        subtitle: 'Residents of the EEA / UK / California',
        text: 'You have additional rights under GDPR, UK-GDPR, and CCPA including the right to rectification, restriction of processing, and the right to object. Contact us to exercise these rights.'
      },
    ]
  },
];

const REASONS = [
  "Data Deletion Request",
  "Data Export Request",
  "Privacy Concern",
  "Cookie Policy Query",
  "Other"
];

export default function PrivacyPolicy() {
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
🛡️ *New Privacy Policy Contact*
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
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-emerald-50/60 to-transparent pointer-events-none" />

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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-6 ring-1 ring-emerald-200">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 font-medium">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We built Grow-Voxly to be simple and transparent. This page explains exactly what data we collect, why we collect it, and how you can control it. We believe privacy is a right, not a checkbox.
          </p>
        </motion.div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-24 space-y-8">
        {SECTIONS.map((section, si) => {
          const Icon = section.icon;
          return (
            <RevealSection key={section.title} delay={si * 0.04}>
              <div className="bg-white rounded-[2rem] ring-1 ring-slate-900/5 overflow-hidden">
                <div className="flex items-center gap-4 px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-slate-900">{section.title}</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {section.content.map((item) => (
                    <div key={item.subtitle} className="px-8 py-6">
                      <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-2">{item.subtitle}</h3>
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
          <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="text-center mb-10 relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 mb-4">
                <Mail size={22} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Privacy & Data Requests</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Need to delete your data or have a privacy concern? Send us a secure message and we will respond within 7 business days.
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
                  <textarea required name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none" placeholder="Provide details about your request..."></textarea>
                </div>

                {submitStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl text-sm font-medium">
                    <AlertCircle size={16} /> Something went wrong. Please try again.
                  </div>
                )}

                <button disabled={isSubmitting} type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold px-7 py-4 rounded-xl hover:bg-emerald-400 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-70 disabled:hover:translate-y-0">
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
            <Link to="/terms" className="text-slate-500 hover:text-emerald-400 font-medium transition-colors">Terms of Service</Link>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-500 font-bold">Privacy Policy</span>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Grow-Voxly</p>
        </div>
      </footer>
    </div>
  );
}
