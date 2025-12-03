// Algerian phone number validation (starts with 05, 06, 07 and is 10 digits)
export const ALGERIAN_PHONE_REGEX = /^(05|06|07)\d{8}$/;

export const validateAlgerianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\s+/g, '');
  return ALGERIAN_PHONE_REGEX.test(cleaned);
};

export const formatDZD = (amount: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// List of all 58 Algerian wilayas with their codes
export const WILAYAS = [
  { code: '01', name: 'Adrar' },
  { code: '02', name: 'Chlef' },
  { code: '03', name: 'Laghouat' },
  { code: '04', name: 'Oum El Bouaghi' },
  { code: '05', name: 'Batna' },
  { code: '06', name: 'Béjaïa' },
  { code: '07', name: 'Biskra' },
  { code: '08', name: 'Béchar' },
  { code: '09', name: 'Blida' },
  { code: '10', name: 'Bouira' },
  { code: '11', name: 'Tamanrasset' },
  { code: '12', name: 'Tébessa' },
  { code: '13', name: 'Tlemcen' },
  { code: '14', name: 'Tiaret' },
  { code: '15', name: 'Tizi Ouzou' },
  { code: '16', name: 'Alger' },
  { code: '17', name: 'Djelfa' },
  { code: '18', name: 'Jijel' },
  { code: '19', name: 'Sétif' },
  { code: '20', name: 'Saïda' },
  { code: '21', name: 'Skikda' },
  { code: '22', name: 'Sidi Bel Abbès' },
  { code: '23', name: 'Annaba' },
  { code: '24', name: 'Guelma' },
  { code: '25', name: 'Constantine' },
  { code: '26', name: 'Médéa' },
  { code: '27', name: 'Mostaganem' },
  { code: '28', name: 'M\'Sila' },
  { code: '29', name: 'Mascara' },
  { code: '30', name: 'Ouargla' },
  { code: '31', name: 'Oran' },
  { code: '32', name: 'El Bayadh' },
  { code: '33', name: 'Illizi' },
  { code: '34', name: 'Bordj Bou Arréridj' },
  { code: '35', name: 'Boumerdès' },
  { code: '36', name: 'El Tarf' },
  { code: '37', name: 'Tindouf' },
  { code: '38', name: 'Tissemsilt' },
  { code: '39', name: 'El Oued' },
  { code: '40', name: 'Khenchela' },
  { code: '41', name: 'Souk Ahras' },
  { code: '42', name: 'Tipaza' },
  { code: '43', name: 'Mila' },
  { code: '44', name: 'Aïn Defla' },
  { code: '45', name: 'Naâma' },
  { code: '46', name: 'Aïn Témouchent' },
  { code: '47', name: 'Ghardaïa' },
  { code: '48', name: 'Relizane' },
  { code: '49', name: 'El M\'Ghair' },
  { code: '50', name: 'El Meniaa' },
  { code: '51', name: 'Ouled Djellal' },
  { code: '52', name: 'Bordj Badji Mokhtar' },
  { code: '53', name: 'Béni Abbès' },
  { code: '54', name: 'Timimoun' },
  { code: '55', name: 'Touggourt' },
  { code: '56', name: 'Djanet' },
  { code: '57', name: 'In Salah' },
  { code: '58', name: 'In Guezzam' },
];

// Sample communes/cities per wilaya (expandable)
export const COMMUNES: Record<string, string[]> = {
  '16': ['Alger Centre', 'Bab El Oued', 'El Harrach', 'Hussein Dey', 'Kouba', 'Bir Mourad Raïs', 'El Biar', 'Bouzareah', 'Dely Ibrahim', 'Draria', 'Zeralda', 'Staoueli', 'Cheraga', 'Ouled Fayet', 'Sidi M\'Hamed', 'El Mouradia', 'Hydra', 'Ben Aknoun'],
  '31': ['Oran', 'Es Sénia', 'Bir El Djir', 'Aïn El Turck', 'Arzew', 'Bethioua', 'Gdyel', 'Hassi Ben Okba', 'Oued Tlélat'],
  '25': ['Constantine', 'El Khroub', 'Aïn Smara', 'Didouche Mourad', 'Hamma Bouziane', 'Zighoud Youcef', 'Beni Hamidane'],
  '23': ['Annaba', 'El Bouni', 'El Hadjar', 'Sidi Amar', 'Berrahal', 'Chetaibi'],
  '19': ['Sétif', 'El Eulma', 'Aïn Oulmène', 'Aïn Arnat', 'Bougaa', 'Aïn Azel', 'Bouandas'],
  '09': ['Blida', 'Boufarik', 'El Affroun', 'Mouzaïa', 'Oued El Alleug', 'Beni Mered', 'Chréa', 'Ouled Yaïch'],
  '35': ['Boumerdès', 'Bordj Menaïel', 'Dellys', 'Khemis El Khechna', 'Rouiba', 'Thénia', 'Boudouaou'],
  '06': ['Béjaïa', 'Akbou', 'Seddouk', 'El Kseur', 'Amizour', 'Tichy', 'Aokas', 'Kherrata'],
  '15': ['Tizi Ouzou', 'Azazga', 'Draâ Ben Khedda', 'Larbaâ Nath Irathen', 'Aïn El Hammam', 'Tigzirt', 'Boghni'],
  '05': ['Batna', 'Aïn Touta', 'Barika', 'N\'Gaous', 'Merouana', 'Tazoult', 'Arris'],
};

export const getCommunesByWilaya = (wilayaCode: string): string[] => {
  return COMMUNES[wilayaCode] || [];
};
