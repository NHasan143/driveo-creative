import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LanguageCode = "en" | "fr" | "bg" | "ar";
export const languages: { code: LanguageCode; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "bg", label: "Български", short: "BG" },
  { code: "ar", label: "العربية", short: "AR" },
];

const en = {
  nav: { services: "Services", fleet: "Fleet", cities: "Cities", process: "Process", quote: "Request quote", home: "Driveo Exclusive home", main: "Main navigation", language: "Language" },
  hero: {
    eyebrow: "Private chauffeur · London founded",
    titleLine1: "Private chauffeur service.",
    titleLine2: "Arrive in",
    titleEm: "absolute silence.",
    sub: "Fixed-price travel with vetted, suited drivers, live flight tracking and immaculate black cars. Discretion is the standard, not the exception.",
    cta: "Get a fixed quote",
    whatsapp: "Message Driveo on WhatsApp",
    videoAlt: "A black Mercedes-Benz S-Class travelling through London, Paris, Bulgaria and Dubai",
    rail: ["Discretion", "Precision", "Silence"],
  },
  assurance: [
    { title: "Vetted chauffeurs", copy: "Licensed, background-checked, in suit and tie." },
    { title: "Flight tracked", copy: "We watch your flight and adjust the pickup for you." },
    { title: "Fixed pricing", copy: "Quoted in writing. No surge, no meter, no surprises." },
    { title: "Total discretion", copy: "Your journeys, guests and addresses stay private." },
  ],
  services: {
    eyebrow: "What we do",
    title: "Four ways to travel with us",
    intro: "Every service is quoted personally. Tell us the journey and we come back with one price, in writing.",
    items: [
      { label: "Transfer", title: "Airport transfer", copy: "Flight tracked from wheels-up. Meet and greet inside the terminal, with 60 minutes of complimentary waiting." },
      { label: "Journey", title: "Point-to-point", copy: "One fixed price agreed before you travel — from boardroom to residence, restaurant to hotel, or city to coast." },
      { label: "Retainer", title: "Hourly hire", copy: "Your chauffeur stays with you for meetings, viewings, events and every stop in between." },
      { label: "Occasion", title: "Private events", copy: "Weddings, premieres and long-haul road journeys, planned personally and quoted in writing." },
    ],
  },
  fleet: {
    eyebrow: "The fleet",
    title: "Three classes, one standard of finish",
    button: "Quote this car",
    items: [
      { title: "Business Class", copy: "The executive saloon in black. A quiet cabin with onboard Wi-Fi, chargers, still water and a chauffeur who knows the route." },
      { title: "First Class", copy: "Long-wheelbase luxury in black with reclining rear seats, privacy glass, climate zones and uncompromising calm." },
      { title: "Business Van", copy: "Space for teams, families and luggage, with conference seating, Wi-Fi and USB-C throughout." },
    ],
  },
  cities: { eyebrow: "Where we operate", titleLine1: "Four locations.", titleLine2: "One house standard.", copy: "The same vetted chauffeurs, pristine cars and fixed-price discipline wherever you land." },
  process: {
    eyebrow: "How it works",
    title: "Three moves, no friction",
    items: [
      { title: "Send the journey", copy: "City, service, date and stops — sixty seconds on the quote form." },
      { title: "We write back", copy: "A real person prices it and replies with a fixed, all-inclusive figure." },
      { title: "Step in", copy: "Your chauffeur arrives early, waits quietly, and takes it from there." },
    ],
  },
  quote: {
    eyebrow: "Private enquiry",
    title: "Tell us where the road begins.",
    intro: "Share the essentials. Your request is secured immediately and reviewed by a Driveo concierge.",
    seal: "Fixed price\nPersonal reply",
    fullName: "Full name", fullNamePlaceholder: "Your name",
    email: "Email", phone: "Phone",
    city: "City", selectCity: "Select city",
    service: "Service", selectService: "Select service",
    vehicle: "Vehicle",
    pickup: "Pickup location", pickupPlaceholder: "Address, hotel or airport",
    hours: "Select hours", hoursUnit: "hours",
    hourlyNote: "Each hour includes 15 miles within Greater London. Journeys outside this area may be charged differently.",
    destination: "Destination", destinationPlaceholder: "Where are we taking you?",
    date: "Date", time: "Pickup time",
    passengers: "Passengers", luggage: "Luggage", max: "Maximum",
    increase: "Increase", decrease: "Decrease",
    notes: "Notes", notesPlaceholder: "Flight number, extra stops, luggage or special requirements",
    privacy: "Your details are handled privately and used only to prepare this journey.",
    submit: "Request fixed quote", sending: "Securing request",
    successEyebrow: "Request emailed",
    successTitle: "Thank you. We have your journey.",
    successBodyBefore: "Your reference is ", successBodyAfter: ". Your request has been emailed to Driveo and a concierge will contact you with a fixed quote.",
    again: "Send another request",
    error: "We could not email your request. Please try again or email driveolimited@gmail.com.",
    services: { "Airport transfer": "Airport transfer", "Point-to-point": "Point-to-point", "Hourly hire": "Hourly hire", "Private event": "Private event" },
    vehicles: { "Business Class": "Business Class", "First Class": "First Class", "Business Van": "Business Van", "Please advise": "Please advise" },
  },
  testimonial: { eyebrow: "In their words", quote: "“Three cities, eleven transfers, not one late arrival. Driveo is the only service I hand my itinerary to without checking it twice.”", note: "Private client · International itinerary" },
  install: { button: "Add to Home Screen", label: "Install Driveo as an app on your device", iosTitle: "Add to Home Screen", iosBody: "Tap the Share icon in Safari, then scroll down and tap 'Add to Home Screen'.", close: "Close" },
  footer: { tagline: "Arrive in absolute silence.", cta: "Request a quote", contact: "Contact", contactNote: "Private bookings and enquiries", social: "Driveo social media", cities: "Cities", copyright: "© 2026 Driveo Exclusive Limited", motto: "Discretion · Precision · Silence" },
  cityNames: { London: "London", Paris: "Paris", Bulgaria: "Bulgaria", Dubai: "Dubai" },
};

type Dict = typeof en;

const fr: Dict = {
  nav: { services: "Services", fleet: "Flotte", cities: "Villes", process: "Déroulement", quote: "Demander un devis", home: "Accueil Driveo Exclusive", main: "Navigation principale", language: "Langue" },
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
    intro: "Chaque service est chiffré personnellement. Décrivez le trajet et nous revenons avec un prix unique, par écrit.",
    items: [
      { label: "Transfert", title: "Transfert aéroport", copy: "Vol suivi dès le décollage. Accueil personnalisé dans le terminal, avec 60 minutes d’attente offertes." },
      { label: "Trajet", title: "Point à point", copy: "Un prix fixe convenu avant le départ — du bureau à la résidence, du restaurant à l’hôtel, ou de la ville à la côte." },
      { label: "Mise à disposition", title: "Location horaire", copy: "Votre chauffeur reste avec vous pour les réunions, visites, événements et chaque arrêt intermédiaire." },
      { label: "Occasion", title: "Événements privés", copy: "Mariages, avant-premières et longs trajets, organisés personnellement et chiffrés par écrit." },
    ],
  },
  fleet: {
    eyebrow: "La flotte",
    title: "Trois classes, un seul niveau de finition",
    button: "Demander pour cette voiture",
    items: [
      { title: "Business Class", copy: "La berline exécutive en noir. Un habitacle silencieux avec Wi-Fi, chargeurs, eau plate et un chauffeur qui connaît la route." },
      { title: "First Class", copy: "Luxe à empattement long en noir : sièges arrière inclinables, vitres teintées, zones climatiques et calme absolu." },
      { title: "Business Van", copy: "De la place pour les équipes, les familles et les bagages, avec sièges en configuration réunion, Wi-Fi et USB-C." },
    ],
  },
  cities: { eyebrow: "Où nous opérons", titleLine1: "Quatre destinations.", titleLine2: "Un seul standard.", copy: "Les mêmes chauffeurs vérifiés, des voitures impeccables et la même rigueur de prix fixe, où que vous arriviez." },
  process: {
    eyebrow: "Comment ça marche",
    title: "Trois étapes, aucune friction",
    items: [
      { title: "Envoyez le trajet", copy: "Ville, service, date et arrêts — soixante secondes sur le formulaire." },
      { title: "Nous répondons", copy: "Une personne réelle chiffre votre trajet et répond avec un prix fixe tout compris." },
      { title: "Montez à bord", copy: "Votre chauffeur arrive en avance, attend discrètement et s’occupe du reste." },
    ],
  },
  quote: {
    eyebrow: "Demande privée",
    title: "Dites-nous où commence la route.",
    intro: "Partagez l’essentiel. Votre demande est enregistrée immédiatement et étudiée par un concierge Driveo.",
    seal: "Prix fixe\nRéponse personnelle",
    fullName: "Nom complet", fullNamePlaceholder: "Votre nom",
    email: "E-mail", phone: "Téléphone",
    city: "Ville", selectCity: "Choisir une ville",
    service: "Service", selectService: "Choisir un service",
    vehicle: "Véhicule",
    pickup: "Lieu de prise en charge", pickupPlaceholder: "Adresse, hôtel ou aéroport",
    hours: "Choisir les heures", hoursUnit: "heures",
    hourlyNote: "Chaque heure inclut 15 miles dans le Grand Londres. Les trajets hors de cette zone peuvent être facturés différemment.",
    destination: "Destination", destinationPlaceholder: "Où vous emmenons-nous ?",
    date: "Date", time: "Heure de prise en charge",
    passengers: "Passagers", luggage: "Bagages", max: "Maximum",
    increase: "Augmenter", decrease: "Diminuer",
    notes: "Notes", notesPlaceholder: "Numéro de vol, arrêts supplémentaires, bagages ou demandes particulières",
    privacy: "Vos informations sont traitées confidentiellement et servent uniquement à préparer ce trajet.",
    submit: "Demander un prix fixe", sending: "Envoi en cours",
    successEyebrow: "Demande envoyée",
    successTitle: "Merci. Nous avons votre trajet.",
    successBodyBefore: "Votre référence est ", successBodyAfter: ". Votre demande a été envoyée à Driveo et un concierge vous contactera avec un prix fixe.",
    again: "Envoyer une autre demande",
    error: "Nous n’avons pas pu envoyer votre demande. Réessayez ou écrivez à driveolimited@gmail.com.",
    services: { "Airport transfer": "Transfert aéroport", "Point-to-point": "Point à point", "Hourly hire": "Location horaire", "Private event": "Événement privé" },
    vehicles: { "Business Class": "Business Class", "First Class": "First Class", "Business Van": "Business Van", "Please advise": "À conseiller" },
  },
  testimonial: { eyebrow: "Leurs mots", quote: "« Trois villes, onze transferts, pas un seul retard. Driveo est le seul service à qui je confie mon itinéraire sans le vérifier deux fois. »", note: "Client privé · Itinéraire international" },
  install: { button: "Ajouter à l’écran d’accueil", label: "Installer Driveo comme application sur votre appareil", iosTitle: "Ajouter à l’écran d’accueil", iosBody: "Appuyez sur le bouton Partager dans Safari, puis descendez et appuyez sur 'Ajouter à l’écran d’accueil'.", close: "Fermer" },
  footer: { tagline: "Arrivez dans un silence absolu.", cta: "Demander un devis", contact: "Contact", contactNote: "Réservations et demandes privées", social: "Réseaux sociaux Driveo", cities: "Villes", copyright: "© 2026 Driveo Exclusive Limited", motto: "Discrétion · Précision · Silence" },
  cityNames: { London: "Londres", Paris: "Paris", Bulgaria: "Bulgarie", Dubai: "Dubaï" },
};

const bg: Dict = {
  nav: { services: "Услуги", fleet: "Автопарк", cities: "Градове", process: "Процес", quote: "Заявка за оферта", home: "Начало Driveo Exclusive", main: "Основна навигация", language: "Език" },
  hero: {
    eyebrow: "Частен шофьор · основано в Лондон",
    titleLine1: "Частен шофьорски сервиз.",
    titleLine2: "Пристигайте в",
    titleEm: "абсолютна тишина.",
    sub: "Пътувания на фиксирана цена с проверени шофьори в костюм, следене на полети на живо и безупречни черни автомобили. Дискретността е стандарт, не изключение.",
    cta: "Вземете фиксирана цена",
    whatsapp: "Пишете на Driveo в WhatsApp",
    videoAlt: "Черен Mercedes-Benz S-Class преминава през Лондон, Париж, България и Дубай",
    rail: ["Дискретност", "Прецизност", "Тишина"],
  },
  assurance: [
    { title: "Проверени шофьори", copy: "Лицензирани, с проверено минало, с костюм и вратовръзка." },
    { title: "Следене на полети", copy: "Следим полета ви и коригираме часа на вземане." },
    { title: "Фиксирани цени", copy: "Оферта в писмен вид. Без надценки, без таксиметър, без изненади." },
    { title: "Пълна дискретност", copy: "Вашите пътувания, гости и адреси остават лични." },
  ],
  services: {
    eyebrow: "Какво правим",
    title: "Четири начина да пътувате с нас",
    intro: "Всяка услуга се оферира лично. Кажете ни маршрута и ще се върнем с една цена, в писмен вид.",
    items: [
      { label: "Трансфер", title: "Летищен трансфер", copy: "Следим полета от излитането. Посрещане в терминала и 60 минути безплатно изчакване." },
      { label: "Маршрут", title: "От точка до точка", copy: "Една фиксирана цена, договорена преди пътуването — от офиса до дома, от ресторанта до хотела или от града до морето." },
      { label: "Ангажимент", title: "Почасов наем", copy: "Вашият шофьор остава с вас за срещи, огледи, събития и всяка спирка между тях." },
      { label: "Повод", title: "Частни събития", copy: "Сватби, премиери и дълги пътувания, планирани лично и оферирани писмено." },
    ],
  },
  fleet: {
    eyebrow: "Автопаркът",
    title: "Три класа, един стандарт на изпълнение",
    button: "Оферта за този автомобил",
    items: [
      { title: "Business Class", copy: "Представителният седан в черно. Тих салон с Wi-Fi, зарядни, вода и шофьор, който познава маршрута." },
      { title: "First Class", copy: "Лукс с удължена база в черно: сгъваеми задни седалки, затъмнени стъкла, климатични зони и безкомпромисно спокойствие." },
      { title: "Business Van", copy: "Място за екипи, семейства и багаж, с конферентно разположение, Wi-Fi и USB-C навсякъде." },
    ],
  },
  cities: { eyebrow: "Къде работим", titleLine1: "Четири локации.", titleLine2: "Един стандарт.", copy: "Същите проверени шофьори, безупречни автомобили и фиксирани цени, където и да кацнете." },
  process: {
    eyebrow: "Как работи",
    title: "Три стъпки, без усложнения",
    items: [
      { title: "Изпратете маршрута", copy: "Град, услуга, дата и спирки — шестдесет секунди във формата." },
      { title: "Ние отговаряме", copy: "Истински човек изчислява цената и отговаря с фиксирана сума с всичко включено." },
      { title: "Качете се", copy: "Шофьорът пристига по-рано, изчаква тихо и поема оттам." },
    ],
  },
  quote: {
    eyebrow: "Лично запитване",
    title: "Кажете ни откъде започва пътят.",
    intro: "Споделете основното. Запитването се запазва веднага и се разглежда от консиерж на Driveo.",
    seal: "Фиксирана цена\nЛичен отговор",
    fullName: "Име и фамилия", fullNamePlaceholder: "Вашето име",
    email: "Имейл", phone: "Телефон",
    city: "Град", selectCity: "Изберете град",
    service: "Услуга", selectService: "Изберете услуга",
    vehicle: "Автомобил",
    pickup: "Място на вземане", pickupPlaceholder: "Адрес, хотел или летище",
    hours: "Изберете часове", hoursUnit: "часа",
    hourlyNote: "Всеки час включва 15 мили в рамките на Голям Лондон. Пътувания извън тази зона може да се таксуват различно.",
    destination: "Дестинация", destinationPlaceholder: "Накъде да ви отведем?",
    date: "Дата", time: "Час на вземане",
    passengers: "Пътници", luggage: "Багаж", max: "Максимум",
    increase: "Увеличи", decrease: "Намали",
    notes: "Бележки", notesPlaceholder: "Номер на полет, допълнителни спирки, багаж или специални изисквания",
    privacy: "Данните ви се обработват поверително и се използват само за организиране на това пътуване.",
    submit: "Заявете фиксирана цена", sending: "Изпращане",
    successEyebrow: "Запитването е изпратено",
    successTitle: "Благодарим. Получихме вашето пътуване.",
    successBodyBefore: "Вашият номер е ", successBodyAfter: ". Запитването е изпратено до Driveo и консиерж ще се свърже с вас с фиксирана цена.",
    again: "Изпратете ново запитване",
    error: "Не успяхме да изпратим запитването. Опитайте отново или пишете на driveolimited@gmail.com.",
    services: { "Airport transfer": "Летищен трансфер", "Point-to-point": "От точка до точка", "Hourly hire": "Почасов наем", "Private event": "Частно събитие" },
    vehicles: { "Business Class": "Business Class", "First Class": "First Class", "Business Van": "Business Van", "Please advise": "Моля, посъветвайте" },
  },
  testimonial: { eyebrow: "Техните думи", quote: "„Три града, единадесет трансфера, нито едно закъснение. Driveo е единствената услуга, на която поверявам маршрута си без да го проверявам втори път.“", note: "Частен клиент · Международен маршрут" },
  install: { button: "Добави към началния екран", label: "Инсталирайте Driveo като приложение на устройството си", iosTitle: "Добави към началния екран", iosBody: "Докоснете бутона Сподели в Safari, превъртете надолу и докоснете 'Добави към началния екран'.", close: "Затвори" },
  footer: { tagline: "Пристигайте в абсолютна тишина.", cta: "Заявете оферта", contact: "Контакт", contactNote: "Частни резервации и запитвания", social: "Driveo в социалните мрежи", cities: "Градове", copyright: "© 2026 Driveo Exclusive Limited", motto: "Дискретност · Прецизност · Тишина" },
  cityNames: { London: "Лондон", Paris: "Париж", Bulgaria: "България", Dubai: "Дубай" },
};

const ar: Dict = {
  nav: { services: "الخدمات", fleet: "الأسطول", cities: "المدن", process: "الخطوات", quote: "اطلب عرض سعر", home: "الصفحة الرئيسية Driveo Exclusive", main: "التنقل الرئيسي", language: "اللغة" },
  hero: {
    eyebrow: "سائق خاص · تأسست في لندن",
    titleLine1: "خدمة سائق خاص.",
    titleLine2: "تنقّل في",
    titleEm: "هدوء تام.",
    sub: "رحلات بسعر ثابت مع سائقين موثوقين بالبدلة الرسمية، ومتابعة مباشرة للرحلات الجوية، وسيارات سوداء لا تشوبها شائبة. الخصوصية هي القاعدة لا الاستثناء.",
    cta: "احصل على سعر ثابت",
    whatsapp: "راسل Driveo على واتساب",
    videoAlt: "سيارة مرسيدس-بنز S-Class سوداء تعبر لندن وباريس وبلغاريا ودبي",
    rail: ["الخصوصية", "الدقة", "الهدوء"],
  },
  assurance: [
    { title: "سائقون موثوقون", copy: "مرخّصون ومدقّقة خلفياتهم، ببدلة ورابطة عنق." },
    { title: "متابعة الرحلات", copy: "نتابع رحلتك ونعدّل موعد الاستقبال نيابةً عنك." },
    { title: "أسعار ثابتة", copy: "عرض سعر مكتوب. بلا زيادات ولا عدّاد ولا مفاجآت." },
    { title: "سرّية تامة", copy: "رحلاتك وضيوفك وعناوينك تبقى خاصة." },
  ],
  services: {
    eyebrow: "ما نقدّمه",
    title: "أربع طرق للسفر معنا",
    intro: "كل خدمة تُسعّر بشكل شخصي. أخبرنا بالرحلة ونعود إليك بسعر واحد مكتوب.",
    items: [
      { label: "توصيل", title: "توصيل المطار", copy: "متابعة الرحلة من الإقلاع. استقبال داخل الصالة مع 60 دقيقة انتظار مجاناً." },
      { label: "رحلة", title: "من نقطة إلى نقطة", copy: "سعر ثابت يُتفق عليه قبل السفر — من المكتب إلى المنزل، أو من المطعم إلى الفندق، أو من المدينة إلى الساحل." },
      { label: "بالساعة", title: "الحجز بالساعة", copy: "يبقى سائقك معك للاجتماعات والزيارات والفعاليات وكل محطة بينها." },
      { label: "مناسبات", title: "المناسبات الخاصة", copy: "أعراس وعروض خاصة ورحلات طويلة، تُنظَّم شخصياً وتُسعَّر كتابةً." },
    ],
  },
  fleet: {
    eyebrow: "الأسطول",
    title: "ثلاث فئات، ومستوى واحد من الإتقان",
    button: "اطلب سعر هذه السيارة",
    items: [
      { title: "Business Class", copy: "سيارة السيدان التنفيذية باللون الأسود. مقصورة هادئة مع واي فاي وشواحن ومياه وسائق يعرف الطريق." },
      { title: "First Class", copy: "فخامة بقاعدة عجلات طويلة باللون الأسود: مقاعد خلفية قابلة للإمالة، وزجاج معتم، ومناطق تكييف، وهدوء تام." },
      { title: "Business Van", copy: "مساحة للفرق والعائلات والأمتعة، بمقاعد بترتيب اجتماعات وواي فاي ومنافذ USB-C." },
    ],
  },
  cities: { eyebrow: "أين نعمل", titleLine1: "أربع وجهات.", titleLine2: "معيار واحد.", copy: "نفس السائقين الموثوقين والسيارات النظيفة والأسعار الثابتة أينما وصلت." },
  process: {
    eyebrow: "كيف تعمل",
    title: "ثلاث خطوات دون تعقيد",
    items: [
      { title: "أرسل تفاصيل الرحلة", copy: "المدينة والخدمة والتاريخ والمحطات — ستون ثانية في النموذج." },
      { title: "نردّ عليك", copy: "شخص حقيقي يحسب السعر ويجيب بمبلغ ثابت شامل." },
      { title: "اركب وانطلق", copy: "يصل سائقك مبكراً وينتظر بهدوء ويتولى الباقي." },
    ],
  },
  quote: {
    eyebrow: "طلب خاص",
    title: "أخبرنا من أين يبدأ الطريق.",
    intro: "شاركنا الأساسيات. يُحفظ طلبك فوراً ويراجعه أحد منسّقي Driveo.",
    seal: "سعر ثابت\nردّ شخصي",
    fullName: "الاسم الكامل", fullNamePlaceholder: "اسمك",
    email: "البريد الإلكتروني", phone: "الهاتف",
    city: "المدينة", selectCity: "اختر المدينة",
    service: "الخدمة", selectService: "اختر الخدمة",
    vehicle: "السيارة",
    pickup: "مكان الاستقبال", pickupPlaceholder: "عنوان أو فندق أو مطار",
    hours: "اختر عدد الساعات", hoursUnit: "ساعات",
    hourlyNote: "كل ساعة تشمل 15 ميلاً داخل لندن الكبرى. الرحلات خارج هذه المنطقة قد تُحتسب بشكل مختلف.",
    destination: "الوجهة", destinationPlaceholder: "إلى أين نأخذك؟",
    date: "التاريخ", time: "وقت الاستقبال",
    passengers: "الركاب", luggage: "الأمتعة", max: "الحد الأقصى",
    increase: "زيادة", decrease: "إنقاص",
    notes: "ملاحظات", notesPlaceholder: "رقم الرحلة، محطات إضافية، أمتعة أو متطلبات خاصة",
    privacy: "تُعامل بياناتك بسرّية وتُستخدم فقط لتجهيز هذه الرحلة.",
    submit: "اطلب سعراً ثابتاً", sending: "جارٍ الإرسال",
    successEyebrow: "تم إرسال الطلب",
    successTitle: "شكراً لك. استلمنا تفاصيل رحلتك.",
    successBodyBefore: "رقمك المرجعي هو ", successBodyAfter: ". تم إرسال طلبك إلى Driveo وسيتواصل معك أحد المنسّقين بسعر ثابت.",
    again: "إرسال طلب آخر",
    error: "تعذّر إرسال طلبك. حاول مرة أخرى أو راسلنا على driveolimited@gmail.com.",
    services: { "Airport transfer": "توصيل المطار", "Point-to-point": "من نقطة إلى نقطة", "Hourly hire": "الحجز بالساعة", "Private event": "مناسبة خاصة" },
    vehicles: { "Business Class": "Business Class", "First Class": "First Class", "Business Van": "Business Van", "Please advise": "أرجو النصيحة" },
  },
  testimonial: { eyebrow: "بكلماتهم", quote: "«ثلاث مدن وأحد عشر تنقلاً ولا تأخير واحد. Driveo هي الخدمة الوحيدة التي أسلّمها جدولي دون مراجعته مرتين.»", note: "عميل خاص · جدول سفر دولي" },
  install: { button: "إضافة إلى الشاشة الرئيسية", label: "ثبّت Driveo كتطبيق على جهازك", iosTitle: "إضافة إلى الشاشة الرئيسية", iosBody: "اضغط على زر المشاركة في Safari، ثم مرّر للأسفل واضغط 'إضافة إلى الشاشة الرئيسية'.", close: "إغلاق" },
  footer: { tagline: "تنقّل في هدوء تام.", cta: "اطلب عرض سعر", contact: "التواصل", contactNote: "حجوزات وطلبات خاصة", social: "Driveo على وسائل التواصل", cities: "المدن", copyright: "© 2026 Driveo Exclusive Limited", motto: "الخصوصية · الدقة · الهدوء" },
  cityNames: { London: "لندن", Paris: "باريس", Bulgaria: "بلغاريا", Dubai: "دبي" },
};

const dictionaries: Record<LanguageCode, Dict> = { en, fr, bg, ar };

const LanguageContext = createContext<{ language: LanguageCode; setLanguage: (code: LanguageCode) => void; t: Dict }>({ language: "en", setLanguage: () => {}, t: en });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("driveo-language") as LanguageCode | null;
    if (stored && stored in dictionaries) setLanguageState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: (code: LanguageCode) => { setLanguageState(code); window.localStorage.setItem("driveo-language", code); },
    t: dictionaries[language],
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
