export interface InfoSection {
  heading?: string;
  body?: string;
  bullets?: string[];
}

export interface InfoStat {
  value: string;
  label: string;
}

export interface InfoFaq {
  q: string;
  a: string;
}

export interface InfoPageData {
  eyebrow: string;
  title: string;
  lead: string;
  icon: string;
  gradient: string;
  stats?: InfoStat[];
  sections?: InfoSection[];
  faqs?: InfoFaq[];
  cta?: { title: string; body: string; label: string; link: string };
}

export const INFO_PAGES: Record<string, InfoPageData> = {
  about: {
    eyebrow: 'Our story',
    title: 'We build technology worth keeping',
    lead: 'Nova started with a simple belief: premium electronics should be beautiful, sustainable, and built to last. Today we serve millions of curious minds worldwide.',
    icon: 'lucideSparkles',
    gradient: 'from-violet-500 via-fuchsia-500 to-orange-400',
    stats: [
      { value: '2.4M+', label: 'Happy customers' },
      { value: '60+', label: 'Countries shipped' },
      { value: '4.9/5', label: 'Average rating' },
      { value: '128', label: 'Team members' },
    ],
    sections: [
      {
        heading: 'Designed with intention',
        body: 'Every product in our catalogue is hand-selected by a team of engineers and designers who obsess over the details — from the materials to the unboxing moment.',
      },
      {
        heading: 'What we stand for',
        bullets: [
          'Radical transparency on pricing and sourcing',
          'Carbon-neutral shipping on every order',
          'A five-year commitment to repairability',
          'Real humans on support, around the clock',
        ],
      },
    ],
    cta: { title: 'Join the journey', body: 'Explore the collection that customers can\u2019t stop talking about.', label: 'Shop the catalogue', link: '/catalog' },
  },
  careers: {
    eyebrow: 'Careers',
    title: 'Do the best work of your life',
    lead: 'We\u2019re a remote-first team of makers building the future of commerce. If you care about craft and customers, you\u2019ll feel right at home.',
    icon: 'lucideBriefcase',
    gradient: 'from-sky-500 via-indigo-500 to-purple-500',
    stats: [
      { value: '100%', label: 'Remote friendly' },
      { value: '\u221e', label: 'Learning budget' },
      { value: '4-day', label: 'Summer weeks' },
      { value: '32', label: 'Open roles' },
    ],
    sections: [
      {
        heading: 'Why Nova',
        bullets: [
          'Competitive salary and meaningful equity',
          'Top-tier hardware and home-office stipend',
          'Generous paid time off — actually taken',
          'Quarterly team retreats in beautiful places',
        ],
      },
      {
        heading: 'How we hire',
        body: 'A short intro chat, a paid take-home aligned to real work, and a values conversation. No trick questions, no whiteboard gauntlets.',
      },
    ],
    cta: { title: 'See open roles', body: 'We\u2019re growing across engineering, design, and support.', label: 'Browse positions', link: '/careers' },
  },
  press: {
    eyebrow: 'Press',
    title: 'Nova in the headlines',
    lead: 'Resources, brand assets, and the latest news for journalists and creators covering Nova.',
    icon: 'lucideNewspaper',
    gradient: 'from-rose-500 via-orange-500 to-amber-400',
    sections: [
      {
        heading: 'Media enquiries',
        body: 'For interviews, product samples, or fact-checking, reach our communications team at press@nova.example and we\u2019ll respond within one business day.',
      },
      {
        heading: 'Recent coverage',
        bullets: [
          '\u201CThe most thoughtful gadget store on the web\u201D — The Verge',
          '\u201CNova nails the premium unboxing\u201D — Wired',
          '\u201CSustainability without compromise\u201D — Fast Company',
        ],
      },
    ],
  },
  sustainability: {
    eyebrow: 'Sustainability',
    title: 'Commerce that respects the planet',
    lead: 'We measure our footprint, offset what we can\u2019t reduce, and reinvest in the communities that make our products possible.',
    icon: 'lucideLeaf',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    stats: [
      { value: '100%', label: 'Carbon neutral' },
      { value: '92%', label: 'Recyclable packaging' },
      { value: '1%', label: 'Revenue to planet' },
      { value: '0', label: 'Single-use plastic' },
    ],
    sections: [
      {
        heading: 'Our commitments',
        bullets: [
          'Plastic-free, recyclable packaging by default',
          'Carbon-neutral delivery on every order',
          'A trade-in program that keeps devices in use',
          'Annual public impact reporting',
        ],
      },
    ],
    cta: { title: 'Read the impact report', body: 'See the numbers behind our commitments, updated yearly.', label: 'Explore the catalogue', link: '/catalog' },
  },
  help: {
    eyebrow: 'Help center',
    title: 'How can we help?',
    lead: 'Answers to the questions we hear most. Still stuck? Our team replies in minutes, not days.',
    icon: 'lucideCircleHelp',
    gradient: 'from-blue-500 via-cyan-500 to-teal-400',
    faqs: [
      { q: 'How do I track my order?', a: 'Head to Track Order and enter your order number, or open Account \u2192 Orders for live status on every purchase.' },
      { q: 'What is your return policy?', a: 'Returns are free within 30 days of delivery. Items should be in original condition. See the Returns page for the full details.' },
      { q: 'Which payment methods do you accept?', a: 'All major cards, Apple Pay, Google Pay, and Nova gift cards. Your details are encrypted end-to-end.' },
      { q: 'Do you ship internationally?', a: 'Yes — we ship to 60+ countries with carbon-neutral delivery and transparent duties at checkout.' },
      { q: 'How do I change my details?', a: 'Open Account \u2192 Settings to update your profile, password, appearance, and notification preferences.' },
    ],
    cta: { title: 'Still need a hand?', body: 'Reach our support team any time — real humans, fast replies.', label: 'Track an order', link: '/track-order' },
  },
  shipping: {
    eyebrow: 'Shipping',
    title: 'Fast, tracked, carbon-neutral',
    lead: 'Free standard shipping on orders over $50, with real-time tracking from our door to yours.',
    icon: 'lucideTruck',
    gradient: 'from-indigo-500 via-blue-500 to-sky-400',
    sections: [
      {
        heading: 'Delivery options',
        bullets: [
          'Standard (3\u20135 business days) — free over $50',
          'Express (1\u20132 business days) — $12 flat',
          'Same-day in select metro areas',
          'Every parcel is fully tracked and insured',
        ],
      },
      {
        heading: 'Order processing',
        body: 'Orders placed before 2pm local time ship the same day. You\u2019ll receive a tracking link the moment your parcel leaves our warehouse.',
      },
    ],
    cta: { title: 'Track your parcel', body: 'Already ordered? Follow it in real time.', label: 'Track order', link: '/track-order' },
  },
  returns: {
    eyebrow: 'Returns',
    title: 'Changed your mind? No problem',
    lead: 'Enjoy 30 days to decide. Returns are free, easy, and refunded to your original payment method.',
    icon: 'lucideRotateCcw',
    gradient: 'from-orange-500 via-rose-500 to-pink-500',
    sections: [
      {
        heading: 'How returns work',
        bullets: [
          'Start a return from Account \u2192 Orders',
          'Print the prepaid, carbon-neutral label',
          'Drop it at any partner location',
          'Refunds land within 3\u20135 business days',
        ],
      },
      {
        heading: 'Good to know',
        body: 'Items should be returned in their original condition and packaging. Personalised or final-sale items may be excluded — we\u2019ll always flag this before you buy.',
      },
    ],
  },
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    lead: 'Your trust matters. This policy explains what we collect, why, and the control you have over your data.',
    icon: 'lucideShieldCheck',
    gradient: 'from-slate-500 via-gray-500 to-zinc-500',
    sections: [
      { heading: 'Information we collect', body: 'We collect the details you provide at checkout and account creation, plus limited usage data that helps us improve the experience.' },
      { heading: 'How we use it', body: 'To fulfil orders, provide support, prevent fraud, and — only with your consent — send you updates you actually want.' },
      { heading: 'Your rights', bullets: ['Access and download your data any time', 'Request deletion of your account', 'Opt out of marketing in one click', 'Control cookies from the banner'] },
      { heading: 'Contact', body: 'Questions about privacy? Email privacy@nova.example and our data team will respond promptly.' },
    ],
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    lead: 'The ground rules for using Nova. By shopping with us you agree to these terms.',
    icon: 'lucideFileText',
    gradient: 'from-zinc-500 via-slate-500 to-gray-600',
    sections: [
      { heading: 'Using our service', body: 'You agree to use Nova lawfully and to keep your account credentials secure. You\u2019re responsible for activity under your account.' },
      { heading: 'Orders and pricing', body: 'All orders are subject to availability and confirmation. We reserve the right to correct pricing errors before dispatch.' },
      { heading: 'Liability', body: 'Nova is provided \u201Cas is.\u201D To the extent permitted by law, we are not liable for indirect or consequential losses.' },
      { heading: 'Changes', body: 'We may update these terms occasionally. Material changes will be communicated via email or an in-app notice.' },
    ],
  },
  cookies: {
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    lead: 'How and why we use cookies to keep Nova running smoothly and to remember your preferences.',
    icon: 'lucideFileText',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    sections: [
      { heading: 'What cookies do', body: 'Cookies help us keep you signed in, remember your cart, and understand which features people love most.' },
      { heading: 'Types we use', bullets: ['Essential — required for the site to work', 'Preferences — remember theme and settings', 'Analytics — anonymous usage insights', 'Marketing — only with your consent'] },
      { heading: 'Managing cookies', body: 'You can accept or reject non-essential cookies from the banner, or clear them any time in your browser settings.' },
    ],
  },
};
