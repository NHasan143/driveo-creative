/**
 * Copy for the redesigned website (Figma: Driveo Exclusive, "Final design"):
 * the header and footer, the shared sections, the home page, the service page
 * template, For Business and For chauffeurs. Merged into the main dictionary
 * as `site`; the other languages must match this shape.
 */
export const enSite = {
  nav: {
    ourServices: "Our Services",
    forBusiness: "For Business",
    forChauffeurs: "For chauffeurs",
    about: "About",
    contact: "Contact",
    requestQuote: "Request Quote",
    signIn: "Sign In",
    exclusive: "Exclusive",
    allServices: "All services",
    businessMenu: [
      { label: "Corporate accounts", hash: "company-account" },
      { label: "How it works", hash: "how-it-works" },
      { label: "Business benefits", hash: "benefits" },
    ],
    support: "24/7 support",
    contactUs: "Contact Us",
  },
  carousel: {
    previous: "Previous",
    next: "Next",
  },
  bookingBar: {
    label: "Book a chauffeur",
    oneWay: "One Way",
    hourly: "Hourly",
    pickup: "Pickup location",
    pickupPlaceholder: "Enter your pickup location",
    dropoff: "Drop-off location",
    dropoffPlaceholder: "Enter your destination",
    duration: "Duration",
    hours: "{count} hours",
    date: "Pickup date",
    time: "Pickup time",
    submit: "View Options",
  },
  cities: {
    label: "We Are Available In",
  },
  reviews: {
    badge: "Customer reviews",
    lead: "Real journeys.",
    accent: "thoughtful service",
    rating: "4.3/5",
    ratingLabel: "Rated 4.3 out of 5",
    items: [
      {
        highlight: "A smooth, comfortable ride from start to finish.",
        body: "The chauffeur was punctual and professional. The whole journey felt easy and relaxing.",
        name: "David Rossi",
        trip: "Airport transfer",
      },
      {
        highlight: "Professional service, every step of the way.",
        body: "The car was spotless, and the chauffeur made sure we were comfortable throughout the ride.",
        name: "David Rossi",
        trip: "Airport transfer",
      },
      {
        highlight: "A smooth, comfortable ride from start to finish.",
        body: "The chauffeur was punctual and professional. The whole journey felt easy and relaxing.",
        name: "David Rossi",
        trip: "Airport transfer",
      },
    ],
  },
  faq: {
    badge: "FAQ",
    lead: "Questions",
    accent: "About Hourly Rides?",
    clarityTitle: "Need more clarity?",
    clarityBody: "Find quick answers to common questions about booking, pickups, and your journey.",
    contact: "Contact Us",
    items: [
      {
        q: "How do I book a ride?",
        a: "Enter your pickup, date and time in the booking bar, choose your car and add your details. You see the fixed, all-inclusive price before you book.",
      },
      {
        q: "Can I book a ride in advance?",
        a: "Yes. You can schedule your ride ahead of time so your journey is planned before you travel.",
      },
      {
        q: "Where will my chauffeur meet me?",
        a: "At the pickup address you give us. For airport pickups your chauffeur waits inside the terminal, and we track your flight so a delay never leaves you waiting.",
      },
      {
        q: "Can I request a specific vehicle?",
        a: "Yes. Choose Business Class, First Class or the Business Van when you book, and the car is reserved for your journey.",
      },
      {
        q: "What if my plans change?",
        a: "You can change or cancel from the link in your booking email or from your account, up to 24 hours before the journey.",
      },
      {
        q: "Are airport transfers available?",
        a: "Yes, in every city we serve, with live flight tracking, meet and greet inside the terminal and 60 minutes of complimentary waiting.",
      },
    ],
  },
  app: {
    lead: "Your Ride,",
    accent: "Made Simple.",
    body: "Book airport transfers, hourly hire and full-day rides from your phone. Get live chauffeur updates, flight tracking and instant booking confirmation, wherever you are.",
    ios: "Download iOS",
    android: "Download Android",
    androidHelp: "In Chrome, open the browser menu (⋮) and tap “Install app” or “Add to Home screen”.",
    needRide: "Need a ride?",
    onTrack: "Your ride, on track.",
    imageAlt: "A smiling man in an orange jumper checking his phone",
  },
  footer: {
    blurb: "Premium chauffeur service for airport transfers, business travel and full-day hire.",
    followUs: "Follow us:",
    services: "Services",
    areas: "Services Area",
    company: "Company",
    contact: "Contact",
    airport: "Airport Transfers",
    business: "Business Travel",
    hourly: "Hourly Hire",
    fullDay: "Full-Day Hire",
    about: "About Us",
    fleet: "Our Fleet",
    how: "How It Works",
    faq: "FAQ",
    location: "London, United Kingdom",
    copyright: "Copyright © Driveo, All rights reserved",
  },
  home: {
    hero: {
      lead: "Private chauffeur.",
      accent: "Silent luxury.",
      imageAlt: "A chauffeur opening the rear door of a black car for a guest",
    },
    why: {
      badge: "Why choose us",
      lead: "Premium travel,",
      accent: "made effortless.",
      items: [
        {
          title: "Available worldwide",
          copy: "Vetted local chauffeurs in London, Paris, Bulgaria and Dubai, with the same standard in every city.",
          alt: "A black Mercedes-Benz crossing Westminster Bridge at dusk",
        },
        {
          title: "High-end vehicles",
          copy: "Immaculate black Mercedes-Benz cars, from the executive saloon to the seven-seat van.",
          alt: "A black Mercedes-Benz S-Class",
        },
        {
          title: "Safe travels",
          copy: "Licensed, background-checked chauffeurs and live flight tracking on every airport pickup.",
          alt: "A chauffeur opening the car door for a traveller at the airport",
        },
      ],
    },
    services: {
      badge: "Our service",
      lead: "Premium travel,",
      accent: "made effortless.",
      items: [
        {
          label: "Airport Transfers",
          title: "A smoother start to every trip.",
          copy: "Start or end your trip with a smooth, reliable airport pickup. Your chauffeur will be ready to help you travel comfortably.",
          alt: "A family walking through an airport terminal with their luggage",
        },
        {
          label: "Hourly & Full-Day Hire",
          title: "Your day, at your own pace.",
          copy: "Book a chauffeur by the hour or for the day, with the flexibility to make multiple stops along the way.",
          alt: "A couple planning their day on a phone in the back of a car",
        },
        {
          label: "Business Travel",
          title: "Arrive ready for what’s next.",
          copy: "Travel between meetings and appointments in a quiet, comfortable vehicle with a professional chauffeur.",
          alt: "A businessman stepping out of a black car",
        },
      ],
    },
    experience: {
      badge: "The experience",
      lead: "Every Detail,",
      accent: "A Better Journey.",
      items: [
        {
          title: "A thoughtful welcome",
          copy: "From a smooth pickup to a helping hand with your bags, every detail is handled with care, so you can start your journey at ease.",
          alt: "A chauffeur welcoming a guest stepping out of the car",
        },
        {
          title: "A smoother start",
          copy: "Your chauffeur arrives on time, welcomes you aboard, and helps you settle in, so your journey begins without the rush.",
          alt: "A passenger relaxing with headphones in the back seat",
        },
        {
          title: "Every detail, considered",
          copy: "From a clean, comfortable interior to thoughtful onboard touches, enjoy a ride designed to make the time on the road feel effortless.",
          alt: "Water and fresh towels set out on the rear console",
        },
      ],
    },
    advantage: {
      badge: "Our advantage",
      lead: "Premium journeys,",
      accent: "built on trust.",
      imageAlt: "A chauffeur in white gloves holding the car door open at a hotel entrance",
      items: [
        {
          title: "Vetted Chauffeurs",
          copy: "Professional, background-checked chauffeurs who deliver courteous, reliable service.",
        },
        {
          title: "Flight Tracking",
          copy: "We monitor your flight and adjust your airport pickup when your arrival time changes.",
        },
        {
          title: "Clear, Fixed Pricing",
          copy: "Know your fare before you travel, with no unexpected charges.",
        },
        {
          title: "Privacy, Always",
          copy: "Your journey details and personal information are treated with discretion.",
        },
      ],
    },
  },
  service: {
    keyBenefits: "Key Benefits",
    how: { badge: "How it works", lead: "Your time,", accent: "your journey." },
    values: { badge: "Our values", lead: "Our standards,", accent: "Your peace of mind." },
    useCases: {
      badge: "Use cases",
      lead: "One chauffeur,",
      accent: "many possibilities.",
      items: ["Business Meetings", "Shopping Trips", "City Exploration", "Special Events"],
    },
    faqAccent: "About {service}?",
  },
  business: {
    meta: {
      title: "For Business | Driveo Exclusive",
      description:
        "Chauffeur-driven rides for your team, clients and guests: one company account, one monthly invoice and a dedicated account manager.",
    },
    hero: {
      lead: "Executive travel,",
      accent: "Handled entirely for you",
      sub: "Chauffeur-driven rides for your team, clients and guests. One account, one monthly invoice, zero hassle.",
      cta: "Create an account",
      checks: ["Licensed chauffeurs", "Fixed pricing", "24/7 support"],
      imageAlt: "Chauffeurs waiting beside a black car outside an office tower",
    },
    useCases: {
      badge: "Use cases",
      lead: "Rides for",
      accent: "every business need.",
      items: [
        {
          title: "Daily executive rides",
          copy: "A reliable chauffeur for meetings, site visits and busy schedules, so your day runs smoothly.",
          alt: "An executive working on documents in the back of a car",
        },
        {
          title: "Out-of-town trips",
          copy: "Travel to another city in comfort, with space to work, rest or prepare along the way.",
          alt: "A car driving along an open motorway",
        },
        {
          title: "Airport pickups and drop-offs",
          copy: "We track the flight and wait for your guest, so every arrival and departure feels easy.",
          alt: "A chauffeur holding a name sign in the arrivals hall",
        },
        {
          title: "Client and guest arrivals",
          copy: "Make a strong first impression with a chauffeur who welcomes your guests and gets them there on time.",
          alt: "A chauffeur opening the car door for a business guest",
        },
      ],
    },
    how: {
      badge: "How it works",
      lead: "Set up once.",
      accent: "Ride whenever.",
      steps: [
        {
          title: "Create your account.",
          copy: "Register your company and add the people who will travel or book on their behalf.",
        },
        {
          title: "Book a ride.",
          copy: "Pick a vehicle, pickup point, date and time. Get instant confirmation and a fixed price.",
        },
        {
          title: "Pay once a month.",
          copy: "Every ride is gathered into one itemised invoice, so your finance team has a single document to review.",
        },
      ],
    },
    difference: {
      badge: "The Driveo difference",
      lead: "Every journey,",
      accent: "thoughtfully taken care of.",
      intro:
        "From the moment your chauffeur arrives to the final drop-off, every detail is considered to make your journey smooth, comfortable and dependable.",
      items: [
        {
          label: "Airport pickups, made easy",
          text: "Your chauffeur is arranged around your arrival, helping make airport pickups smooth and stress-free.",
        },
        {
          label: "Thoughtful journey planning",
          text: "Pickup times and routes are planned with your itinerary and local travel conditions in mind.",
        },
        {
          label: "Professional communication",
          text: "Enjoy courteous communication and clear updates throughout your journey.",
        },
        {
          label: "Convenient payment options",
          text: "Choose from available payment methods and billing arrangements that suit your travel needs.",
        },
      ],
      cta: "Create an account",
      imageAlt: "A chauffeur opening the rear door of a black saloon",
    },
    benefits: {
      badge: "Business benefits",
      lead: "Built for how",
      accent: "companies travel.",
      items: [
        {
          title: "One account for your whole team",
          copy: "Add employees, assistants and managers under one account for simpler business travel management.",
        },
        {
          title: "Monthly itemised invoice",
          copy: "Keep every journey organised with one clear monthly invoice and detailed ride records.",
        },
        {
          title: "Dedicated account manager",
          copy: "Get personalised assistance from a dedicated contact who understands your company's travel needs.",
        },
        {
          title: "24/7 support",
          copy: "Receive reliable assistance whenever you need help with bookings, updates or travel arrangements.",
        },
        {
          title: "Live chauffeur tracking",
          copy: "Follow your chauffeur's journey in real time and stay informed from pickup to drop-off.",
        },
        {
          title: "Priority booking",
          copy: "Arrange important business journeys with priority assistance and smoother booking coordination.",
        },
      ],
    },
    comparison: {
      badge: "Comparison",
      lead: "Why companies choose",
      accent: "a chauffeur service.",
      feature: "Feature name",
      taxi: "Regular taxi / ride-share",
      driveo: "With Driveo",
      sometimes: "Sometimes",
      yes: "Included",
      no: "Not included",
      rows: [
        { label: "Price confirmed before the ride", taxi: "sometimes" },
        { label: "Flight tracking", taxi: "no" },
        { label: "One monthly invoice", taxi: "no" },
        { label: "Professional, vetted chauffeur", taxi: "no" },
        { label: "Same quality every ride", taxi: "no" },
        { label: "Dedicated account manager", taxi: "no" },
      ],
    },
    enquiry: {
      lead: "Let's set up your",
      accent: "company account.",
      fullName: "Full name",
      workEmail: "Work email",
      emailPlaceholder: "name@company.com",
      phone: "Phone number",
      companyName: "Company name",
      companyPlaceholder: "Acme Limited",
      companySize: "Company size",
      companySizes: ["1–10 people", "11–50 people", "51–200 people", "201–1,000 people", "More than 1,000 people"],
      location: "Service location",
      service: "Service required",
      frequency: "Travel frequency",
      frequencies: ["Occasionally", "Monthly", "Weekly", "Several times a week", "Every day"],
      details: "Additional details (Optional)",
      select: "Select",
      submit: "Send Business Enquiry",
      note: "We only use your details to reply to this request.",
      required: "Required field",
      invalidEmail: "Enter a valid email address",
      sent: "Your email app has opened with the enquiry filled in. Send it and our business team will reply.",
      emailSubject: "Business account enquiry",
    },
    articles: {
      badge: "Our articles",
      lead: "Check out our",
      accent: "latest articles",
      items: [
        {
          title: "Discover New Destinations",
          copy: "Explore beautiful places, hidden gems, and unforgettable destinations around the world.",
          alt: "A black Mercedes-Benz parked by a lake with mountains behind",
        },
        {
          title: "Travel Tips & Guides",
          copy: "Find helpful travel advice, essential tips, and expert guides for a smoother journey.",
          alt: "A black Mercedes-Benz parked beneath shade canopies",
        },
        {
          title: "Stories & Experiences",
          copy: "Get inspired by unique travel experiences, local cultures, and memorable adventures.",
          alt: "The view from the rear seat of a chauffeur-driven car",
        },
      ],
    },
    faqAccent: "About Business Travel?",
  },
  chauffeurs: {
    meta: {
      title: "Drive with Driveo | Driveo Exclusive",
      description:
        "Join our network of professional chauffeurs: fixed rates for every ride, a simple monthly payout and the freedom to choose your rides.",
    },
    hero: {
      lead: "Drive premium.",
      accent: "Earn better.",
      sub: "Join our network of professional chauffeurs and take the rides that fit your day. Clear rates, simple payments.",
      cta: "Apply to drive",
      checks: ["Quick application", "Monthly payouts", "24/7 support"],
      imageAlt: "A chauffeur standing beside a black Mercedes-Maybach",
    },
    intro: {
      lead: "Rides that",
      accent: "come to you",
      body: "Clients book through our app and website, and your next ride appears in your account. Accept the ones that fit your day.",
    },
    why: {
      badge: "Why drive with us",
      lead: "Your car.",
      accent: "Your schedule.",
      imageAlt: "The Driveo driver app showing available ride offers",
      items: [
        { title: "Steady income", copy: "Fixed rates for every ride, shown before you accept. No guessing, no haggling." },
        { title: "Choose your rides", copy: "Airport, hourly and business trips. Accept only what suits your day." },
        { title: "Simple monthly payout", copy: "One clear statement each month, paid straight to your bank account." },
        { title: "One easy app", copy: "See, accept and manage every ride in one place." },
        { title: "Real support", copy: "A team that picks up when you need help, day or night." },
      ],
    },
    join: {
      badge: "How to join",
      lead: "Four steps",
      accent: "to your first ride.",
      imageAlt: "A chauffeur in a dark suit and sunglasses beside his car",
      steps: [
        {
          label: "Apply online",
          text: "Fill in a short form with your basic details and vehicle information. It only takes a few minutes.",
        },
        {
          label: "Submit your documents",
          text: "Upload your licence, vehicle papers and insurance so our team can review them quickly.",
        },
        {
          label: "Quick orientation",
          text: "Meet the team and learn how bookings, payments and support work before you start.",
        },
        {
          label: "Take your first ride",
          text: "Once you are approved, accept your first booking and start earning.",
        },
      ],
      cta: "Apply to drive",
    },
    requirements: {
      badge: "Requirements",
      lead: "What you need",
      accent: "to get started.",
      imageAlt: "A black Mercedes-Benz S-Class",
      items: [
        { label: "Your vehicle", text: "A clean, well-kept premium sedan that meets our vehicle list." },
        { label: "Your documents", text: "A valid driving licence, vehicle papers and up-to-date insurance." },
        { label: "Your service", text: "Polite, punctual and professional, with clear communication in English." },
        { label: "Your appearance", text: "A smart dress code and a spotless car for every ride." },
      ],
      cta: "View full checklist",
    },
    stories: {
      badge: "Driver stories",
      lead: "Hear it from",
      accent: "our drivers.",
      items: [
        {
          highlight: "“I see the rate before I accept,",
          body: "so there are never any surprises.”",
          name: "David Rossi",
          trip: "Chauffeur, driving with us since 2025",
        },
        {
          highlight: "Professional service, every step of the way.",
          body: "The car was spotless, and the chauffeur made sure we were comfortable throughout the ride.",
          name: "David Rossi",
          trip: "Chauffeur, driving with us since 2025",
        },
        {
          highlight: "“I take airport rides in the morning",
          body: "and business trips later. My day, my choice.”",
          name: "David Rossi",
          trip: "Chauffeur, driving with us since 2025",
        },
      ],
    },
    faqAccent: "About Driving With Us?",
    faq: [
      {
        q: "Who can apply to drive?",
        a: "Professional chauffeurs with a valid driving licence, a premium sedan that meets our vehicle list and up-to-date insurance.",
      },
      {
        q: "How do I get paid?",
        a: "Once a month, with one clear statement, straight to your bank account.",
      },
      {
        q: "Can I choose which rides I take?",
        a: "Yes. Offers appear in the driver app with the fixed rate shown, and you accept only the rides that suit your day.",
      },
      {
        q: "How long does approval take?",
        a: "Once we have your documents, our team reviews them quickly and invites you to a short orientation.",
      },
      {
        q: "Which cities can I drive in?",
        a: "London, Paris, Bulgaria and Dubai.",
      },
      {
        q: "Who do I call if something goes wrong on a ride?",
        a: "Our support team, day or night. The number is in your driver app.",
      },
    ],
    applySubject: "Chauffeur application",
    checklistSubject: "Chauffeur requirements checklist",
  },
};

export type SiteCopy = typeof enSite;
