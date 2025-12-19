
import { AppLanguage } from './types';

const baseStrings = {
  library: 'Library',
  magicLab: 'Magic Lab',
  recent: 'Recent',
  favorites: 'Favorites',
  forYou: 'For You',
  signIn: 'Sign In',
  signOut: 'Sign Out',
  adventureAwaits: 'ADVENTURE AWAITS!',
  heroTitle: 'Read, Play, Learn & Create!',
  heroSubtitle: 'Welcome to the world\'s most magical library! Discover amazing stories or let our AI help you write your very own.',
  startReading: 'Start Reading',
  magicStoryLab: 'Magic Story Lab',
  stories: 'Stories',
  languages: 'Languages',
  friends: 'Friends',
  myFavorites: 'My Favorites',
  readAgain: 'Read Again',
  magicalLabPicks: 'Magical Lab Picks',
  magicalStories: 'Magical Stories',
  tryTheseIdeas: 'Try these ideas',
  letsGo: 'LET\'S GO!',
  magicking: 'MAGICKING...',
  reviewTale: 'Review Your Magic Tale',
  publishStory: 'PUBLISH STORY',
  saving: 'SAVING...',
  level: 'Level',
  all: 'All',
  languageName: 'English',
  adventureMap: 'Adventure Map',
  stickers: 'Stickers'
};

export const translations: Record<AppLanguage, any> = {
  en: baseStrings,
  ms: { ...baseStrings, library: 'Perpustakaan', magicLab: 'Makmal Ajaib', recent: 'Terbaru', favorites: 'Kegemaran', signIn: 'Log Masuk', signOut: 'Log Keluar', languageName: 'Bahasa Melayu' },
  id: { ...baseStrings, library: 'Perpustakaan', magicLab: 'Lab Ajaib', recent: 'Terbaru', favorites: 'Favorit', signIn: 'Masuk', signOut: 'Keluar', languageName: 'Bahasa Indonesia' },
  zh: { ...baseStrings, library: '图书馆', magicLab: '魔法实验室', recent: '最近阅读', favorites: '我的收藏', signIn: '登录', signOut: '退出登录', languageName: '简体中文' },
  th: { ...baseStrings, library: 'ห้องสมุด', magicLab: 'แล็บมหัศจรรย์', recent: 'ล่าสุด', favorites: 'รายการโปรด', signIn: 'เข้าสู่ระบบ', signOut: 'ออกจากระบบ', languageName: 'ไทย' },
  ja: { ...baseStrings, library: 'としょかん', magicLab: 'まほうのラボ', recent: 'さいきん', favorites: 'お気に入り', signIn: 'ログイン', signOut: 'ログアウト', languageName: '日本語' },
  ko: { ...baseStrings, library: '도서관', magicLab: '마법 실험실', recent: '최근 본 항목', favorites: '즐겨찾기', signIn: '로그인', signOut: '로그아웃', languageName: '한국어' },
  tl: { ...baseStrings, library: 'Aklatan', magicLab: 'Magic Lab', recent: 'Kamakailan', favorites: 'Mga Paborito', signIn: 'Mag-sign In', signOut: 'Mag-sign Out', languageName: 'Tagalog' },
  lo: { ...baseStrings, library: 'ຫໍສະໝຸດ', magicLab: 'ແລັບມະຫັດສະຈັນ', recent: 'ຫຼ້າສຸດ', favorites: 'ລາຍການທີ່ມັກ', signIn: 'ເຂົ້າສູ່ລະບົບ', signOut: 'ອອກຈາກລະບົບ', languageName: 'ພາສາລາວ' },
  km: { ...baseStrings, library: 'បណ្ណាល័យ', magicLab: 'មន្ទីរពិសោធន៍មន្តអាគម', recent: 'ថ្មីៗ', favorites: 'ដែលចូលចិត្ត', signIn: 'ចូលប្រើ', signOut: 'ចាកចេញ', languageName: 'ភាសាខ្មែរ' },
  ar: { ...baseStrings, library: 'المكتبة', magicLab: 'المختبر السحري', recent: 'الأخيرة', favorites: 'المفضلة', signIn: 'تسجيل الدخول', signOut: 'تسجيل الخروج', languageName: 'العربية' },
  de: { ...baseStrings, library: 'Bibliothek', magicLab: 'Zauberlabor', recent: 'Zuletzt', favorites: 'Favoriten', signIn: 'Anmelden', signOut: 'Abmelden', languageName: 'Deutsch' },
  fr: { ...baseStrings, library: 'Bibliothèque', magicLab: 'Labo Magique', recent: 'Récents', favorites: 'Favoris', signIn: 'Connexion', signOut: 'Déconnexion', languageName: 'Français' },
  es: { ...baseStrings, library: 'Biblioteca', magicLab: 'Laboratorio Mágico', recent: 'Recientes', favorites: 'Favoritos', signIn: 'Iniciar Sesión', signOut: 'Cerrar Sesión', languageName: 'Español' },
  nl: { ...baseStrings, library: 'Bibliotheek', magicLab: 'Magisch Lab', recent: 'Recent', favorites: 'Favorieten', signIn: 'Inloggen', signOut: 'Uitloggen', languageName: 'Nederlands' },
  ru: { ...baseStrings, library: 'Библиотека', magicLab: 'Волшебная лаборатория', recent: 'Недавние', favorites: 'Избранное', signIn: 'Войти', signOut: 'Выйти', languageName: 'Русский' },
  it: { ...baseStrings, library: 'Biblioteca', magicLab: 'Laboratorio Magico', recent: 'Recenti', favorites: 'Preferiti', signIn: 'Accedi', signOut: 'Esci', languageName: 'Italiano' },
  pt: { ...baseStrings, library: 'Biblioteca', magicLab: 'Laboratório Mágico', recent: 'Recentes', favorites: 'Favoritos', signIn: 'Entrar', signOut: 'Sair', languageName: 'Português' },
  tr: { ...baseStrings, library: 'Kütüphane', magicLab: 'Sihirli Laboratuvar', recent: 'Son Okunanlar', favorites: 'Favoriler', signIn: 'Giriş Yap', signOut: 'Çıkış Yap', languageName: 'Türkçe' },
  vi: { ...baseStrings, library: 'Thư viện', magicLab: 'Phòng Thí Nghiệm', recent: 'Gần đây', favorites: 'Yêu thích', signIn: 'Đăng nhập', signOut: 'Đăng xuất', languageName: 'Tiếng Việt' }
};

export const getTranslation = (lang: AppLanguage, key: keyof typeof baseStrings) => {
  return translations[lang]?.[key] || translations['en'][key];
};
