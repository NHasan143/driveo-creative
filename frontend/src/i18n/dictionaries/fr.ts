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
  },
  notFound: {
    eyebrow: "Erreur 404",
    title: "Cette route ne mène nulle part.",
    body: "La page que vous cherchez a été déplacée ou n’a jamais existé.",
    cta: "Retour à l’accueil",
  },
};
