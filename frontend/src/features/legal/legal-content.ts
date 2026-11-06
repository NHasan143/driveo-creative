import type { Locale } from "@/i18n/config";
import type { LegalSection } from "./legal-article";

interface LegalDocument {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const LEGAL_DOCS: Record<"privacy" | "terms" | "cookies", Record<Locale, LegalDocument>> = {
  privacy: {
    en: {
      metaTitle: "Privacy Policy | Driveo Exclusive",
      metaDescription: "How Driveo Exclusive Limited collects, protects, and respects your personal data in accordance with UK GDPR and EU GDPR.",
      eyebrow: "Compliance & Trust",
      title: "Privacy Policy",
      intro: "Discretion is the foundation of our service. We are committed to safeguarding your privacy and treating all personal details with the utmost confidentiality.",
      lastUpdated: "Last updated: October 2026",
      sections: [
        {
          title: "Data Controller",
          content: [
            "Driveo Exclusive Limited ('Driveo', 'we', 'our', or 'us') is the data controller responsible for your personal data under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.",
            "If you have questions regarding this policy or wish to exercise your statutory rights, please contact our privacy team at info@driveoexclusive.com.",
          ],
        },
        {
          title: "Information We Collect",
          content: [
            "We collect personal information necessary to deliver private chauffeur journeys, including: your name, telephone number, email address, pickup and drop-off coordinates, journey date and time, flight number (for airport transfers), and any voluntary travel preferences (e.g. cabin temperature or quiet ride).",
            "When using our online portal or website, technical data such as IP address and session cookies are processed to guarantee security and prevent fraudulent submissions.",
          ],
        },
        {
          title: "How and Why We Use Your Data",
          content: [
            "Contractual Necessity: To price, confirm, execute, and communicate details of your chauffeur service.",
            "Legitimate Interests: To track arrival flights in real time, dispatch qualified chauffeurs, and ensure passenger security.",
            "Legal Obligations: For tax compliance, financial accounting, and regulatory licensing obligations in our operating jurisdictions (London, Paris, Bulgaria, Dubai).",
          ],
        },
        {
          title: "Confidentiality and Third Parties",
          content: [
            "We do not sell, rent, or trade your personal data. Your contact and trip coordinates are disclosed strictly to your assigned vetted chauffeur and our internal operations team.",
            "Our cloud infrastructure and databases are hosted securely within modern enterprise environments adhering to industry-standard encryption protocols (TLS in transit, AES at rest).",
          ],
        },
        {
          title: "Data Retention & Your Rights",
          content: [
            "We retain personal data only for as long as necessary to fulfill journey arrangements, support ongoing customer accounts, and satisfy statutory record-keeping.",
            "Under the UK GDPR and GDPR, you have the right to request access to, rectification of, or erasure of your personal data, as well as the right to object to or restrict processing. To make a request, contact info@driveoexclusive.com.",
          ],
        },
      ],
    },
    fr: {
      metaTitle: "Politique de Confidentialité | Driveo Exclusive",
      metaDescription: "Comment Driveo Exclusive Limited protège vos données personnelles conformément au RGPD.",
      eyebrow: "Confiance & Conformité",
      title: "Politique de Confidentialité",
      intro: "La discrétion est le fondement de notre service. Nous traitons l'ensemble de vos données personnelles avec la plus stricte confidentialité.",
      lastUpdated: "Dernière mise à jour : Octobre 2026",
      sections: [
        {
          title: "Responsable du Traitement",
          content: [
            "Driveo Exclusive Limited est le responsable du traitement de vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).",
            "Pour toute question relative à vos données, contactez notre équipe à info@driveoexclusive.com.",
          ],
        },
        {
          title: "Données Collectées",
          content: [
            "Nous collectons les données strictement requises pour vos déplacements : nom, téléphone, adresse e-mail, adresses de prise en charge et de destination, dates, horaires, numéro de vol et préférences de voyage.",
          ],
        },
        {
          title: "Utilisation des Données",
          content: [
            "Vos données sont utilisées exclusivement pour planifier vos trajets, assigner votre chauffeur, assurer le suivi des vols et satisfaire à nos obligations comptables et réglementaires.",
          ],
        },
        {
          title: "Confidentialité & Vos Droits",
          content: [
            "Vos données ne sont jamais cédées ou vendues. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles sur simple demande à info@driveoexclusive.com.",
          ],
        },
      ],
    },
    bg: {
      metaTitle: "Политика за поверителност | Driveo Exclusive",
      metaDescription: "Как Driveo Exclusive Limited обработва и защитава личните ви данни съгласно GDPR.",
      eyebrow: "Сигурност и доверие",
      title: "Политика за поверителност",
      intro: "Дискретността е същността на нашата услуга. Ние защитаваме вашите лични данни с най-високо ниво на поверителност.",
      lastUpdated: "Последна актуализация: октомври 2026 г.",
      sections: [
        {
          title: "Администратор на лични данни",
          content: [
            "Driveo Exclusive Limited е администратор на лични данни съгласно Общия регламент за защита на данните (GDPR).",
            "За въпроси относно вашите данни се свържете с нас на info@driveoexclusive.com.",
          ],
        },
        {
          title: "Събирани данни",
          content: [
            "Събираме само информацията, необходима за организиране на вашите пътувания: имена, телефон, имейл, адреси, дата и час, полет и персонални предпочитания.",
          ],
        },
        {
          title: "Вашите права",
          content: [
            "Имате право на достъп, корекция или изтриване на вашите лични данни по всяко време чрез писмено запитване на info@driveoexclusive.com.",
          ],
        },
      ],
    },
    ar: {
      metaTitle: "سياسة الخصوصية | Driveo Exclusive",
      metaDescription: "كيف تلتزم Driveo Exclusive Limited بحماية بياناتكم الشخصية وفقاً لأعلى معايير الخصوصية.",
      eyebrow: "الثقة والالتزام",
      title: "سياسة الخصوصية",
      intro: "السرية والخصوصية هما جوهر خدماتنا. نحن ملتزمون بحماية كافة بياناتكم الشخصية بأعلى درجات الأمان.",
      lastUpdated: "آخر تحديث: أكتوبر 2026",
      sections: [
        {
          title: "الجهة المسؤولة عن معالجة البيانات",
          content: [
            "شركة Driveo Exclusive Limited هي الجهة المسؤولة عن معالجة وحماية بياناتكم الشخصية وفقاً للأنظمة واللوائح المعتمدة لحماية البيانات.",
            "لأي استفسارات، يمكنكم التواصل مع فريق الخصوصية لدينا عبر info@driveoexclusive.com.",
          ],
        },
        {
          title: "البيانات التي نقوم بجمعها",
          content: [
            "نقوم بجمع البيانات الضرورية فقط لتنفيذ رحلتكم بدقة: الاسم، رقم الهاتف، البريد الإلكتروني، موقع الانطلاق والوجهة، موعد الرحلة، رقم الرحلة الجوية، وتفضيلات الراحة الخاصة بكم.",
          ],
        },
        {
          title: "حقوقكم في حماية البيانات",
          content: [
            "يحق لكم في أي وقت طلب الاطلاع على بياناتكم أو تعديلها أو طلب حذفها من خلال التواصل معنا عبر info@driveoexclusive.com.",
          ],
        },
      ],
    },
  },
  terms: {
    en: {
      metaTitle: "Terms of Service | Driveo Exclusive",
      metaDescription: "Terms and conditions governing chauffeur services provided by Driveo Exclusive Limited.",
      eyebrow: "Service Agreement",
      title: "Terms of Service",
      intro: "Every journey with Driveo Exclusive operates with absolute precision, agreed pricing, and strict professional standards.",
      lastUpdated: "Last updated: October 2026",
      sections: [
        {
          title: "Contractual Scope & Fixed Pricing",
          content: [
            "All journeys are confirmed at a transparent fixed price based on our service grid. The agreed price includes taxes, tolls, and standard fees. No surge pricing is ever applied.",
            "Payment is settled either directly with the chauffeur or via invoice as arranged; no payments are processed online upon initial booking.",
          ],
        },
        {
          title: "Amendments and Cancellation Policy",
          content: [
            "Clients may amend journey details or cancel their booking without penalty up to 24 hours prior to the scheduled pickup time.",
            "Cancellations requested less than 24 hours before pickup may be subject to cancellation charges equivalent to the booked service amount.",
          ],
        },
        {
          title: "Airport Transfers & Free Waiting Time",
          content: [
            "For airport arrivals, flights are monitored in real time. We provide 60 minutes of complimentary waiting time from the moment the aircraft touches down.",
            "Our chauffeurs wait inside the terminal arrivals hall holding an official name board.",
          ],
        },
        {
          title: "Passenger Standards and Discretion",
          content: [
            "Smoking, vaping, or conduct endangering road safety is strictly prohibited inside vehicles.",
            "Our chauffeurs adhere to absolute professional discretion and strict non-disclosure standards.",
          ],
        },
        {
          title: "Governing Law",
          content: [
            "These Terms and any dispute or claim arising out of them are governed by and construed in accordance with the laws of England and Wales.",
          ],
        },
      ],
    },
    fr: {
      metaTitle: "Conditions Générales | Driveo Exclusive",
      metaDescription: "Conditions générales régissant les services de chauffeur privé Driveo Exclusive Limited.",
      eyebrow: "Conditions de Service",
      title: "Conditions Générales",
      intro: "Chaque trajet Driveo Exclusive s'exécute avec une précision absolue, un tarif fixe garanti et les plus hauts standards d'excellence.",
      lastUpdated: "Dernière mise à jour : Octobre 2026",
      sections: [
        {
          title: "Tarification Fixe & Modalités",
          content: [
            "Chaque trajet fait l'objet d'un tarif forfaitaire fixe convenu à l'avance, sans majoration imprévue.",
            "Le règlement s'effectue directement auprès du chauffeur ou par facture selon accord préalable.",
          ],
        },
        {
          title: "Modifications et Annulation",
          content: [
            "Vous pouvez modifier ou annuler sans frais votre réservation jusqu'à 24 heures avant l'heure de prise en charge.",
          ],
        },
        {
          title: "Transferts Aéroports",
          content: [
            "Les vols sont suivis en direct. Nous offrons 60 minutes d'attente gratuite à compter de l'atterrissage de l'avion.",
          ],
        },
      ],
    },
    bg: {
      metaTitle: "Общи условия | Driveo Exclusive",
      metaDescription: "Общи условия за предоставяне на премиум шофьорски услуги от Driveo Exclusive Limited.",
      eyebrow: "Споразумение за услуги",
      title: "Общи условия",
      intro: "Всяко пътуване с Driveo Exclusive се осъществява при пълна дискретност, фиксирани цени и безкомпромисна прецизност.",
      lastUpdated: "Последна актуализация: октомври 2026 г.",
      sections: [
        {
          title: "Фиксирани цени и плащане",
          content: [
            "Всички пътувания се потвърждават на фиксирана крайна цена без скрити такси. Заплащането се извършва директно на шофьора или по фактура.",
          ],
        },
        {
          title: "Промени и отмяна",
          content: [
            "Безплатна промяна или анулиране на резервацията е възможно до 24 часа преди заявения час на вземане.",
          ],
        },
        {
          title: "Летищни трансфери",
          content: [
            "Полетите се следят в реално време, като осигуряваме 60 минути безплатно изчакване след кацането на самолета.",
          ],
        },
      ],
    },
    ar: {
      metaTitle: "الشروط والأحكام | Driveo Exclusive",
      metaDescription: "الشروط والأحكام الخاصة بخدمات السائق الخاص من Driveo Exclusive Limited.",
      eyebrow: "اتفاقية الخدمة",
      title: "الشروط والأحكام",
      intro: "تلتزم Driveo Exclusive بتقديم تجربة تنقل استثنائية قائمة على الدقة والشفافية التامة والأسعار الثابتة.",
      lastUpdated: "آخر تحديث: أكتوبر 2026",
      sections: [
        {
          title: "الأسعار الثابتة والدفع",
          content: [
            "تعتمد جميع رحلاتنا على أسعار ثابتة ومحددة مسبقاً تشمل كافة الرسوم دون أي زيادات مفاجئة. يتم السداد مباشرة للسائق أو عبر فاتورة معتمدة.",
          ],
        },
        {
          title: "التعديل والإلغاء",
          content: [
            "يمكن للعميل تعديل بيانات الرحلة أو إلغاء الحجز مجاناً وبدون أي رسوم حتى 24 ساعة قبل موعد الانطلاق المحدد.",
          ],
        },
        {
          title: "استقبال المطارات",
          content: [
            "تتم متابعة مواعيد هبوط الطائرات لحظياً، مع توفير 60 دقيقة انتظار مجانية تبدأ فور هبوط الطائرة.",
          ],
        },
      ],
    },
  },
  cookies: {
    en: {
      metaTitle: "Cookie Policy | Driveo Exclusive",
      metaDescription: "Information about how and why Driveo Exclusive uses cookies and browser storage technologies.",
      eyebrow: "Transparency",
      title: "Cookie Policy",
      intro: "We use only essential cookies required to operate our service securely and deliver your chosen language preferences.",
      lastUpdated: "Last updated: October 2026",
      sections: [
        {
          title: "What are Cookies?",
          content: [
            "Cookies are small text files stored on your browser or device when visiting modern websites. They allow platforms to remember security sessions and user settings.",
          ],
        },
        {
          title: "Strictly Necessary Cookies",
          content: [
            "We employ essential cookies for user authentication, CSRF cross-site request forgery defense, and maintaining your selected language preference across page views.",
            "Because these cookies are strictly essential for platform functionality and security, they do not require prior consent under UK and European privacy regulations.",
          ],
        },
        {
          title: "Analytics and Marketing",
          content: [
            "Driveo Exclusive does not deploy third-party advertising cookies or cross-site tracking trackers. Any future performance analytics will run only after explicit consent.",
          ],
        },
        {
          title: "Managing Cookie Settings",
          content: [
            "You can manage or disable cookies through your browser settings at any time. Disabling essential session cookies may impair the ability to sign in or manage bookings.",
          ],
        },
      ],
    },
    fr: {
      metaTitle: "Politique des Cookies | Driveo Exclusive",
      metaDescription: "Informations sur l'utilisation des cookies et du stockage local par Driveo Exclusive.",
      eyebrow: "Transparence",
      title: "Politique des Cookies",
      intro: "Nous utilisons uniquement les cookies essentiels nécessaires au fonctionnement sécurisé de notre plateforme et au maintien de vos préférences linguistiques.",
      lastUpdated: "Dernière mise à jour : Octobre 2026",
      sections: [
        {
          title: "Utilisation des Cookies",
          content: [
            "Nos cookies servent exclusivement à assurer la sécurité de vos sessions, la protection contre la fraude (CSRF) et la mémorisation de votre langue.",
            "Aucun cookie publicitaire ou de suivi commercial intrusif n'est utilisé sur notre site.",
          ],
        },
      ],
    },
    bg: {
      metaTitle: "Политика за бисквитки | Driveo Exclusive",
      metaDescription: "Информация за бисквитките и локалното съхранение на данни в сайта на Driveo Exclusive.",
      eyebrow: "Прозрачност",
      title: "Политика за бисквитки",
      intro: "Използваме само строго необходими бисквитки за сигурност, автентикация и съхраняване на вашия езиков избор.",
      lastUpdated: "Последна актуализация: октомври 2026 г.",
      sections: [
        {
          title: "Необходими бисквитки",
          content: [
            "Бисквитките в нашия сайт служат единствено за защита на сесията, предотвратяване на злоупотреби и коректно езиково изобразяване.",
          ],
        },
      ],
    },
    ar: {
      metaTitle: "سياسة ملفات تعريف الارتباط | Driveo Exclusive",
      metaDescription: "معلومات حول استخدام ملفات تعريف الارتباط وتقنيات التخزين في Driveo Exclusive.",
      eyebrow: "الشفافية التامة",
      title: "سياسة ملفات تعريف الارتباط",
      intro: "نقتصر على استخدام ملفات تعريف الارتباط الضرورية فقط لضمان أمان تصفحكم وحفظ تفضيلات اللغة الخاصة بكم.",
      lastUpdated: "آخر تحديث: أكتوبر 2026",
      sections: [
        {
          title: "ملفات تعريف الارتباط الضرورية",
          content: [
            "تُستخدم هذه الملفات لأغراض الأمان، وحماية الجلسات، وتوفير تجربة مستخدم سلسة باللغة التي تختارونها. لا نستخدم أي ملفات تتبع إعلانية.",
          ],
        },
      ],
    },
  },
};
