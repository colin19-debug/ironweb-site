// Single source of truth for business facts, pricing, portfolio and FAQ.
// Edit here, then run `node scripts/build.mjs` to regenerate /site.

export const SITE = {
  name: 'IronWeb Digital',
  // Registered DBA name (A2P brand). Used wherever the legal operator or SMS sender must be named.
  legalName: 'Ironweb Digital Growth',
  domain: 'https://ironwebdigital.com',
  email: 'colin@ironwebdigital.com',
  phoneDisplay: '(774) 486-7776',
  phoneTel: '+17744867776',
  city: 'Swansea',
  region: 'MA',
  regionName: 'Southeastern Massachusetts',
  founder: 'Colin Sullivan',
};

// Public booking page for discovery calls (the business platform's calendar link).
// Not supplied yet. While empty, every "Book a Call" lands on /contact/#book, which
// says plainly that online booking isn't connected and offers phone, email and the form.
// Paste the public calendar URL here (it is not a secret), rebuild, and add its host to
// frame-src in netlify.toml.
export const BOOKING = {
  url: '',
  embed: true,
};

// Optional hero video. Leave `sources` empty to use the still only.
// Example: sources: [{ src: '/assets/video/hero-1280.webm', type: 'video/webm' },
//                    { src: '/assets/video/hero-1280.mp4', type: 'video/mp4' }]
// Animated hero (2026-10-12): brand_assets/Animatedcircuit.mp4, re-encoded without audio by ffmpeg
// (see README). Phones get a chip-centred crop. Posters are the video's first frame, so the swap from
// still to video is seamless. List MP4 first (plays everywhere); WebM is the smaller fallback.
export const HERO_VIDEO = {
  sources: [
    { src: '/assets/video/hero-circuit-mobile-640.mp4', type: 'video/mp4', media: '(max-width: 720px)' },
    { src: '/assets/video/hero-circuit-mobile-640.webm', type: 'video/webm', media: '(max-width: 720px)' },
    { src: '/assets/video/hero-circuit-1424.mp4', type: 'video/mp4' },
    { src: '/assets/video/hero-circuit-1424.webm', type: 'video/webm' },
  ],
  poster: '/assets/img/hero-circuit-poster-1424.jpg',
  posterMobile: '/assets/img/hero-circuit-poster-mobile-640.jpg',
};

// Website-first navigation (2026-10-10). Services lists Websites first; Automations and Bundles
// are the optional extension; Growth (content/ads) stays available but secondary.
export const NAV = [
  { label: 'Portfolio', href: '/portfolio/' },
  {
    label: 'Services',
    href: '/services/',
    children: [
      { label: 'All services', href: '/services/', note: 'How it all fits together' },
      { label: 'Websites', href: '/build/', note: 'From $600 one-time' },
      { label: 'Automations', href: '/automations/', note: 'Start at $97/month' },
      { label: 'Bundles', href: '/automations/bundles/', note: 'Automation packages' },
      { label: 'Growth', href: '/growth/', note: 'Content and ads' },
      { label: 'Contractor demo', href: '/contractor-demo/', note: 'Try the system yourself' },
    ],
  },
  { label: 'About', href: '/about/' },
];

// Pricing. `cadence` makes one-time vs recurring explicit everywhere a price is shown.
export const PRICES = {
  compact: { name: 'Compact Build', amount: '$600', cadence: 'one-time', monthly: null },
  build: { name: 'IronWeb Build', amount: '$1,500', cadence: 'setup', monthly: '$100/month' },
  addon: { name: 'Landing page or simple funnel', amount: '$97', cadence: 'one-time, each', monthly: null },
  growth: { name: 'IronWeb Growth', amount: '$597/month', cadence: 'monthly', monthly: null },
  adsOne: { name: 'Paid Ads, one platform', amount: '$750/month', cadence: 'plus ad spend', monthly: null },
  adsMore: { name: 'Paid Ads, expanded', amount: 'From $1,000/month', cadence: 'plus ad spend', monthly: null },
  operate: { name: 'IronWeb Operate', amount: '$750', cadence: 'setup', monthly: '$297/month' },
  customOperate: { name: 'Custom Operate', amount: 'Up to $1,000', cadence: 'setup', monthly: '$350/month' },
  // Starting price for individual automations, supplied by Colin on 2026-10-10. Per-automation prices are
  // not confirmed, so the site only states this starting point; each quote lists the actual price.
  automationsFrom: '$97/month',
  // ---- Offer architecture (Colin, 2026-10-16) ----
  // The wedge: each automation stage is $97/month with NO setup fee. Setup fees apply to bundles only.
  stage: '$97/month',
  bundleSetup: '$497',
  bundleSetupWaiver: 'waived with 6 months prepaid',
  contractorBundle: '$297/month',
  realEstateBundle: '$397/month',
  website: '$600', // one-time standalone handoff; "$600 value, included" with either bundle
};

// The automation ladder: a journey, not a menu. Start where you are, add as you grow.
export const LADDER = [
  {
    key: 'get-found',
    name: 'Get Found',
    outcome: 'Show up on Google and build the review count that drives local search.',
    items: [
      'Google Business Profile set up and optimized',
      'Yelp claimed and cleaned up',
      'Automated review requests after every job',
      'Automated responses to new reviews',
      'Monthly ranking report',
    ],
    note: 'You see it working every month.',
  },
  {
    key: 'never-miss',
    name: 'Never Miss an Opportunity',
    outcome: 'Every call and inquiry gets an answer, even when you can\'t pick up.',
    items: [
      'Missed-call text-back in under a minute',
      'Instant replies to website form inquiries',
      'Scheduled follow-up for the "not yet" leads',
    ],
    note: 'The lead hears from you before they call the next name.',
  },
  {
    key: 'track-everything',
    name: 'Track Everything',
    outcome: 'Know where every customer stands, without a spreadsheet.',
    items: [
      'A simple customer pipeline',
      'Stages that update automatically as leads move',
      'Nothing slips through the cracks',
    ],
    note: 'One place to see every open opportunity.',
  },
];

// Bundles: the express option for buyers who want it all.
export const BUNDLES = [
  {
    key: 'contractor',
    name: 'Contractor Bundle',
    price: '$297/month',
    pitch: 'We automate your customer communications and follow-ups so you spend less time managing your business and more time running it.',
    functions: [
      'Missed-call text-back',
      'Speed to lead from website forms',
      'Simple customer pipeline with automated stage changes',
      'Estimate follow-up sequence',
      'Review request after job completion',
    ],
    goals: ['Capture organized customers', 'Reduce repetitive admin work', 'Protect existing revenue and reputation'],
  },
  {
    key: 'real-estate',
    name: 'Real Estate Bundle',
    price: '$397/month',
    pitch: 'We automate your lead responses, qualifications, and follow-ups so you spend less time chasing leads and managing your CRM and more time building relationships and closing deals.',
    functions: [
      'Speed to lead',
      'AI lead qualification: needs, timeline, location, budget',
      'Appointment booking: buyer consultations, listing appointments, showings',
      'CRM automation: organizes leads, updates contact info, moves opportunities through the pipeline',
      'Long-term nurture campaigns',
      'Database reactivation',
    ],
    goals: ['Capture and qualify leads', 'Reduce repetitive admin work', 'Convert more existing opportunities'],
  },
];

// Objection-handling FAQ (homepage). Four questions max.
export const OBJECTION_FAQ = [
  { q: "I don't have time to learn new software.", a: "You don't have to. Colin sets it up and runs it. You keep doing the work; the system handles the follow-up." },
  { q: 'What if it texts the wrong thing?', a: "It won't say anything you haven't approved. You sign off on every message before it goes live, and you can change it any time. You're always in control." },
  { q: "I'm too small for this.", a: "That's exactly who it's for. If you're the one answering the phone, doing the work and sending the invoices, this is the help you don't have time to hire." },
  { q: 'What happens if I cancel?', a: 'You keep your data: your contacts and your customer list go with you. No contracts that hold you hostage.' },
];

export const SERVICES = [
  {
    key: 'build',
    name: 'Build',
    href: '/build/',
    line: 'A website that explains what you do and makes the next step obvious.',
    priceLabel: 'From $600 one-time',
    priceNote: 'or $1,500 setup + $100/month managed',
  },
  {
    key: 'growth',
    name: 'Growth',
    href: '/growth/',
    line: 'Three original posts a week, written, scheduled and adapted to your channels.',
    priceLabel: '$597/month',
    priceNote: 'Paid ads from $750/month + ad spend',
  },
  {
    key: 'operate',
    name: 'Automations',
    href: '/automations/',
    line: 'Missed-call text-back, fast replies and follow-up that keeps running.',
    priceLabel: '$750 setup + $297/month',
    priceNote: 'Messaging and usage billed separately',
  },
];

export const WORK = [
  {
    key: 'tmr',
    name: 'TMR Construction',
    url: 'https://tmrconstructioncorp.com/',
    host: 'tmrconstructioncorp.com',
    kind: 'Concrete and site work contractor',
    desc: 'A bid-focused site for a union, DBE-certified concrete and curb contractor in Bristol County. Credentials up front, services laid out, and a request-a-bid form beside the headline.',
  },
  {
    key: 'allphaze',
    name: 'All Phaze Property Solutions',
    url: 'https://allphazepropertysolutions.com/',
    host: 'allphazepropertysolutions.com',
    kind: 'Property maintenance and repairs',
    desc: 'A service site for a Fall River property maintenance company serving landlords, investors and homeowners. Turnovers, painting, repairs and cleanouts, with call and estimate buttons on every screen.',
  },
  {
    // Live on Netlify now; switch url/host to https://www.homesbyheroux.com/ once his domain is moved over.
    key: 'heroux',
    name: 'Homes by Heroux',
    url: 'https://homes-by-heroux.netlify.app/',
    host: 'homesbyheroux.com', // display only; keeps "Netlify" out of public copy
    kind: 'Drywall, paint and remodeling',
    desc: 'A site for a Somerset drywall and interior painting specialist serving Bristol County and the Providence area. Services and why-us up front, a project gallery, and call and free-quote buttons on every screen.',
  },
  {
    // Portfolio page only (homepage shows the business clients). Colin's pick, 2026-10-11.
    key: 'oceangroove',
    name: 'Ocean Groove',
    url: 'https://oceangroovetheband.com/',
    host: 'oceangroovetheband.com',
    kind: 'Seven-piece cover band',
    desc: 'A site for a Swansea funk, fusion and classic rock band. Set list, upcoming shows, gallery and a booking path for venues, weddings and private events.',
    homepage: false,
  },
];

// ---------- Speed-to-lead homepage (2026-10-11) ----------
// Every bracketed value below is a placeholder Colin must fill before deploying.
export const PROOF_THIRD_CLIENT = 'Homes by Heroux';
// Real testimonials only. Leave `quote` empty until a client approves wording; the homepage block
// stays hidden until at least one quote is filled in.
// Testimonials / results (2026-10-16). One placeholder entry shows the shape. Entries with `placeholder: true`
// never render on the public site; set SHOW_PLACEHOLDERS=1 when building to preview the layout.
// To publish a real one: fill quote/name/business (and result if you have a real number), remove `placeholder`.
export const TESTIMONIALS = [
  {
    placeholder: true,
    quote: 'Client quote goes here, in their own words.',
    name: 'Client name',
    business: 'Business name',
    result: 'X missed calls caught in the first month',
  },
];
// 60-second screen recording of the real Saltmarsh demo (lead comes in, gets a text).
// Put the files in site/assets/video/ and fill these in; while `src` is empty a labeled slot shows instead.
export const DEMO_VIDEO = {
  src: '', // e.g. '/assets/video/saltmarsh-speed-to-lead.mp4'
  poster: '', // e.g. '/assets/img/saltmarsh-demo-poster.jpg'
};
// Headshot for the "Text me" section. Leave empty to show a labeled slot.
export const HEADSHOT = { src: '', alt: 'Colin Sullivan, founder of IronWeb Digital' };
export const SPEED_BUSINESS_TYPES = ['Contractor / trade', 'Real estate', 'Other'];

// ---------- Interactive demo (2026-10-10) ----------
// "Explore the demo" = an on-page, clearly illustrative walkthrough of what a customer experiences.
// The businesses are fictional examples; the inquiry is simulated in the browser and sends nothing.
export const DEMO_JOURNEY = [
  { key: 'first', name: 'First impression', text: 'In a few seconds the visitor knows who you are, what you do and where you work, with one obvious next step.' },
  { key: 'proof', name: 'Builds confidence', text: 'Services, examples of the work and how the job runs, laid out so a careful buyer finds answers without calling.' },
  { key: 'inquiry', name: 'Easy inquiry', text: 'A short form and a tap-to-call button, placed where people decide. Try the form in the example site.' },
  { key: 'after', name: 'After they reach out', text: 'The inquiry lands with you with the details attached. Automations can reply instantly if you add them later.' },
];

// accent: mirrored in site.css (.dx-site[data-industry]) because the CSP forbids inline styles.
export const DEMO_INDUSTRIES = [
  {
    key: 'trades',
    tab: 'Trades',
    biz: 'Example Roofing Co.',
    host: 'exampleroofing.co',
    accent: '#B94A12',
    tagline: 'Roofing and exteriors',
    headline: 'Roof replacement and repair, done right the first time.',
    sub: 'Residential roofing, gutters and storm repairs across your service area. Free estimates.',
    primary: 'Request an estimate',
    secondary: 'Call now',
    badges: ['Licensed and insured', 'Free estimates', 'Local crew'],
    proofTitle: 'What we do',
    proof: [
      { h: 'Roof replacement', p: 'Full tear-off and install, with a clear written estimate.' },
      { h: 'Repairs and leaks', p: 'Fast fixes for missing shingles, flashing and storm damage.' },
      { h: 'Gutters', p: 'Seamless gutters and guards, matched to your trim.' },
    ],
    galleryTitle: 'Recent projects',
    steps: ['Estimate on site', 'Written quote', 'Scheduled install', 'Final walkthrough'],
    formTitle: 'Request a free estimate',
    formField: 'What do you need?',
    formOptions: ['Roof replacement', 'Repair or leak', 'Gutters', 'Not sure'],
    notify: 'New estimate request: roof replacement, 3-bed colonial.',
    reply: 'Thanks for reaching out to Example Roofing Co. We got your request and will call you to set up an estimate.',
  },
  {
    key: 'realestate',
    tab: 'Real estate',
    biz: 'Example Realty Group',
    host: 'examplerealty.co',
    accent: '#2E6FDB',
    tagline: 'Buying and selling homes',
    headline: 'Local agents who know the neighborhoods.',
    sub: 'Buy, sell or find out what your home is worth, with an agent who answers.',
    primary: 'Get a home valuation',
    secondary: 'Talk to an agent',
    badges: ['Buyer and seller representation', 'Local market reports', 'Same-day replies'],
    proofTitle: 'How we help',
    proof: [
      { h: 'Selling', p: 'Pricing, staging advice, marketing and negotiation, step by step.' },
      { h: 'Buying', p: 'Showings, offers and inspections handled without the runaround.' },
      { h: 'Home valuation', p: 'A local, agent-prepared estimate of what your home could sell for.' },
    ],
    galleryTitle: 'Featured listings',
    steps: ['Valuation request', 'Agent call', 'Listing plan', 'On the market'],
    formTitle: 'What is my home worth?',
    formField: 'I am looking to',
    formOptions: ['Sell', 'Buy', 'Buy and sell', 'Just curious'],
    notify: 'New valuation request: looking to sell this spring.',
    reply: 'Thanks for contacting Example Realty Group. An agent will reach out shortly about your home valuation.',
  },
  {
    key: 'local',
    tab: 'Local services',
    biz: 'Example Cleaning Co.',
    host: 'examplecleaning.co',
    accent: '#0B7563',
    tagline: 'Home and office cleaning',
    headline: 'A cleaner home without the back-and-forth.',
    sub: 'Recurring and one-time cleaning with clear pricing and simple booking.',
    primary: 'Book a cleaning',
    secondary: 'See pricing',
    badges: ['Background-checked staff', 'Flexible scheduling', 'Supplies included'],
    proofTitle: 'Services',
    proof: [
      { h: 'Recurring cleaning', p: 'Weekly or every other week, same team each visit.' },
      { h: 'Deep cleaning', p: 'Top-to-bottom cleaning for move-ins, move-outs and seasons.' },
      { h: 'Offices', p: 'After-hours cleaning that fits your schedule.' },
    ],
    galleryTitle: 'Before and after',
    steps: ['Pick a service', 'Choose a time', 'Confirmation', 'Clean home'],
    formTitle: 'Book a cleaning',
    formField: 'Service',
    formOptions: ['Recurring cleaning', 'Deep cleaning', 'Office cleaning', 'Not sure'],
    notify: 'New booking request: deep clean, Saturday morning.',
    reply: 'Thanks for booking with Example Cleaning Co. We will confirm your time shortly.',
  },
];

// What makes an IronWeb website valuable (home section 3).
export const VALUE_POINTS = [
  { h: 'Looks established from the first screen', p: 'Distinctive, professional design that makes your business look as capable as it is, not like a template with your logo on it.' },
  { h: 'Works on the phone in their hand', p: 'Layouts, buttons and forms designed for mobile first, so the site is easy to use wherever a customer finds you.' },
  { h: 'Says what you do, plainly', p: 'Clear messaging about your services, your area and why you, written so a visitor understands the offer in seconds.' },
  { h: 'Makes the next step obvious', p: 'Tap-to-call, short forms and booking placed where people decide, so reaching you takes one move, not five.' },
];

// The free homepage preview (formerly "free demo", renamed 2026-10-10 so it isn't confused with the
// interactive demo). Journey: request → Colin follows up personally → preview on a private link → you decide.
export const PREVIEW_STEPS = [
  { name: 'Tell us about your business.', text: 'Your name and email are enough to start. Add more detail if you like.' },
  { name: 'Colin follows up personally.', text: 'A conversation about what you need. If it is a fit, Colin creates a homepage preview for your business.' },
  { name: 'You decide whether to move forward.', text: 'Review the preview on a private link. If you like the direction, you get a clear quote.' },
];

export const PROCESS = [
  { name: 'Talk about your website', text: 'Send a few details or book a call. Colin follows up personally to learn about your business and what the site needs to do.' },
  { name: 'Free homepage preview', text: 'When it is a fit, a personalized first-stage homepage on a private link, so you can see the direction before you commit.' },
  { name: 'Build and revisions', text: 'Once you go ahead, the full site, then two consolidated rounds of revisions and a final polish pass.' },
  { name: 'Launch', text: 'Domain, forms and handoff checked, then live. Managed sites keep an hour of edits each month.' },
];

export const PREVIEW_FAQ = [
  {
    q: 'What is the free homepage preview?',
    a: 'A personalized first-stage homepage for your business, shared through a private link. It shows the direction, layout and message so you can see what your new site could look like before deciding to move forward. There is no payment or commitment to request one.',
  },
  {
    q: 'What happens after I get in touch?',
    a: 'Colin follows up personally, by email or phone, to learn about your business and what you need. If it is a fit, he creates your homepage preview and shares the link. If you want to go ahead, you get a clear quote.',
  },
  {
    q: 'Do I need to book a call first?',
    a: 'No. You can send a few details without scheduling anything. If you would rather talk it through, you can book a call, but it is optional.',
  },
  {
    q: 'Is the interactive demo on the homepage a real business?',
    a: 'No. The businesses in the demo are illustrative examples, and the demo inquiry is simulated in your browser. For real IronWeb websites, see the Work page.',
  },
];

// ---------- Automations (2026-10-10) ----------
// status: 'ready' = confirmed and deliverable now (the four confirmed Operate automations);
//         'scoped' = available to scope per business, not a confirmed standard item;
//         'dev'    = in development, interest only.
export const AUTOMATIONS = [
  {
    key: 'missed-call',
    name: 'Missed-call text-back',
    status: 'ready',
    problem: 'You can\'t answer mid-job or mid-showing, and a caller who reaches voicemail may just call the next business.',
    does: 'When a call goes unanswered, the caller gets a text right away, so the conversation keeps going until you can call back.',
  },
  {
    key: 'speed-to-lead',
    name: 'Instant inquiry response',
    status: 'ready',
    problem: 'Website inquiries sit in an inbox until you get back to your desk.',
    does: 'The customer gets an immediate acknowledgement and you get a notification with their details, so you can follow up while it\'s fresh.',
  },
  {
    key: 'follow-up',
    name: 'Follow-up sequences',
    status: 'ready',
    problem: 'Following up with every "not yet" by hand is repetitive, and it\'s the first thing to slip in a busy week.',
    does: 'Scheduled follow-up messages over the following weeks, so a "maybe next spring" isn\'t forgotten.',
  },
  {
    key: 'reviews',
    name: 'Review requests',
    status: 'ready',
    problem: 'Happy customers rarely leave a review unless someone asks at the right moment.',
    does: 'A short, polite review request goes out after a job closes, without anyone having to remember.',
  },
  {
    key: 'appointments',
    name: 'Appointment admin',
    status: 'scoped',
    problem: 'Confirming, reminding and rescheduling appointments eats into time you could spend selling.',
    does: 'Booking confirmations and reminders tied to your calendar, set up around how you already schedule.',
  },
];

export const BUSINESS_TYPES = [
  'Contractor / home services',
  'Real estate',
  'Restaurant / hospitality',
  'Music / entertainment',
  'Other',
];

export const SERVICE_CHOICES = [
  'Compact Build',
  'Build',
  'Growth',
  'Paid Ads',
  'Automations',
  'Contractor Bundle',
  'Real Estate Bundle',
  'Free homepage preview',
  'Not Sure',
];

export const TIMELINES = ['As soon as possible', 'Within a month', '1–3 months', 'Just exploring'];
export const BUDGETS = ['Under $1,000', '$1,000–$2,500', '$2,500–$5,000', '$5,000+', 'Not sure yet'];
