// Single source of truth for business facts, pricing, portfolio and FAQ.
// Edit here, then run `node scripts/build.mjs` to regenerate /site.
// v3 (2026-10-28): contractors and trades only; three products. Spec: docs/IRONWEB-V3-SPEC.md.

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

// Public calendar for consultation calls (not a secret). Embedded on /demo/ and /contact/; its host is
// allowed in frame-src in netlify.toml.
export const BOOKING = {
  url: 'https://api.leadconnectorhq.com/widget/bookings/ironweb-contractor-demo',
  embed: true,
};

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

// The main action everywhere: request the free audit (Contact page form). The demo is the secondary action.
export const AUDIT_HREF = '/contact/#audit';
export const AUDIT_CTA = 'Request your free audit';
export const DEMO_HREF = '/demo/';
export const DEMO_CTA = 'See how the system works';

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Portfolio', href: '/portfolio/' },
  {
    label: 'Services',
    children: [
      { label: 'IW Build', href: '/build/', note: 'Websites, $600 + $97/month' },
      { label: 'IW Grow', href: '/grow/', note: 'Social, ads and leads, $597/month' },
      { label: 'IW Operate', href: '/operate/', note: 'Automations, $297/month' },
    ],
  },
  { label: 'Demo', href: '/demo/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

// The only prices on the site. Always say one-time vs monthly.
export const PRODUCTS = [
  {
    key: 'build',
    name: 'IW Build',
    href: '/build/',
    what: 'Websites, landing pages, funnels and SEO foundations.',
    line: 'A site that makes your business look as good as your work, and makes calling you the obvious next step.',
    price: '$97',
    cadence: 'per month',
    extra: '+ $600 one-time build',
    includes: ['Website built for your trade and your towns', 'Hosting, updates and maintenance, plus a monthly check-in', 'Instant text reply to every website inquiry', 'Landing pages and funnels when you run a campaign'],
  },
  {
    key: 'grow',
    name: 'IW Grow',
    href: '/grow/',
    what: 'Social media management, paid ads, lead generation and content.',
    line: 'Stay in front of homeowners in your area without writing posts at night or guessing at ads.',
    price: '$597',
    cadence: 'per month',
    extra: '+ ad spend, paid to the ad platform',
    includes: ['Three original posts a week, written and scheduled', 'Paid ad campaigns set up and managed', 'Lead forms that hand off to instant follow-up', 'Nothing posts without your approval'],
  },
  {
    key: 'operate',
    name: 'IW Operate',
    href: '/operate/',
    what: 'Missed-call text-back, instant lead response, AI reception, review requests, CRM and follow-up.',
    line: 'The front office runs while you are on the job: calls answered, leads followed up, reviews requested.',
    price: '$297',
    cadence: 'per month',
    extra: 'Set up for you, preloaded for contractors',
    includes: ['Missed-call text-back', 'Instant reply to new leads', 'AI receptionist that answers and takes details', 'Review requests after every job', 'A simple pipeline and follow-up for every lead'],
  },
];

// What the free audit checks (matches the report Colin runs).
export const AUDIT_POINTS = [
  { h: 'Google Business Profile', p: 'Is it complete, verified and pointing to the right website and phone number?' },
  { h: 'Listings', p: 'Your name, address and phone checked across about 30 directories. Mismatches cost you calls.' },
  { h: 'Reviews', p: 'How many you have, how recent they are, and whether anyone is replying to them.' },
  { h: 'Website', p: 'Is there one, is it linked, does it work on a phone, and is it fast enough for Google?' },
  { h: 'Local map ranking', p: 'Where you show up on Google Maps for your trade across your service area, next to the competitors beating you.' },
  { h: 'Calls and texts', p: 'Can customers text you, and what happens when you miss a call?' },
];

export const PROCESS = [
  { name: 'Audit', text: 'A free report on how your business shows up online and where calls and leads slip through.' },
  { name: 'Plan', text: 'We walk through it together and pick the fixes worth doing first. No package you don\'t need.' },
  { name: 'Build', text: 'Colin sets it up: the website, the automations, the ads. You keep working.' },
  { name: 'Run', text: 'We keep it running: hosting, updates, maintenance and a monthly check-in. Something breaks, call Colin.' },
];

// Ongoing partnership: what every client gets after launch (Colin, 2026-10-29).
export const CARE = [
  { h: 'Hosting', p: 'Your site stays online, fast and secure. Nothing for you to renew or patch.' },
  { h: 'Updates and maintenance', p: 'Changes to your site, your automations and your messages, handled as your business changes.' },
  { h: 'A monthly check-in', p: 'Once a month we look at what came in and what to adjust, together.' },
  { h: 'On call', p: 'Something stops working? Call Colin and it gets fixed. No ticket queue.' },
];

// Typical agency vs. IronWeb. Every row must stay literally true.
export const COMPARE = [
  { them: 'Accounts set up in their name', us: 'You own everything: domain, phone number and contacts' },
  { them: 'Leaving means starting over', us: 'Part ways any time and take it all with you' },
  { them: 'Launch it and move on', us: 'Hosting, updates, maintenance and a monthly check-in' },
  { them: 'Something breaks, open a ticket', us: 'Something breaks, call Colin' },
  { them: 'An account manager you never met', us: 'You talk to the person doing the work' },
  { them: '"Call for pricing"', us: 'Prices published, one-time and monthly spelled out' },
  { them: 'They take over your customer conversations', us: 'You stay in control of your customers and jobs' },
];

export const HOME_FAQ = [
  { q: 'What does the free audit cost?', a: 'Nothing. You get a report on your Google profile, listings, reviews, website and local map ranking, and Colin walks you through what to fix first. No obligation.' },
  { q: "I don't have time to learn new software.", a: 'You don\'t have to learn much. Colin sets everything up preloaded for contractors and walks you through it. Most of it runs without you touching it.' },
  { q: 'What if it texts the wrong thing?', a: "It won't say anything you haven't approved. You sign off on every message before it goes live, and you can change it any time." },
  { q: "I'm too small for this.", a: "That's who it's for. If you're the one answering the phone, doing the work and sending the invoices, this is the help you don't have time to hire." },
  { q: 'What happens if I want to leave?', a: 'You take everything with you: your domain, your phone number and an export of your contacts. It was always yours. No contracts that hold you hostage.' },
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
    key: 'heroux',
    name: 'Homes by Heroux',
    url: 'https://homesbyheroux.com/',
    host: 'homesbyheroux.com',
    kind: 'Drywall, paint and remodeling',
    desc: 'A site for a Somerset drywall and interior painting specialist serving Bristol County and the Providence area. Services and why-us up front, a project gallery, and call and free-quote buttons on every screen.',
  },
  {
    // Portfolio page only: everywhere else stays contractor sites (Colin, 2026-10-28).
    key: 'oceangroove',
    name: 'Ocean Groove',
    url: 'https://oceangroovetheband.com/',
    host: 'oceangroovetheband.com',
    kind: 'Seven-piece cover band',
    desc: 'A site for a Swansea funk, fusion and classic rock band. Set list, upcoming shows, gallery and a booking path for venues, weddings and private events.',
    trade: false,
  },
];

// Real testimonials only. Entries with `placeholder: true` never render on the public site; set
// SHOW_PLACEHOLDERS=1 when building to preview the layout. To publish one: fill it in, remove `placeholder`.
export const TESTIMONIALS = [
  {
    placeholder: true,
    quote: 'Client quote goes here, in their own words.',
    name: 'Client name',
    business: 'Business name',
    result: '',
  },
];
// About page photo. Leave src empty and the photo block isn't rendered.
export const HEADSHOT = { src: '', alt: 'Colin Sullivan, founder of IronWeb Digital' };

// Trades offered on the audit and preview forms (also the server-side allow-list).
export const TRADES = [
  'Roofing',
  'Painting',
  'Drywall',
  'Carpentry',
  'Landscaping',
  'Concrete and site work',
  'Plumbing',
  'HVAC',
  'Electrical',
  'General contracting',
  'Property maintenance',
  'Other trade',
];

// ---------- Website demo (IW Build page) ----------
// An on-page, clearly illustrative walkthrough of what a customer experiences on an IronWeb website.
// The businesses are fictional; the inquiry is simulated in the browser and sends nothing.
export const DEMO_JOURNEY = [
  { key: 'first', name: 'First impression', text: 'In a few seconds the visitor knows who you are, what you do and where you work, with one obvious next step.' },
  { key: 'proof', name: 'Builds confidence', text: 'Services, examples of the work and how the job runs, laid out so a careful homeowner finds answers without calling.' },
  { key: 'inquiry', name: 'Easy inquiry', text: 'A short form and a tap-to-call button, placed where people decide. Try the form in the example site.' },
  { key: 'after', name: 'After they reach out', text: 'The inquiry lands with you with the details attached, and the customer gets a text back right away.' },
];

// accent: mirrored in site.css (.dx-site[data-industry]) because the CSP forbids inline styles.
// Keys are kept from the original three examples so the CSS accents still apply.
export const DEMO_INDUSTRIES = [
  {
    key: 'trades',
    tab: 'Roofing',
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
    tab: 'Landscaping',
    biz: 'Example Landscape Co.',
    host: 'examplelandscape.co',
    accent: '#2E6FDB',
    tagline: 'Lawns, plantings and hardscape',
    headline: 'A yard you are proud to come home to.',
    sub: 'Weekly lawn care, spring and fall cleanups, plantings and patios across your area.',
    primary: 'Get a quote',
    secondary: 'Call now',
    badges: ['Fully insured', 'Weekly routes', 'Free quotes'],
    proofTitle: 'What we do',
    proof: [
      { h: 'Lawn care', p: 'Mowing, edging and fertilizing on a set weekly schedule.' },
      { h: 'Cleanups', p: 'Spring and fall cleanups, mulch and bed edging.' },
      { h: 'Hardscape', p: 'Patios, walkways and retaining walls, built to last.' },
    ],
    galleryTitle: 'Recent projects',
    steps: ['Quote request', 'Site visit', 'Written quote', 'Work scheduled'],
    formTitle: 'Get a free quote',
    formField: 'What do you need?',
    formOptions: ['Weekly lawn care', 'Cleanup', 'Patio or walkway', 'Not sure'],
    notify: 'New quote request: spring cleanup and mulch, front and back.',
    reply: 'Thanks for contacting Example Landscape Co. We got your request and will reach out to set up a visit.',
  },
  {
    key: 'local',
    tab: 'Painting',
    biz: 'Example Painting Co.',
    host: 'examplepainting.co',
    accent: '#0B7563',
    tagline: 'Interior and exterior painting',
    headline: 'Clean lines, clean job sites, on schedule.',
    sub: 'Interior and exterior painting for homes and rentals, with the prep done right.',
    primary: 'Request an estimate',
    secondary: 'See our work',
    badges: ['Licensed and insured', 'Free estimates', 'Clean-up included'],
    proofTitle: 'What we do',
    proof: [
      { h: 'Interiors', p: 'Walls, ceilings and trim, with furniture and floors protected.' },
      { h: 'Exteriors', p: 'Scraping, priming and two coats, built for New England weather.' },
      { h: 'Rentals', p: 'Fast turnovers between tenants for landlords and managers.' },
    ],
    galleryTitle: 'Before and after',
    steps: ['Estimate request', 'Walkthrough', 'Written quote', 'Job scheduled'],
    formTitle: 'Request a free estimate',
    formField: 'Project type',
    formOptions: ['Interior', 'Exterior', 'Rental turnover', 'Not sure'],
    notify: 'New estimate request: exterior repaint, colonial, this summer.',
    reply: 'Thanks for reaching out to Example Painting Co. We got your request and will call you to set up an estimate.',
  },
];

// Operate building blocks (IW Operate page).
export const AUTOMATIONS = [
  {
    key: 'missed-call',
    name: 'Missed-call text-back',
    icon: 'phone',
    problem: 'You can\'t answer mid-job, and a caller who reaches voicemail may just call the next contractor.',
    does: 'When a call goes unanswered, the caller gets a text right away, so the conversation keeps going until you can call back.',
  },
  {
    key: 'speed-to-lead',
    name: 'Instant lead response',
    icon: 'message',
    problem: 'Website and ad inquiries sit until you get back to the truck.',
    does: 'The customer gets an immediate reply and you get the details, so you can follow up while they are still deciding.',
  },
  {
    key: 'reception',
    name: 'AI receptionist',
    icon: 'user',
    problem: 'Calls come in while you are on a ladder, on a roof or with a customer.',
    does: 'An AI receptionist answers, gathers the project details and captures the callback, so the job doesn\'t go to whoever picked up first.',
  },
  {
    key: 'reviews',
    name: 'Review requests',
    icon: 'star',
    problem: 'Happy customers rarely leave a review unless someone asks at the right moment.',
    does: 'A short, polite review request goes out after the job closes, without anyone having to remember.',
  },
  {
    key: 'crm',
    name: 'CRM and follow-up',
    icon: 'calendar',
    problem: 'Leads live in your texts, your voicemail and your memory, and the "not yet" ones get forgotten.',
    does: 'Every lead lands on one simple pipeline, and scheduled follow-up keeps the "maybe next spring" jobs warm.',
  },
];
