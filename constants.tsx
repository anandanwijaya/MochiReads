
import { Book } from './types';

/**
 * MOCK_BOOKS: A curated collection of 76 books.
 * 4 books per language for all 19 supported languages.
 */
const generateBooks = (): Book[] => {
  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Malay', code: 'ms' },
    { name: 'Indonesian', code: 'id' },
    { name: 'Chinese', code: 'zh' },
    { name: 'Thai', code: 'th' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Korean', code: 'ko' },
    { name: 'Tagalog', code: 'tl' },
    { name: 'Lao', code: 'lo' },
    { name: 'Khmer', code: 'km' },
    { name: 'Arabic', code: 'ar' },
    { name: 'German', code: 'de' },
    { name: 'French', code: 'fr' },
    { name: 'Spanish', code: 'es' },
    { name: 'Dutch', code: 'nl' },
    { name: 'Russian', code: 'ru' },
    { name: 'Italian', code: 'it' },
    { name: 'Portuguese', code: 'pt' },
    { name: 'Turkish', code: 'tr' }
  ];

  const categories = ['Animal Stories', 'Science', 'Adventure', 'Folk Tales', 'Life Skills'];
  
  // Localized Titles Dictionary
  const localTitles: Record<string, string[]> = {
    th: ["ลูกช้างผู้กล้าหาญ", "เพื่อนรักในป่าใหญ่", "ความลับของดวงจันทร์", "หุ่นยนต์ทำขนม"],
    ko: ["용감한 꼬마 코끼리", "숲속의 단짝 친구들", "달님의 비밀", "로봇 제빵사"],
    tl: ["Ang Matapang na Elepante", "Mga Kaibigan sa Gubat", "Ang Lihim ng Buwan", "Ang Robot na Panadero"],
    lo: ["ຊ້າງນ້ອຍຜູ້ກ້າຫານ", "ເພື່ອນຮັກໃນປ່າໃຫຍ່", "ຄວາມລັບຂອງດວງຈັນ", "ຫຸ່ນຍົນເຮັດຂະໜົມ"],
    km: ["ដំរីតូចដ៏ក្លាហាន", "មិត្តសម្លាញ់ក្នុងព្រៃធំ", "អាថ៌កំបាំងនៃព្រះច័ន្ទ", "រ៉ូបូតធ្វើនំ"],
    ar: ["الفيل الصغير الشجاع", "أصدقاء الغابة العظماء", "سر القمر الغامض", "الروبوت الخباز"],
    de: ["Der mutige kleine Elefant", "Beste Freunde im Wald", "Das Geheimnis des Mondes", "Der Roboter-Bäcker"],
    fr: ["Le petit éléphant courageux", "Meilleurs amis de la forêt", "Le secret de la lune", "Le robot pâtissier"],
    es: ["El pequeño elefante valiente", "Mejores amigos del bosque", "El secreto de la luna", "El robot panadero"],
    nl: ["De dappere kleine olifant", "Beste vrienden in het bos", "Het geheim van de maan", "De robotbakker"],
    ru: ["Храбрый маленький слоненок", "Лучшие друзья в лесу", "Тайна луны", "Робот-пекарь"],
    it: ["Il piccolo elefante coraggioso", "Migliori amici nella foresta", "Il segreto della luna", "Il robot panettiere"],
    pt: ["O pequeno elefante corajoso", "Melhores amigos da floresta", "O segredo da lua", "O robô padeiro"],
    tr: ["Cesur Küçük Fil", "Ormandaki En İyi Arkadaşlar", "Ay'ın Sırrı", "Robot Fırıncı"]
  };

  const books: Book[] = [];

  languages.forEach((lang) => {
    for (let i = 1; i <= 4; i++) {
      const id = `${lang.code}-${i}`;
      const category = categories[(i + lang.code.charCodeAt(0)) % categories.length];
      
      let title = `Story ${i} in ${lang.name}`;
      let desc = `A wonderful ${category.toLowerCase()} adventure for kids in ${lang.name}.`;
      
      // Use localization dictionary if available
      if (localTitles[lang.code]) {
        title = localTitles[lang.code][i-1];
      } else if (lang.code === 'en') {
        const enTitles = ["The Brave Little Elephant", "Best Friends in the Wild", "Secret of the Moon", "The Robot Baker"];
        title = enTitles[i-1];
      } else if (lang.code === 'ms') {
        const msTitles = ["Sang Kancil yang Berani", "Kawan Baik di Hutan", "Rahsia Bulan", "Robot Pembuat Kek"];
        title = msTitles[i-1];
      } else if (lang.code === 'id') {
        const idTitles = ["Petualangan Si Kancil", "Sahabat Hutan", "Rahasia Rembulan", "Robot Pembuat Roti"];
        title = idTitles[i-1];
      } else if (lang.code === 'zh') {
        const zhTitles = ["勇敢的小象", "森林里的好朋友", "月亮的秘密", "机器人面包师"];
        title = zhTitles[i-1];
      } else if (lang.code === 'ja') {
        const jaTitles = ["勇気ある子象", "森の大親友", "お月様の秘密", "ロボットのパン屋さん"];
        title = jaTitles[i-1];
      }

      books.push({
        id,
        title,
        author: i % 2 === 0 ? 'Mochi Librarian' : 'The Magic Lab',
        illustrator: 'Magic Brush AI',
        description: desc,
        coverImage: `https://picsum.photos/seed/cover-${id}/400/600`,
        language: lang.name,
        level: ((i + lang.name.length) % 5) + 1,
        tags: [category, 'Top Pick'],
        pages: [
          `Welcome to this beautiful story in ${lang.name}.`,
          `On page two, the adventure truly begins!`,
          `The hero shows us that kindness is magic.`,
          `They lived happily ever after in our ${lang.name} tale.`
        ]
      });
    }
  });

  return books;
};

export const MOCK_BOOKS: Book[] = generateBooks();
