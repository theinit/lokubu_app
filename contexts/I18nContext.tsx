import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en' | 'zh';

type TranslationKey = 
  | 'header.login' | 'header.register' | 'header.logo'
  | 'profile.editProfile' | 'profile.createExperience' | 'profile.myExperiences' | 'profile.logout'
  | 'home.title' | 'home.subtitle' | 'home.searchPlaceholder' | 'home.exploreButton'
  | 'home.mapTitle' | 'home.mapSubtitle' | 'home.exploreTitle' | 'home.exploreSubtitle'
  | 'home.errorTitle' | 'home.noExperiences' | 'home.noExperiencesSubtitle'
  | 'search.placeholder' | 'search.button'
  | 'category.all' | 'category.adventure' | 'category.culture' | 'category.food'
  | 'category.nature' | 'category.history'
  | 'experience.viewDetails' | 'experience.by' | 'experience.location' | 'experience.date'
  | 'footer.rights'
  | 'language.spanish' | 'language.english' | 'language.chinese'
  | 'common.loading' | 'common.error' | 'common.success' | 'common.cancel'
  | 'common.save' | 'common.delete' | 'common.edit' | 'common.create' | 'common.back';

type Translations = Record<Language, Record<TranslationKey, string>>;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Traducciones
const translations: Translations = {
  es: {
    // Header
    'header.login': 'Iniciar Sesión',
    'header.register': 'Registrarse',
    'header.logo': 'LOKUBU',
    
    // Profile Dropdown
    'profile.editProfile': 'Editar Perfil',
    'profile.createExperience': 'Crear Experiencia',
    'profile.myExperiences': 'Mis Experiencias',
    'profile.logout': 'Cerrar Sesión',
    
    // Home Page
    'home.title': 'Descubre el Mundo',
    'home.subtitle': 'Encuentra experiencias únicas y auténticas en cualquier destino del mundo',
    'home.searchPlaceholder': '¿A dónde quieres ir? (ciudad, región, país...)',
    'home.exploreButton': 'Explorar Experiencias',
    'home.mapTitle': 'Descubre Experiencias en el Mapa',
    'home.mapSubtitle': 'Encuentra tu próxima aventura explorando las actividades cercanas a ti.',
    'home.exploreTitle': 'Explora Todas las Experiencias',
    'home.exploreSubtitle': 'Filtra y encuentra tu aventura perfecta, guiada por apasionados locales.',
    'home.errorTitle': 'Error al Cargar Datos',
    'home.noExperiences': 'No se encontraron experiencias',
    'home.noExperiencesSubtitle': 'Intenta ajustar tus filtros de búsqueda para encontrar más aventuras.',
    
    // Search Bar
    'search.placeholder': 'Buscar experiencias...',
    'search.button': 'Buscar',
    
    // Categories
    'category.all': 'Todas',
    'category.adventure': 'Aventura',
    'category.culture': 'Cultura',
    'category.food': 'Gastronomía',
    'category.nature': 'Naturaleza',
    'category.history': 'Historia',
    
    // Experience Card
    'experience.viewDetails': 'Ver Detalles',
    'experience.by': 'por',
    'experience.location': 'Ubicación',
    'experience.date': 'Fecha',
    
    // Footer
    'footer.rights': 'Todos los derechos reservados.',
    
    // Language Selector
    'language.spanish': 'Español',
    'language.english': 'English',
    'language.chinese': '中文',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.back': 'Volver'
  },
  en: {
    // Header
    'header.login': 'Login',
    'header.register': 'Register',
    'header.logo': 'LOKUBU',
    
    // Profile Dropdown
    'profile.editProfile': 'Edit Profile',
    'profile.createExperience': 'Create Experience',
    'profile.myExperiences': 'My Experiences',
    'profile.logout': 'Logout',
    
    // Home Page
    'home.title': 'Discover the World',
    'home.subtitle': 'Find unique and authentic experiences in any destination around the world',
    'home.searchPlaceholder': 'Where do you want to go? (city, region, country...)',
    'home.exploreButton': 'Explore Experiences',
    'home.mapTitle': 'Discover Experiences on the Map',
    'home.mapSubtitle': 'Find your next adventure by exploring activities near you.',
    'home.exploreTitle': 'Explore All Experiences',
    'home.exploreSubtitle': 'Filter and find your perfect adventure, guided by passionate locals.',
    'home.errorTitle': 'Error Loading Data',
    'home.noExperiences': 'No experiences found',
    'home.noExperiencesSubtitle': 'Try adjusting your search filters to find more adventures.',
    
    // Search Bar
    'search.placeholder': 'Search experiences...',
    'search.button': 'Search',
    
    // Categories
    'category.all': 'All',
    'category.adventure': 'Adventure',
    'category.culture': 'Culture',
    'category.food': 'Food',
    'category.nature': 'Nature',
    'category.history': 'History',
    
    // Experience Card
    'experience.viewDetails': 'View Details',
    'experience.by': 'by',
    'experience.location': 'Location',
    'experience.date': 'Date',
    
    // Footer
    'footer.rights': 'All rights reserved.',
    
    // Language Selector
    'language.spanish': 'Español',
    'language.english': 'English',
    'language.chinese': '中文',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.back': 'Back'
  },
  zh: {
    // Header
    'header.login': '登录',
    'header.register': '注册',
    'header.logo': 'LOKUBU',
    
    // Profile Dropdown
    'profile.editProfile': '编辑资料',
    'profile.createExperience': '创建体验',
    'profile.myExperiences': '我的体验',
    'profile.logout': '退出登录',
    
    // Home Page
    'home.title': '发现世界',
    'home.subtitle': '在世界任何目的地找到独特而真实的体验',
    'home.searchPlaceholder': '您想去哪里？（城市、地区、国家...）',
    'home.exploreButton': '探索体验',
    'home.mapTitle': '在地图上发现体验',
    'home.mapSubtitle': '通过探索您附近的活动找到您的下一次冒险。',
    'home.exploreTitle': '探索所有体验',
    'home.exploreSubtitle': '筛选并找到您完美的冒险，由热情的当地人指导。',
    'home.errorTitle': '加载数据错误',
    'home.noExperiences': '未找到体验',
    'home.noExperiencesSubtitle': '尝试调整您的搜索过滤器以找到更多冒险。',
    
    // Search Bar
    'search.placeholder': '搜索体验...',
    'search.button': '搜索',
    
    // Categories
    'category.all': '全部',
    'category.adventure': '冒险',
    'category.culture': '文化',
    'category.food': '美食',
    'category.nature': '自然',
    'category.history': '历史',
    
    // Experience Card
    'experience.viewDetails': '查看详情',
    'experience.by': '由',
    'experience.location': '位置',
    'experience.date': '日期',
    
    // Footer
    'footer.rights': '版权所有。',
    
    // Language Selector
    'language.spanish': 'Español',
    'language.english': 'English',
    'language.chinese': '中文',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.create': '创建',
    'common.back': '返回'
  }
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Obtener idioma guardado del localStorage o usar español por defecto
    const savedLanguage = localStorage.getItem('lokubu-language') as Language;
    return savedLanguage || 'es';
  });

  useEffect(() => {
    // Guardar idioma en localStorage cuando cambie
    localStorage.setItem('lokubu-language', language);
  }, [language]);

  const t = (key: string): string => {
    const languageTranslations = translations[language];
    return (languageTranslations as Record<string, string>)[key] || key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nContext;