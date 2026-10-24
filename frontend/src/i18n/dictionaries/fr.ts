import type { Dictionary } from "./en";

export const fr: Dictionary = {
  meta: {
    title: "Driveo Exclusive | Service de chauffeur privé",
    description:
      "Trajets avec chauffeur privé à prix fixe à Londres, Paris, en Bulgarie et à Dubaï, avec des chauffeurs vérifiés et des voitures impeccables.",
    ogDescription:
      "Arrivez dans un silence absolu avec un chauffeur privé discret, à prix fixe.",
  },
  nav: {
    services: "Services",
    fleet: "Flotte",
    cities: "Villes",
    process: "Déroulement",
    quote: "Demander un devis",
    home: "Accueil Driveo Exclusive",
    main: "Navigation principale",
    language: "Langue",
  },
  hero: {
    eyebrow: "Chauffeur privé · fondé à Londres",
    titleLine1: "Service de chauffeur privé.",
    titleLine2: "Arrivez dans un",
    titleEm: "silence absolu.",
    sub: "Des trajets à prix fixe avec des chauffeurs vérifiés en costume, un suivi des vols en direct et des voitures noires impeccables. La discrétion est la règle, pas l’exception.",
    cta: "Obtenir un prix fixe",
    whatsapp: "Écrire à Driveo sur WhatsApp",
    videoAlt: "Une Mercedes-Benz Classe S noire traversant Londres, Paris, la Bulgarie et Dubaï",
    rail: ["Discrétion", "Précision", "Silence"],
  },
  assurance: [
    { title: "Chauffeurs vérifiés", copy: "Licenciés, contrôlés, en costume et cravate." },
    { title: "Vols suivis", copy: "Nous surveillons votre vol et ajustons la prise en charge." },
    { title: "Prix fixe", copy: "Devis écrit. Pas de majoration, pas de compteur, pas de surprise." },
    { title: "Discrétion totale", copy: "Vos trajets, vos invités et vos adresses restent privés." },
  ],
  services: {
    eyebrow: "Ce que nous faisons",
    title: "Quatre façons de voyager avec nous",
    intro:
      "Chaque service est chiffré personnellement. Décrivez le trajet et nous revenons avec un prix unique, par écrit.",
    items: {
      airport_transfer: {
        label: "Transfert",
        title: "Transfert aéroport",
        copy: "Vol suivi dès le décollage. Accueil personnalisé dans le terminal, avec 60 minutes d’attente offertes.",
      },
      point_to_point: {
        label: "Trajet",
        title: "Point à point",
        copy: "Un prix fixe convenu avant le départ — du bureau à la résidence, du restaurant à l’hôtel, ou de la ville à la côte.",
      },
      hourly_hire: {
        label: "Mise à disposition",
        title: "Location horaire",
        copy: "Votre chauffeur reste avec vous pour les réunions, visites, événements et chaque arrêt intermédiaire.",
      },
      private_event: {
        label: "Occasion",
        title: "Événements privés",
        copy: "Mariages, avant-premières et longs trajets, organisés personnellement et chiffrés par écrit.",
      },
    },
  },
  fleet: {
    eyebrow: "La flotte",
    title: "Trois classes, un seul niveau de finition",
    button: "Demander pour cette voiture",
    imageSuffix: "extérieur noir",
    items: {
      business_class: {
        title: "Business Class",
        copy: "La berline exécutive en noir. Un habitacle silencieux avec Wi-Fi, chargeurs, eau plate et un chauffeur qui connaît la route.",
      },
      first_class: {
        title: "First Class",
        copy: "Luxe à empattement long en noir : sièges arrière inclinables, vitres teintées, zones climatiques et calme absolu.",
      },
      business_van: {
        title: "Business Van",
        copy: "De la place pour les équipes, les familles et les bagages, avec sièges en configuration réunion, Wi-Fi et USB-C.",
      },
    },
  },
  cities: {
    eyebrow: "Où nous opérons",
    titleLine1: "Quatre destinations.",
    titleLine2: "Un seul standard.",
    copy: "Les mêmes chauffeurs vérifiés, des voitures impeccables et la même rigueur de prix fixe, où que vous arriviez.",
    names: { london: "Londres", paris: "Paris", bulgaria: "Bulgarie", dubai: "Dubaï" },
  },
  process: {
    eyebrow: "Comment ça marche",
    title: "Trois étapes, aucune friction",
    items: [
      {
        title: "Envoyez le trajet",
        copy: "Ville, service, date et arrêts — soixante secondes sur le formulaire.",
      },
      {
        title: "Nous répondons",
        copy: "Une personne réelle chiffre votre trajet et répond avec un prix fixe tout compris.",
      },
      {
        title: "Montez à bord",
        copy: "Votre chauffeur arrive en avance, attend discrètement et s’occupe du reste.",
      },
    ],
  },
  quote: {
    eyebrow: "Demande privée",
    title: "Dites-nous où commence la route.",
    intro:
      "Partagez l’essentiel. Votre demande est enregistrée immédiatement et étudiée par un concierge Driveo.",
    seal: ["Prix fixe", "Réponse personnelle"],
    firstName: "Prénom",
    firstNamePlaceholder: "Votre prénom",
    lastName: "Nom",
    lastNamePlaceholder: "Votre nom",
    email: "E-mail",
    phone: "Téléphone",
    city: "Ville",
    selectCity: "Choisir une ville",
    service: "Service",
    selectService: "Choisir un service",
    vehicle: "Véhicule",
    pickup: "Lieu de prise en charge",
    pickupPlaceholder: "Adresse, hôtel ou aéroport",
    hours: "Choisir les heures",
    hoursUnit: "heures",
    hourlyNote:
      "Chaque heure inclut 15 miles dans le Grand Londres. Les trajets hors de cette zone peuvent être facturés différemment.",
    destination: "Destination",
    destinationPlaceholder: "Où vous emmenons-nous ?",
    date: "Date",
    time: "Heure de prise en charge",
    passengers: "Passagers",
    luggage: "Bagages",
    max: "Maximum",
    increase: "Augmenter",
    decrease: "Diminuer",
    notes: "Notes",
    notesPlaceholder: "Numéro de vol, arrêts supplémentaires, bagages ou demandes particulières",
    privacy:
      "Vos informations sont traitées confidentiellement et servent uniquement à préparer ce trajet.",
    submit: "Demander un prix fixe",
    sending: "Envoi en cours",
    successEyebrow: "Demande envoyée",
    successTitle: "Merci. Nous avons votre trajet.",
    successBodyBefore: "Votre référence est ",
    successBodyAfter:
      ". Votre demande a été envoyée à Driveo et un concierge vous contactera avec un prix fixe.",
    again: "Envoyer une autre demande",
    error:
      "Nous n’avons pas pu envoyer votre demande. Réessayez ou écrivez à info@driveoexclusive.com.",
    serviceOptions: {
      airport_transfer: "Transfert aéroport",
      point_to_point: "Point à point",
      hourly_hire: "Location horaire",
      private_event: "Événement privé",
    },
    vehicleOptions: {
      business_class: "Business Class",
      first_class: "First Class",
      business_van: "Business Van",
      please_advise: "À conseiller",
    },
  },
  testimonial: {
    eyebrow: "Leurs mots",
    quote:
      "« Trois villes, onze transferts, pas un seul retard. Driveo est le seul service à qui je confie mon itinéraire sans le vérifier deux fois. »",
    note: "Client privé · Itinéraire international",
  },
  install: {
    button: "Ajouter à l’écran d’accueil",
    label: "Installer Driveo comme application sur votre appareil",
    iosTitle: "Ajouter à l’écran d’accueil",
    iosBody:
      "Appuyez sur le bouton Partager dans Safari, puis descendez et appuyez sur 'Ajouter à l’écran d’accueil'.",
    close: "Fermer",
  },
  footer: {
    tagline: "Arrivez dans un silence absolu.",
    cta: "Demander un devis",
    contact: "Contact",
    contactNote: "Réservations et demandes privées",
    social: "Réseaux sociaux Driveo",
    cities: "Villes",
    copyright: "© 2026 Driveo Exclusive Limited",
    motto: "Discrétion · Précision · Silence",
    explore: "Explorer",
  },
  pages: {
    breadcrumbHome: "Accueil",
    links: {
      services: "Tous les services",
      fleet: "Découvrir la flotte",
      cities: "Toutes les destinations",
      process: "Le déroulement complet",
    },
    services: {
      meta: {
        title: "Services | Driveo Exclusive",
        description:
          "Transferts aéroport, trajets point à point, location horaire et événements privés, chacun chiffré personnellement à prix fixe.",
      },
      eyebrow: "Services",
      title: "Quatre façons de voyager. Un seul prix fixe.",
      titleLead: "Quatre façons de voyager.",
      titleAccent: "Un seul prix fixe.",
      intro:
        "Chaque trajet est organisé et chiffré personnellement. Choisissez le service qui vous convient et nous répondons avec un prix unique tout compris, par écrit.",
      includedLabel: "Inclus",
      quoteCta: "Demander pour ce service",
      included: {
        airport_transfer: [
          "Suivi du vol en direct dès le décollage",
          "Accueil personnalisé dans le terminal",
          "60 minutes d’attente offertes",
          "Un prix fixe, confirmé par écrit",
        ],
        point_to_point: [
          "Prix convenu avant le départ",
          "Du bureau à la résidence, de la ville à la côte",
          "Chauffeur vérifié en costume et cravate",
          "Pas de majoration, pas de compteur, pas de surprise",
        ],
        hourly_hire: [
          "De 2 à 16 heures",
          "15 miles par heure inclus dans le Grand Londres",
          "Votre chauffeur attend à chaque arrêt",
          "Réunions, visites et événements",
        ],
        private_event: [
          "Mariages, avant-premières et longs trajets",
          "Organisé personnellement avec vous",
          "Chiffré par écrit avant tout engagement",
          "Discrétion totale pour vous et vos invités",
        ],
      },
      standardEyebrow: "À chaque trajet",
      standardTitle: "Le standard de la maison",
    },
    fleet: {
      meta: {
        title: "Flotte | Driveo Exclusive",
        description:
          "Business Class, First Class et Business Van : des Mercedes-Benz noires avec des chauffeurs vérifiés en costume.",
      },
      eyebrow: "La flotte",
      title: "Trois classes. Un seul niveau de finition.",
      intro:
        "Chaque voiture est noire, impeccable et conduite par un chauffeur vérifié en costume et cravate. Choisissez la classe adaptée au trajet.",
      passengers: "Passagers",
      luggage: "Bagages",
      upTo: "Jusqu’à",
      featuresLabel: "À bord",
      features: {
        business_class: ["Wi-Fi à bord", "Chargeurs", "Eau plate", "Un habitacle silencieux"],
        first_class: [
          "Empattement long",
          "Sièges arrière inclinables",
          "Vitres teintées",
          "Zones climatiques séparées",
        ],
        business_van: [
          "Sièges en configuration réunion",
          "Wi-Fi",
          "USB-C partout",
          "De la place pour les bagages",
        ],
      },
      compareEyebrow: "En un coup d’œil",
      compareTitle: "Comparer les classes",
      compareClass: "Classe",
      compareVehicle: "Véhicule",
    },
    cities: {
      meta: {
        title: "Villes | Driveo Exclusive",
        description:
          "Chauffeur privé à Londres, Paris, en Bulgarie et à Dubaï, avec les mêmes chauffeurs vérifiés et la même rigueur de prix fixe.",
      },
      eyebrow: "Où nous opérons",
      title: "Quatre destinations. Un seul standard.",
      intro:
        "Où que vous arriviez, vous retrouvez les mêmes chauffeurs vérifiés, des voitures impeccables et la même rigueur de prix fixe.",
      servicesLabel: "Services",
      quoteCta: "Demander un trajet ici",
      standardEyebrow: "Dans chaque ville",
      standardTitle: "Le même standard partout",
    },
    process: {
      meta: {
        title: "Comment ça marche | Driveo Exclusive",
        description:
          "Envoyez le trajet, recevez un prix fixe par écrit et montez à bord. Comment réserver un chauffeur Driveo.",
      },
      eyebrow: "Comment ça marche",
      title: "Trois étapes, aucune friction.",
      intro:
        "De votre premier message jusqu’à l’arrivée, une personne réelle s’occupe de votre trajet.",
      details: [
        "Indiquez la ville, le service, la date, l’heure et les arrêts. Ajoutez un numéro de vol ou toute information utile dans les notes.",
        "Votre demande est enregistrée en toute sécurité et étudiée par un concierge Driveo, qui répond avec un prix unique tout compris, par écrit.",
        "Votre chauffeur arrive en avance, en costume et cravate. Pour les prises en charge à l’aéroport, nous suivons votre vol et vous accueillons dans le terminal.",
      ],
      checklistEyebrow: "Avant votre demande",
      checklistTitle: "Ce que nous vous demanderons",
      checklistIntro:
        "Environ soixante secondes sur le formulaire. En cas de doute, laissez une note et nous vous aiderons.",
      checklist: [
        "Ville et service",
        "Date et heure de prise en charge",
        "Lieu de prise en charge et destination, ou nombre d’heures pour la location horaire",
        "Nombre de passagers et de bagages",
        "Classe de véhicule souhaitée, ou laissez-nous conseiller",
        "Numéro de vol ou demandes particulières (facultatif)",
      ],
      commitmentsEyebrow: "Nos engagements",
      commitmentsTitle: "Ce sur quoi vous pouvez compter",
    },
    serviceDetail: {
      atAGlance: "En bref",
      factsEyebrow: "L’essentiel",
      overviewEyebrow: "Le service",
      stepsEyebrow: "Comment ça marche",
      stepsTitle: "De la demande à l’arrivée",
      fleetEyebrow: "Véhicules recommandés",
      fleetTitle: "Choisissez votre voiture",
      otherEyebrow: "Découvrir aussi",
      otherTitle: "Nos autres services",
      viewDetails: "Voir le détail",
      items: {
        airport_transfer: {
          meta: {
            title: "Transfert aéroport | Driveo Exclusive",
            description:
              "Transferts aéroport avec suivi du vol à Londres, Paris, en Bulgarie et à Dubaï, accueil dans le terminal et 60 minutes d’attente offertes.",
          },
          title: "Des transferts aéroport calés sur votre vol.",
          facts: [
            { value: "60 min", label: "D’attente offertes" },
            { value: "Direct", label: "Suivi du vol" },
            { value: "4", label: "Villes desservies" },
            { value: "1", label: "Prix fixe, par écrit" },
          ],
          overviewTitle: "Atterri, accueilli, déjà en route.",
          overviewBody:
            "Nous suivons votre vol dès le décollage et ajustons la prise en charge s’il arrive en avance ou en retard. Votre chauffeur vous attend dans le terminal et vous accompagne jusqu’à la voiture : le trajet commence dès votre arrivée.",
          features: [
            { title: "Suivi du vol", copy: "Nous suivons votre vol en temps réel : un retard ne vous fait jamais attendre." },
            { title: "Accueil personnalisé", copy: "Votre chauffeur vous accueille dans le terminal et vous accompagne jusqu’à la voiture." },
            { title: "60 minutes incluses", copy: "Temps d’attente offert pour le contrôle des passeports et les bagages." },
            { title: "Prix fixe", copy: "Un prix unique tout compris, confirmé par écrit avant votre vol." },
          ],
          steps: [
            { title: "Indiquez votre vol", copy: "Numéro de vol, terminal et destination sur le formulaire." },
            { title: "Recevez votre prix fixe", copy: "Un concierge répond avec un prix unique tout compris, par écrit." },
            { title: "Retrouvez votre chauffeur", copy: "Nous suivons le vol et vous accueillons dans le terminal à l’atterrissage." },
          ],
        },
        point_to_point: {
          meta: {
            title: "Point à point | Driveo Exclusive",
            description:
              "Trajets point à point à prix fixe avec un chauffeur vérifié en costume, du bureau à la résidence ou de la ville à la côte.",
          },
          title: "Point à point, à un seul prix fixe.",
          facts: [
            { value: "1", label: "Prix, convenu avant le départ" },
            { value: "0", label: "Majoration ou compteur" },
            { value: "3", label: "Classes de véhicules" },
            { value: "4", label: "Villes desservies" },
          ],
          overviewTitle: "Chaque trajet, chiffré avant le départ.",
          overviewBody:
            "Du bureau à la résidence, du restaurant à l’hôtel ou de la ville à la côte : indiquez votre destination et nous convenons d’un prix unique avant le départ. Pas de majoration, pas de compteur, et un chauffeur vérifié en costume et cravate.",
          features: [
            { title: "Convenu à l’avance", copy: "Le prix est fixé par écrit avant le départ." },
            { title: "Toutes distances", copy: "Courts trajets en ville ou longs trajets vers la côte." },
            { title: "Chauffeurs vérifiés", copy: "Licenciés, contrôlés, en costume et cravate." },
            { title: "Discrétion totale", copy: "Vos trajets, vos invités et vos adresses restent privés." },
          ],
          steps: [
            { title: "Envoyez l’itinéraire", copy: "Prise en charge, destination, date et heure, en soixante secondes environ." },
            { title: "Validez le prix", copy: "Nous répondons avec un prix fixe unique, par écrit." },
            { title: "Voyagez au calme", copy: "Votre chauffeur arrive en avance et vous conduit de porte à porte." },
          ],
        },
        hourly_hire: {
          meta: {
            title: "Location horaire | Driveo Exclusive",
            description:
              "Un chauffeur à l’heure, de 2 à 16 heures, pour vos réunions, visites et événements. 15 miles par heure inclus dans le Grand Londres.",
          },
          title: "Un chauffeur à vos côtés, à l’heure.",
          facts: [
            { value: "2–16", label: "Heures par réservation" },
            { value: "15 mi", label: "Inclus par heure dans le Grand Londres" },
            { value: "1", label: "Chauffeur dédié" },
            { value: "3", label: "Classes de véhicules" },
          ],
          overviewTitle: "Chaque arrêt, un seul chauffeur.",
          overviewBody:
            "Réservez un chauffeur aussi longtemps que votre journée l’exige. Il reste avec vous entre réunions, visites et événements, et attend discrètement à chaque arrêt. Chaque heure inclut 15 miles dans le Grand Londres ; les trajets hors de cette zone peuvent être facturés différemment.",
          features: [
            { title: "De 2 à 16 heures", copy: "Choisissez les heures adaptées à votre agenda." },
            { title: "Attente à chaque arrêt", copy: "Inutile de réserver une nouvelle voiture entre deux rendez-vous." },
            { title: "Kilométrage inclus", copy: "15 miles par heure dans le Grand Londres." },
            { title: "Un prix pour la journée", copy: "Chiffré par écrit avant la réservation." },
          ],
          steps: [
            { title: "Planifiez votre journée", copy: "Choisissez la ville, l’heure de début et le nombre d’heures." },
            { title: "Recevez votre prix fixe", copy: "Un concierge confirme le montant par écrit." },
            { title: "Avancez à votre rythme", copy: "Votre chauffeur reste avec vous jusqu’au dernier arrêt." },
          ],
        },
        private_event: {
          meta: {
            title: "Événements privés | Driveo Exclusive",
            description:
              "Chauffeurs pour mariages, avant-premières et longs trajets, organisés personnellement et chiffrés par écrit.",
          },
          title: "Des événements privés, organisés personnellement.",
          facts: [
            { value: "3", label: "Classes de véhicules" },
            { value: "7", label: "Passagers dans le Business Van" },
            { value: "4", label: "Villes desservies" },
            { value: "1", label: "Devis écrit, avant tout engagement" },
          ],
          overviewTitle: "Le jour compte. L’arrivée aussi.",
          overviewBody:
            "Mariages, avant-premières et longs trajets sont organisés personnellement avec vous, puis chiffrés par écrit. Parlez-nous de vos invités et nous vous conseillerons les bons véhicules, avec des chauffeurs qui préservent chaque détail.",
          features: [
            { title: "Organisé avec vous", copy: "Horaires, arrêts et invités convenus à l’avance." },
            { title: "Les bons véhicules", copy: "De la Classe S au Business Van sept places." },
            { title: "Chiffré par écrit", copy: "Un prix fixe unique avant tout engagement." },
            { title: "Discrétion totale", copy: "Pour vous et chacun de vos invités." },
          ],
          steps: [
            { title: "Décrivez l’occasion", copy: "Date, ville, invités et arrêts, avec tout détail utile dans les notes." },
            { title: "Organisons-le ensemble", copy: "Un concierge conseille véhicules et horaires, puis envoie un devis fixe." },
            { title: "Arrivez en silence", copy: "Les chauffeurs arrivent en avance et respectent le programme." },
          ],
        },
      },
    },
  },
  notFound: {
    eyebrow: "Erreur 404",
    title: "Cette route ne mène nulle part.",
    body: "La page que vous cherchez a été déplacée ou n’a jamais existé.",
    cta: "Retour à l’accueil",
  },
};
