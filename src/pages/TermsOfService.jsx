import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trees, ArrowLeft, FileText, AlertTriangle, Ban, Scale, RefreshCw, Users, Globe, Wrench } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

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

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-slate-100/60 to-transparent pointer-events-none" />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 w-full px-6 py-6 lg:px-12 flex justify-between items-center border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2 text-emerald-950 font-serif font-bold text-2xl tracking-wide">
          <Trees size={26} className="text-emerald-600" />
          Grow-Voxly
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors px-4 py-2 rounded-full hover:bg-emerald-50"
        >
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

        {/* Contact card */}
        <RevealSection>
          <div className="bg-slate-900 rounded-[2rem] p-8 text-center">
            <h3 className="text-xl font-serif font-bold text-white mb-2">Questions About These Terms?</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Reach out and we'll do our best to clarify anything that's unclear.
            </p>
            <a
              href="https://wa.me/918777845713"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-7 py-3 rounded-xl hover:bg-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Contact Shovith
            </a>
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
            <Link to="/terms" className="text-emerald-500 font-bold">Terms of Service</Link>
            <span className="text-slate-700">·</span>
            <Link to="/privacy" className="text-slate-500 hover:text-emerald-400 font-medium transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Grow-Voxly</p>
        </div>
      </footer>
    </div>
  );
}
