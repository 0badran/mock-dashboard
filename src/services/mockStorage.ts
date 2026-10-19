import { useState, useEffect, useCallback } from "react";

// Storage Key prefix
const STORAGE_PREFIX = "mock_dashboard_";

export interface ClientItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestsCount: number;
  status: "active" | "completed" | "upcoming";
}

export interface GuestItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  eventName: string;
  createdAt: string;
  clientName?: string;
  category?: "vip" | "family" | "friends" | "colleagues";
  companions?: number;
  invitationStatus?: "sent" | "pending" | "viewed";
}

export interface RsvpItem {
  id: string;
  guestName: string;
  phone: string;
  eventName: string;
  response: "attending" | "declined" | "pending";
  companions: number;
  dietary: "regular" | "vegetarian" | "none";
  notes?: string;
  createdAt?: string;
}

export interface ConfirmedAttendeeItem {
  id: string;
  name: string;
  table: string;
  checkedIn: boolean;
  time?: string;
}

export interface EventItem {
  id: string;
  title: string;
  client: string;
  date: string;
  time: string;
  hall: string;
  capacity: number;
  status: "planned" | "ongoing" | "completed" | "cancelled";
}

export interface HallItem {
  id: string;
  name: string;
  address: string;
  capacity: number;
  tablesCount: number;
  seatsCount: number;
  displayOrder: number;
  status: "available" | "unavailable" | "maintenance";
  imageUrl?: string;
}

export interface InvitationTemplateItem {
  id: string;
  templateName: string;
  templateSlug: string;
  brideName: string;
  groomName: string;
  eventDate: string;
  isPublished: boolean;
  coverUrl?: string;
  previewUrl?: string;
  eventTypeName?: string;
}

export interface EventRequestItem {
  id: string;
  name: string;
  clientName: string;
  clientPhone: string;
  hallName: string;
  eventTypeName: string;
  startsAt: string;
  endsAt: string;
  guestCount: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface EventLayoutItem {
  id: string;
  eventId: string;
  eventName: string;
  clientName: string;
  hallName: string;
  eventDate: string;
  totalGuests: number;
  seatedGuests: number;
  tablesCount: number;
  hasLayout: boolean;
  layoutJson?: string;
}

export interface NoteItem {
  id: string;
  subject: string;
  content: string;
  priority: "high" | "medium" | "low";
  date: string;
}

export interface BroadcastItem {
  id: string;
  title: string;
  message: string;
  audience: string;
  sentDate: string;
  recipients: number;
  status: string;
}

export interface RoleItem {
  id: string;
  roleName: string;
  description: string;
  usersCount: number;
}

export interface AssistantItem {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: "active" | "inactive";
}

export interface MemoryItem {
  id: string;
  event: string;
  caption: string;
  date: string;
  mediaUrl: string;
}

export interface LookupItem {
  id: string;
  category: string;
  key: string;
  value: string;
  name?: string;
  name_ar?: string;
  name_en?: string;
  lookup_code?: string;
  lookup_type?: string;
  display_order?: number;
  is_active?: boolean;
  status?: { label: string; value: "approved" | "rejected" | "pending" };
  description?: string;
  description_ar?: string;
  description_en?: string;
  icon?: string;
  color?: string;
  has_children?: boolean;
  parent_id?: string | null;
}

// Initial Mock Datasets
const INITIAL_DATA = {
  clients: [
    {
      id: "cli-1",
      name: "سارة ومحمد الشمري",
      email: "sara.m@example.com",
      phone: "+966 50 123 4567",
      eventType: "حفل زفاف",
      eventDate: "2026-11-20",
      guestsCount: 250,
      status: "upcoming",
    },
    {
      id: "cli-2",
      name: "شركة التقنية المتقدمة",
      email: "events@advancedtech.sa",
      phone: "+966 55 987 6543",
      eventType: "فعالية شركات",
      eventDate: "2026-11-05",
      guestsCount: 120,
      status: "active",
    },
    {
      id: "cli-3",
      name: "فهد العتيبي",
      email: "fahad.o@example.com",
      phone: "+966 54 333 2211",
      eventType: "حفل تخرج",
      eventDate: "2026-11-15",
      guestsCount: 80,
      status: "upcoming",
    },
    {
      id: "cli-4",
      name: "نورة الدوسري",
      email: "noura.d@example.com",
      phone: "+966 56 444 8899",
      eventType: "حفل خطوبة",
      eventDate: "2026-10-30",
      guestsCount: 150,
      status: "completed",
    },
  ] as ClientItem[],

  guests: [
    {
      id: "gst-1",
      name: "د. عبد الله الراجحي",
      phone: "+966 50 999 1122",
      email: "abdullah.r@example.com",
      eventName: "حفل زفاف سارة ومحمد",
      createdAt: "2026-09-27",
      clientName: "سارة ومحمد الشمري",
      category: "vip",
      companions: 1,
      invitationStatus: "viewed",
    },
    {
      id: "gst-2",
      name: "م. خالد السعدون",
      phone: "+966 55 888 2233",
      email: "khaled.s@example.com",
      eventName: "المؤتمر السنوي للتقنية",
      createdAt: "2026-10-12",
      clientName: "شركة التقنية المتقدمة",
      category: "colleagues",
      companions: 0,
      invitationStatus: "sent",
    },
    {
      id: "gst-3",
      name: "أميرة القاسم",
      phone: "+966 54 777 3344",
      email: "amira.q@example.com",
      eventName: "حفل زفاف سارة ومحمد",
      createdAt: "2026-10-13",
      clientName: "سارة ومحمد الشمري",
      category: "family",
      companions: 2,
      invitationStatus: "viewed",
    },
    {
      id: "gst-4",
      name: "سلطان المطيري",
      phone: "+966 56 666 4455",
      email: "sultan.m@example.com",
      eventName: "حفل تخرج فهد",
      createdAt: "2026-10-14",
      clientName: "فهد العتيبي",
      category: "friends",
      companions: 1,
      invitationStatus: "sent",
    },
    {
      id: "gst-5",
      name: "هند الغامدي",
      phone: "+966 53 555 6677",
      email: "hind.g@example.com",
      eventName: "حفل زفاف سارة ومحمد",
      createdAt: "2026-10-15",
      clientName: "سارة ومحمد الشمري",
      category: "friends",
      companions: 0,
      invitationStatus: "pending",
    },
  ] as GuestItem[],

  rsvps: [
    {
      id: "rsvp-1",
      guestName: "د. عبد الله الراجحي",
      phone: "+966 50 999 1122",
      eventName: "حفل زفاف سارة ومحمد",
      response: "attending",
      companions: 1,
      dietary: "regular",
      notes: "نعتز بالحضور ومبروك للعروسين",
      createdAt: "2026-09-27",
    },
    {
      id: "rsvp-2",
      guestName: "أميرة القاسم",
      phone: "+966 54 777 3344",
      eventName: "حفل زفاف سارة ومحمد",
      response: "attending",
      companions: 2,
      dietary: "vegetarian",
      notes: "يرجى توفير وجبة نباتية",
      createdAt: "2026-10-04",
    },
    {
      id: "rsvp-3",
      guestName: "م. خالد السعدون",
      phone: "+966 55 888 2233",
      eventName: "المؤتمر السنوي للتقنية",
      response: "attending",
      companions: 0,
      dietary: "regular",
      createdAt: "2026-10-12",
    },
    {
      id: "rsvp-4",
      guestName: "سلطان المطيري",
      phone: "+966 56 666 4455",
      eventName: "حفل تخرج فهد العتيبي",
      response: "declined",
      companions: 0,
      dietary: "none",
      notes: "أعتذر لارتباطي بالسفر خارج المملكة",
      createdAt: "2026-10-14",
    },
    {
      id: "rsvp-5",
      guestName: "هند الغامدي",
      phone: "+966 53 555 6677",
      eventName: "حفل زفاف سارة ومحمد",
      response: "pending",
      companions: 0,
      dietary: "none",
      createdAt: "2026-10-16",
    },
  ] as RsvpItem[],

  confirmedAttendees: [
    { id: "ca-1", name: "د. عبد الله الراجحي", table: "T-01 (VIP)", checkedIn: true, time: "19:45" },
    { id: "ca-2", name: "أميرة القاسم", table: "T-04", checkedIn: true, time: "20:10" },
    { id: "ca-3", name: "م. خالد السعدون", table: "T-08", checkedIn: false },
    { id: "ca-4", name: "فيصل الحارثي", table: "T-02 (VIP)", checkedIn: false },
    { id: "ca-5", name: "ريم المنصور", table: "T-05", checkedIn: true, time: "20:25" },
  ] as ConfirmedAttendeeItem[],

  events: [
    {
      id: "evt-1",
      title: "حفل زفاف سارة ومحمد الشمري",
      client: "سارة ومحمد الشمري",
      date: "2026-11-20",
      time: "20:00",
      hall: "قاعة لونا الكبرى",
      capacity: 300,
      status: "planned",
    },
    {
      id: "evt-2",
      title: "الملتقى السنوي للابتكار التقني",
      client: "شركة التقنية المتقدمة",
      date: "2026-11-05",
      time: "09:00",
      hall: "قاعة المؤتمرات الدولية",
      capacity: 150,
      status: "ongoing",
    },
    {
      id: "evt-3",
      title: "حفل تخرج دفعة 2026",
      client: "فهد العتيبي",
      date: "2026-11-15",
      time: "18:30",
      hall: "بهو الحفلات الماسي",
      capacity: 100,
      status: "planned",
    },
  ] as EventItem[],

  halls: [
    {
      id: "hall-1",
      name: "قاعة لونا الملكية الكبرى",
      address: "طريق الملك فهد، الرياض",
      capacity: 500,
      tablesCount: 45,
      seatsCount: 450,
      displayOrder: 1,
      status: "available",
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop",
    },
    {
      id: "hall-2",
      name: "قاعة اللؤلؤة للاحتفالات",
      address: "حي النخيل، الرياض",
      capacity: 300,
      tablesCount: 28,
      seatsCount: 280,
      displayOrder: 2,
      status: "available",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop",
    },
    {
      id: "hall-3",
      name: "جناح لونا VIP للمناسبات الخاصة",
      address: "الدرعية، الرياض",
      capacity: 100,
      tablesCount: 10,
      seatsCount: 80,
      displayOrder: 3,
      status: "maintenance",
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop",
    },
  ] as HallItem[],

  invitations: [
    {
      id: "inv-1",
      templateName: "ثيم الورد الملكي الفاخر",
      templateSlug: "royal-bloom",
      brideName: "سارة آل سعود",
      groomName: "محمد آل الشيخ",
      eventDate: "2026-11-20",
      isPublished: true,
      eventTypeName: "حفل زفاف",
      coverUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
      previewUrl: "https://example.com/preview/royal-bloom",
    },
    {
      id: "inv-2",
      templateName: "ثيم ليلة العمر الذهبية",
      templateSlug: "golden-night",
      brideName: "ريم القحطاني",
      groomName: "خالد المطيري",
      eventDate: "2026-12-05",
      isPublished: true,
      eventTypeName: "حفل خطوبة",
      coverUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop",
      previewUrl: "https://example.com/preview/golden-night",
    },
    {
      id: "inv-3",
      templateName: "ثيم الأناقة العصرية",
      templateSlug: "modern-minimal",
      brideName: "نورة الدوسري",
      groomName: "فيصل العتيبي",
      eventDate: "2026-12-18",
      isPublished: false,
      eventTypeName: "حفل زفاف",
      coverUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop",
      previewUrl: "https://example.com/preview/modern-minimal",
    },
    {
      id: "inv-4",
      templateName: "ثيم حفل التخرج البلاتيني",
      templateSlug: "platinum-grad",
      brideName: "",
      groomName: "د. خالد العمري",
      eventDate: "2026-11-15",
      isPublished: true,
      eventTypeName: "حفل تخرج",
      coverUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop",
      previewUrl: "https://example.com/preview/platinum-grad",
    },
    {
      id: "inv-5",
      templateName: "ثيم المؤتمرات والقمم الابتكارية",
      templateSlug: "summit-executive",
      brideName: "",
      groomName: "شركة التقنية المتقدمة",
      eventDate: "2026-11-30",
      isPublished: true,
      eventTypeName: "مؤتمر سنوي",
      coverUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop",
      previewUrl: "https://example.com/preview/summit-executive",
    },
    {
      id: "inv-6",
      templateName: "ثيم المؤتمر الاقتصادي والاستثماري",
      templateSlug: "econ-summit",
      brideName: "",
      groomName: "منتدى الاستثمار الوطني",
      eventDate: "2026-12-10",
      isPublished: false,
      eventTypeName: "مؤتمر سنوي",
      coverUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop",
      previewUrl: "https://example.com/preview/econ-summit",
    },
    {
      id: "inv-7",
      templateName: "ثيم الخطوبة الملكية الكلاسيكي",
      templateSlug: "royal-engagement",
      brideName: "ليلى الناصر",
      groomName: "ياسر الحربي",
      eventDate: "2026-11-28",
      isPublished: false,
      eventTypeName: "حفل خطوبة",
      coverUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop",
      previewUrl: "https://example.com/preview/royal-engagement",
    },
    {
      id: "inv-8",
      templateName: "ثيم احتفال التخرج السنوي المتميز",
      templateSlug: "excellence-grad",
      brideName: "",
      groomName: "جامعة الملك سعود",
      eventDate: "2026-12-01",
      isPublished: false,
      eventTypeName: "حفل تخرج",
      coverUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop",
      previewUrl: "https://example.com/preview/excellence-grad",
    },
  ] as InvitationTemplateItem[],

  eventRequests: [
    {
      id: "req-1",
      name: "حفل زفاف راقي - عائلة الشريف",
      clientName: "أحمد الشريف",
      clientPhone: "+966 50 123 4567",
      hallName: "قاعة لونا الملكية",
      eventTypeName: "حفل زفاف",
      startsAt: "2026-11-15 19:00",
      endsAt: "2026-11-16 01:00",
      guestCount: 350,
      status: "pending",
      notes: "نود إضافة شاشات عرض ترحيبية وتجهيزات خاصة للكوشة الملكية.",
      createdAt: "2026-10-18",
    },
    {
      id: "req-2",
      name: "ملتقى رواد الأعمال والابتكار 2026",
      clientName: "سارة المنصور",
      clientPhone: "+966 55 987 6543",
      hallName: "قاعة الكريستال الكبرى",
      eventTypeName: "مؤتمر سنوي",
      startsAt: "2026-11-20 09:00",
      endsAt: "2026-11-20 17:00",
      guestCount: 200,
      status: "approved",
      notes: "تجهيز مسرح رئيسي مع نظام ترجمة فورية لـ 200 حاضر.",
      createdAt: "2026-10-17",
    },
    {
      id: "req-3",
      name: "حفل تكريم خريجي الطب 2026",
      clientName: "د. خالد العمري",
      clientPhone: "+966 54 333 8899",
      hallName: "حديقة القصر المضيئة",
      eventTypeName: "حفل تخرج",
      startsAt: "2026-11-05 18:00",
      endsAt: "2026-11-05 23:00",
      guestCount: 150,
      status: "rejected",
      rejectionReason: "القاعة محجوزة مسبقاً لصيانة شاملة في هذا التاريخ.",
      notes: "يرجى توفير منصة تكريم وبوفيه عشاء مفتوح.",
      createdAt: "2026-10-15",
    },
  ] as EventRequestItem[],

  eventLayouts: [
    {
      id: "lay-1",
      eventId: "ev-1",
      eventName: "حفل زفاف سارة ومحمد",
      clientName: "سارة أحمد",
      hallName: "قاعة لونا الملكية",
      eventDate: "2026-10-25",
      totalGuests: 250,
      seatedGuests: 220,
      tablesCount: 25,
      hasLayout: true,
    },
    {
      id: "lay-2",
      eventId: "ev-2",
      eventName: "مؤتمر التقنية والذكاء الاصطناعي",
      clientName: "شركة الابتكار الرقمي",
      hallName: "قاعة الكريستال الكبرى",
      eventDate: "2026-11-10",
      totalGuests: 180,
      seatedGuests: 180,
      tablesCount: 18,
      hasLayout: true,
    },
    {
      id: "lay-3",
      eventId: "ev-3",
      eventName: "حفل تدشين الهوية المؤسسية الجديدة",
      clientName: "مجموعة العليان القابضة",
      hallName: "حديقة القصر المضيئة",
      eventDate: "2026-12-01",
      totalGuests: 120,
      seatedGuests: 0,
      tablesCount: 12,
      hasLayout: false,
    },
  ] as EventLayoutItem[],

  notes: [
    {
      id: "not-1",
      subject: "ملاحظات تنظيم حفل الافتتاح",
      content: "التأكد من جاهزية كروت الدعوة VIP والشاشات التفاعلية قبل الموعد بـ 3 ساعات.",
      priority: "high",
      date: "2026-10-18",
    },
    {
      id: "not-2",
      subject: "قائمة احتياجات المطبخ والبوفيه",
      content: "توفير 50 وجبة نباتية خاصة وإضافة ركن قهوة مختصة في بهو الاستقبال.",
      priority: "medium",
      date: "2026-10-17",
    },
    {
      id: "not-3",
      subject: "متابعة مع مشرفي القاعات",
      content: "جدولة مواعيد الاستلام والتسليم والتأكد من إضاءة الكوشة والصوتيات.",
      priority: "low",
      date: "2026-10-16",
    },
  ] as NoteItem[],

  broadcasts: [
    {
      id: "brd-1",
      title: "تحديث مواعيد الدخول وبوابات الاستقبال",
      message: "نحيطكم علماً بأن استقبال الضيوف سيبدأ في تمام الساعة 7:30 مساءً عبر البوابة رقم 2.",
      audience: "جميع الضيوف المؤكدين",
      sentDate: "2026-10-18 16:30",
      recipients: 180,
      status: "sent",
    },
    {
      id: "brd-2",
      title: "تذكير بارتداء الزي الرسمي الموحد",
      message: "نرجو الالتزام بالزي الرسمي لحفل التكريم السنوي لعام 2026.",
      audience: "فئة VIP والشركاء",
      sentDate: "2026-10-17 11:00",
      recipients: 45,
      status: "sent",
    },
  ] as BroadcastItem[],

  roles: [
    { id: "rol-1", roleName: "مدير عام النظام (Super Admin)", description: "كامل الصلاحيات والإشراف المالي والتقني", usersCount: 2 },
    { id: "rol-2", roleName: "منسق فعاليات (Coordinator)", description: "إدارة الفعاليات والمدعوين والتأكيدات", usersCount: 5 },
    { id: "rol-3", roleName: "موظف استقبال (Receptionist)", description: "تسجيل حضور الضيوف وطباعة الباجات", usersCount: 4 },
  ] as RoleItem[],

  adminAssistants: [
    { id: "ast-1", name: "عبد العزيز التميمي", email: "abdulaziz@luna.sa", role: "مدير عام النظام", lastLogin: "اليوم، 14:20", status: "active" },
    { id: "ast-2", name: "مها العتيبي", email: "maha@luna.sa", role: "منسق فعاليات", lastLogin: "أمس، 18:40", status: "active" },
  ] as AssistantItem[],

  memories: [
    { id: "mem-1", event: "حفل زفاف سارة ومحمد", caption: "لحظة تقطيع كعكة الزفاف الملكية", date: "2026-10-18", mediaUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop" },
    { id: "mem-2", event: "ملتقى التقنية المتقدمة", caption: "الجلسة الحوارية الرئيسية", date: "2026-10-15", mediaUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop" },
    { id: "mem-3", event: "حفل خطوبة نورة", caption: "ديكورات وتنسيقات الورود الطبيعية", date: "2026-10-10", mediaUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop" },
  ] as MemoryItem[],

  lookups: [
    {
      id: "lok-1",
      category: "أنواع المناسبات",
      key: "WEDDING",
      value: "حفل زفاف",
      name: "حفل زفاف",
      name_ar: "حفل زفاف",
      name_en: "Wedding",
      lookup_code: "WEDDING",
      lookup_type: "أنواع المناسبات",
      display_order: 1,
      is_active: true,
      status: { label: "معتمد", value: "approved" },
      description: "حفلات الزفاف والأعراس وقاعات الاحتفال الكبرى",
      description_ar: "حفلات الزفاف والأعراس وقاعات الاحتفال الكبرى",
      description_en: "Grand weddings, matrimonial receptions and banquet events",
      has_children: true,
    },
    {
      id: "lok-2",
      category: "أنواع المناسبات",
      key: "ENGAGEMENT",
      value: "حفل خطوبة",
      name: "حفل خطوبة",
      name_ar: "حفل خطوبة",
      name_en: "Engagement",
      lookup_code: "ENGAGEMENT",
      lookup_type: "أنواع المناسبات",
      display_order: 2,
      is_active: true,
      status: { label: "معتمد", value: "approved" },
      description: "مراسم وحفلات الخطوبة العائلية والخاصة",
      description_ar: "مراسم وحفلات الخطوبة العائلية والخاصة",
      description_en: "Engagement ceremonies and family private receptions",
      has_children: false,
    },
    {
      id: "lok-3",
      category: "درجات القرابة",
      key: "FIRST_DEGREE",
      value: "قرابة درجة أولى",
      name: "قرابة درجة أولى",
      name_ar: "قرابة درجة أولى",
      name_en: "First Degree Relative",
      lookup_code: "FIRST_DEGREE",
      lookup_type: "درجات القرابة",
      display_order: 1,
      is_active: true,
      status: { label: "معتمد", value: "approved" },
      description: "الوالدان والأبناء والإخوة والزوج والزوجة",
      description_ar: "الوالدان والأبناء والإخوة والزوج والزوجة",
      description_en: "Parents, children, siblings, and spouse",
      has_children: false,
    },
    {
      id: "lok-4",
      category: "أنظمة الطعام",
      key: "VEGAN",
      value: "نباتي تام",
      name: "نباتي تام",
      name_ar: "نباتي تام",
      name_en: "Vegan",
      lookup_code: "VEGAN",
      lookup_type: "أنظمة الطعام",
      display_order: 1,
      is_active: true,
      status: { label: "معتمد", value: "approved" },
      description: "وجبات خالية تماماً من المنتجات والمشتقات الحيوانية",
      description_ar: "وجبات خالية تماماً من المنتجات والمشتقات الحيوانية",
      description_en: "100% plant-based meals strictly free from animal products",
      has_children: false,
    },
    {
      id: "lok-5",
      category: "أنواع المناسبات",
      key: "GRADUATION",
      value: "حفل تخرج",
      name: "حفل تخرج",
      name_ar: "حفل تخرج",
      name_en: "Graduation",
      lookup_code: "GRADUATION",
      lookup_type: "أنواع المناسبات",
      display_order: 3,
      is_active: true,
      status: { label: "معتمد", value: "approved" },
      description: "حفلات التخرج الجامعي والمدرسي والاحتفاء بالطلبة",
      description_ar: "حفلات التخرج الجامعي والمدرسي والاحتفاء بالطلبة",
      description_en: "University and school graduation celebrations",
      has_children: false,
    },
    {
      id: "lok-6",
      category: "أنواع المناسبات",
      key: "CONFERENCE",
      value: "مؤتمر سنوي",
      name: "مؤتمر سنوي",
      name_ar: "مؤتمر سنوي",
      name_en: "Conference",
      lookup_code: "CONFERENCE",
      lookup_type: "أنواع المناسبات",
      display_order: 4,
      is_active: true,
      status: { label: "معتمد", value: "approved" },
      description: "المؤتمرات المهنية وندوات الشركات والملتقيات السنوية",
      description_ar: "المؤتمرات المهنية وندوات الشركات والملتقيات السنوية",
      description_en: "Professional conferences, business seminars and corporate meetings",
      has_children: false,
    },
    {
      id: "lok-7",
      category: "فئات الضيوف",
      key: "VIP",
      value: "كبار الشخصيات (VIP)",
      name: "كبار الشخصيات (VIP)",
      name_ar: "كبار الشخصيات (VIP)",
      name_en: "VIP Guests",
      lookup_code: "VIP",
      lookup_type: "فئات الضيوف",
      display_order: 1,
      is_active: true,
      status: { label: "معتمد", value: "approved" },
      description: "الضيوف ذوو المكانة الخاصة وأصحاب المقاعد الأمامية",
      description_ar: "الضيوف ذوو المكانة الخاصة وأصحاب المقاعد الأمامية",
      description_en: "Distinguished guests with priority seating and personalized service",
      has_children: false,
    },
    {
      id: "lok-8",
      category: "درجات القرابة",
      key: "SECOND_DEGREE",
      value: "قرابة درجة ثانية",
      name: "قرابة درجة ثانية",
      name_ar: "قرابة درجة ثانية",
      name_en: "Second Degree Relative",
      lookup_code: "SECOND_DEGREE",
      lookup_type: "درجات القرابة",
      display_order: 2,
      is_active: true,
      status: { label: "معتمد", value: "approved" },
      description: "الأجداد والأعمام والأخوال وأبناء العمومة",
      description_ar: "الأجداد والأعمام والأخوال وأبناء العمومة",
      description_en: "Grandparents, uncles, aunts, and first cousins",
      has_children: false,
    },
    {
      id: "lok-9",
      category: "أنظمة الطعام",
      key: "GLUTEN_FREE",
      value: "خالي من الجلوتين",
      name: "خالي من الجلوتين",
      name_ar: "خالي من الجلوتين",
      name_en: "Gluten Free",
      lookup_code: "GLUTEN_FREE",
      lookup_type: "أنظمة الطعام",
      display_order: 2,
      is_active: true,
      status: { label: "معتمد", value: "approved" },
      description: "وجبات مخصصة للأشخاص الذين يعانون من حساسية القمح والجلوتين",
      description_ar: "وجبات مخصصة للأشخاص الذين يعانون من حساسية القمح والجلوتين",
      description_en: "Special diet meal prepared strictly without wheat gluten",
      has_children: false,
    },
    {
      id: "lok-10",
      category: "حالات الحضور",
      key: "ATTENDING",
      value: "مؤكد الحضور",
      name: "مؤكد الحضور",
      name_ar: "مؤكد الحضور",
      name_en: "Attending",
      lookup_code: "ATTENDING",
      lookup_type: "حالات الحضور",
      display_order: 1,
      is_active: true,
      status: { label: "معتمد", value: "approved" },
      description: "حالة الضيف الذي أكد حضوره للمناسبة عبر الرابط",
      description_ar: "حالة الضيف الذي أكد حضوره للمناسبة عبر الرابط",
      description_en: "Guest confirmed their attendance through the RSVP link",
      has_children: false,
    },
  ] as LookupItem[],
};

type CollectionName = keyof typeof INITIAL_DATA;

// Get collection from SessionStorage or init
export function getCollection<T>(collection: CollectionName): T[] {
  if (typeof window === "undefined") {
    return (INITIAL_DATA[collection] || []) as unknown as T[];
  }
  const key = STORAGE_PREFIX + collection;
  const stored = sessionStorage.getItem(key);
  if (!stored) {
    const initial = INITIAL_DATA[collection] || [];
    sessionStorage.setItem(key, JSON.stringify(initial));
    return initial as unknown as T[];
  }
  try {
    const parsed = JSON.parse(stored) as T[];
    if (collection === "guests" && Array.isArray(parsed)) {
      let migrated = false;
      const defaultDates = ["2026-09-27", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15"];
      const updated = parsed.map((item, idx) => {
        const g = item as unknown as GuestItem;
        if (!g.createdAt) {
          migrated = true;
          return { ...g, createdAt: defaultDates[idx % defaultDates.length] };
        }
        return item;
      });
      if (migrated) {
        sessionStorage.setItem(key, JSON.stringify(updated));
        return updated as unknown as T[];
      }
    }
    if (collection === "invitations" && Array.isArray(parsed)) {
      const defaultTypes = ["حفل زفاف", "حفل خطوبة", "حفل زفاف", "حفل تخرج", "مؤتمر سنوي"];
      let needsRefresh = parsed.length < INITIAL_DATA.invitations.length;
      const updated = parsed.map((item, idx) => {
        const inv = item as unknown as InvitationTemplateItem;
        let cover = inv.coverUrl;
        if (cover && cover.includes("1523050854058")) {
          needsRefresh = true;
          cover = inv.id === "inv-8"
            ? "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop";
        }
        if (!inv.eventTypeName || cover !== inv.coverUrl) {
          needsRefresh = true;
          return {
            ...inv,
            eventTypeName: inv.eventTypeName || defaultTypes[idx % defaultTypes.length],
            coverUrl: cover,
          };
        }
        return item;
      });
      if (needsRefresh) {
        sessionStorage.setItem(key, JSON.stringify(updated));
        return updated as unknown as T[];
      }
      return updated as unknown as T[];
    }
    if (collection === "lookups" && Array.isArray(parsed)) {
      let migrated = false;
      const updated = parsed.map((item, idx) => {
        const lok = item as unknown as LookupItem;
        if (!lok.lookup_code || !lok.name || lok.is_active === undefined || !lok.status) {
          migrated = true;
          return {
            ...lok,
            name: lok.name || lok.value,
            name_ar: lok.name_ar || lok.value,
            name_en: lok.name_en || lok.key,
            lookup_code: lok.lookup_code || lok.key,
            lookup_type: lok.lookup_type || lok.category,
            display_order: lok.display_order ?? (idx + 1),
            is_active: lok.is_active ?? true,
            status: lok.status || { label: "معتمد", value: "approved" },
            description: lok.description || `${lok.value} - ${lok.category}`,
            description_ar: lok.description_ar || `${lok.value} - ${lok.category}`,
            description_en: lok.description_en || `${lok.key} reference`,
            has_children: lok.has_children ?? false,
          };
        }
        return item;
      });
      if (migrated || parsed.length < INITIAL_DATA.lookups.length) {
        const result = parsed.length < INITIAL_DATA.lookups.length ? INITIAL_DATA.lookups : updated;
        sessionStorage.setItem(key, JSON.stringify(result));
        return result as unknown as T[];
      }
      return updated as unknown as T[];
    }
    return parsed;
  } catch {
    return (INITIAL_DATA[collection] || []) as unknown as T[];
  }
}

// Save collection to SessionStorage & dispatch custom event for reactive UI
export function saveCollection<T>(collection: CollectionName, items: T[]): void {
  if (typeof window === "undefined") return;
  const key = STORAGE_PREFIX + collection;
  sessionStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("mock_storage_change", { detail: { collection } }));
}

// CRUD Operations
export function createItem<T extends { id: string }>(collection: CollectionName, item: Omit<T, "id">): T {
  const items = getCollection<T>(collection);
  const newItem = {
    ...item,
    id: `${collection.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  } as T;
  const updated = [newItem, ...items];
  saveCollection(collection, updated);
  return newItem;
}

export function updateItem<T extends { id: string }>(collection: CollectionName, id: string, updates: Partial<T>): T | null {
  const items = getCollection<T>(collection);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const updatedItem = { ...items[index], ...updates };
  items[index] = updatedItem;
  saveCollection(collection, items);
  return updatedItem;
}

export function deleteItem<T extends { id: string }>(collection: CollectionName, id: string): boolean {
  const items = getCollection<T>(collection);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  saveCollection(collection, filtered);
  return true;
}

// Reset everything to initial demo data
export function resetAllDemoData(): void {
  if (typeof window === "undefined") return;
  for (const coll in INITIAL_DATA) {
    const key = STORAGE_PREFIX + coll;
    sessionStorage.setItem(key, JSON.stringify(INITIAL_DATA[coll as CollectionName]));
  }
  window.dispatchEvent(new CustomEvent("mock_storage_reset"));
}

// React Hook to consume a collection reactively
export function useMockCollection<T extends { id: string }>(collection: CollectionName) {
  const [data, setData] = useState<T[]>(() => getCollection<T>(collection));

  const refresh = useCallback(() => {
    setData(getCollection<T>(collection));
  }, [collection]);

  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ collection?: string }>;
      if (!customEvent.detail || customEvent.detail.collection === collection) {
        refresh();
      }
    };

    const handleReset = () => {
      refresh();
    };

    window.addEventListener("mock_storage_change", handleStorageChange);
    window.addEventListener("mock_storage_reset", handleReset);
    return () => {
      window.removeEventListener("mock_storage_change", handleStorageChange);
      window.removeEventListener("mock_storage_reset", handleReset);
    };
  }, [collection, refresh]);

  const add = useCallback((item: Omit<T, "id">) => createItem<T>(collection, item), [collection]);
  const update = useCallback((id: string, updates: Partial<T>) => updateItem<T>(collection, id, updates), [collection]);
  const remove = useCallback((id: string) => deleteItem<T>(collection, id), [collection]);

  return {
    data,
    add,
    update,
    remove,
    refresh,
  };
}
