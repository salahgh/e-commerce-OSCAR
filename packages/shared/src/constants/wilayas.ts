// Algerian Wilayas and Communes Data
export interface Wilaya {
  code: string;
  name: string;
  nameAr: string;
  communes: Commune[];
  shippingZone: 1 | 2 | 3 | 4; // For shipping cost calculation
}

export interface Commune {
  code: string;
  name: string;
  nameAr: string;
  postalCode: string;
}

export const wilayas: Wilaya[] = [
  {
    code: '01',
    name: 'Adrar',
    nameAr: 'أدرار',
    shippingZone: 4,
    communes: [
      { code: '0101', name: 'Adrar', nameAr: 'أدرار', postalCode: '01000' },
      { code: '0102', name: 'Reggane', nameAr: 'رقان', postalCode: '01400' },
      { code: '0103', name: 'Timimoun', nameAr: 'تيميمون', postalCode: '01200' },
      { code: '0104', name: 'Aoulef', nameAr: 'أولف', postalCode: '01300' },
    ],
  },
  {
    code: '02',
    name: 'Chlef',
    nameAr: 'الشلف',
    shippingZone: 2,
    communes: [
      { code: '0201', name: 'Chlef', nameAr: 'الشلف', postalCode: '02000' },
      { code: '0202', name: 'Ténès', nameAr: 'تنس', postalCode: '02200' },
      { code: '0203', name: 'El Karimia', nameAr: 'الكريمية', postalCode: '02100' },
      { code: '0204', name: 'Oued Fodda', nameAr: 'وادي فضة', postalCode: '02300' },
    ],
  },
  {
    code: '03',
    name: 'Laghouat',
    nameAr: 'الأغواط',
    shippingZone: 3,
    communes: [
      { code: '0301', name: 'Laghouat', nameAr: 'الأغواط', postalCode: '03000' },
      { code: '0302', name: 'Aflou', nameAr: 'أفلو', postalCode: '03200' },
      { code: '0303', name: 'Ksar El Hirane', nameAr: 'قصر الحيران', postalCode: '03100' },
    ],
  },
  {
    code: '04',
    name: 'Oum El Bouaghi',
    nameAr: 'أم البواقي',
    shippingZone: 3,
    communes: [
      { code: '0401', name: 'Oum El Bouaghi', nameAr: 'أم البواقي', postalCode: '04000' },
      { code: '0402', name: 'Ain Beida', nameAr: 'عين البيضاء', postalCode: '04200' },
      { code: '0403', name: 'Ain Mlila', nameAr: 'عين مليلة', postalCode: '04300' },
    ],
  },
  {
    code: '05',
    name: 'Batna',
    nameAr: 'باتنة',
    shippingZone: 3,
    communes: [
      { code: '0501', name: 'Batna', nameAr: 'باتنة', postalCode: '05000' },
      { code: '0502', name: 'Barika', nameAr: 'بريكة', postalCode: '05100' },
      { code: '0503', name: 'Ain Touta', nameAr: 'عين التوتة', postalCode: '05200' },
      { code: '0504', name: 'Merouana', nameAr: 'مروانة', postalCode: '05500' },
    ],
  },
  {
    code: '06',
    name: 'Béjaïa',
    nameAr: 'بجاية',
    shippingZone: 2,
    communes: [
      { code: '0601', name: 'Béjaïa', nameAr: 'بجاية', postalCode: '06000' },
      { code: '0602', name: 'Akbou', nameAr: 'أقبو', postalCode: '06200' },
      { code: '0603', name: 'El Kseur', nameAr: 'القصر', postalCode: '06100' },
      { code: '0604', name: 'Sidi Aich', nameAr: 'سيدي عيش', postalCode: '06300' },
    ],
  },
  {
    code: '07',
    name: 'Biskra',
    nameAr: 'بسكرة',
    shippingZone: 3,
    communes: [
      { code: '0701', name: 'Biskra', nameAr: 'بسكرة', postalCode: '07000' },
      { code: '0702', name: 'Tolga', nameAr: 'طولقة', postalCode: '07200' },
      { code: '0703', name: 'Ouled Djellal', nameAr: 'أولاد جلال', postalCode: '07100' },
    ],
  },
  {
    code: '08',
    name: 'Béchar',
    nameAr: 'بشار',
    shippingZone: 4,
    communes: [
      { code: '0801', name: 'Béchar', nameAr: 'بشار', postalCode: '08000' },
      { code: '0802', name: 'Kenadsa', nameAr: 'القنادسة', postalCode: '08200' },
    ],
  },
  {
    code: '09',
    name: 'Blida',
    nameAr: 'البليدة',
    shippingZone: 1,
    communes: [
      { code: '0901', name: 'Blida', nameAr: 'البليدة', postalCode: '09000' },
      { code: '0902', name: 'Boufarik', nameAr: 'بوفاريك', postalCode: '09100' },
      { code: '0903', name: 'El Affroun', nameAr: 'العفرون', postalCode: '09200' },
      { code: '0904', name: 'Mouzaia', nameAr: 'موزاية', postalCode: '09300' },
      { code: '0905', name: 'Oued El Alleug', nameAr: 'وادي العلايق', postalCode: '09400' },
    ],
  },
  {
    code: '10',
    name: 'Bouira',
    nameAr: 'البويرة',
    shippingZone: 3,
    communes: [
      { code: '1001', name: 'Bouira', nameAr: 'البويرة', postalCode: '10000' },
      { code: '1002', name: 'Lakhdaria', nameAr: 'الأخضرية', postalCode: '10100' },
      { code: '1003', name: 'Sour El Ghozlane', nameAr: 'سور الغزلان', postalCode: '10200' },
    ],
  },
  {
    code: '11',
    name: 'Tamanrasset',
    nameAr: 'تمنراست',
    shippingZone: 4,
    communes: [
      { code: '1101', name: 'Tamanrasset', nameAr: 'تمنراست', postalCode: '11000' },
      { code: '1102', name: 'In Salah', nameAr: 'عين صالح', postalCode: '11200' },
    ],
  },
  {
    code: '12',
    name: 'Tébessa',
    nameAr: 'تبسة',
    shippingZone: 3,
    communes: [
      { code: '1201', name: 'Tébessa', nameAr: 'تبسة', postalCode: '12000' },
      { code: '1202', name: 'Bir El Ater', nameAr: 'بئر العاتر', postalCode: '12100' },
      { code: '1203', name: 'Cheria', nameAr: 'الشريعة', postalCode: '12200' },
    ],
  },
  {
    code: '13',
    name: 'Tlemcen',
    nameAr: 'تلمسان',
    shippingZone: 2,
    communes: [
      { code: '1301', name: 'Tlemcen', nameAr: 'تلمسان', postalCode: '13000' },
      { code: '1302', name: 'Maghnia', nameAr: 'مغنية', postalCode: '13200' },
      { code: '1303', name: 'Remchi', nameAr: 'الرمشي', postalCode: '13100' },
      { code: '1304', name: 'Ghazaouet', nameAr: 'الغزوات', postalCode: '13400' },
    ],
  },
  {
    code: '14',
    name: 'Tiaret',
    nameAr: 'تيارت',
    shippingZone: 3,
    communes: [
      { code: '1401', name: 'Tiaret', nameAr: 'تيارت', postalCode: '14000' },
      { code: '1402', name: 'Frenda', nameAr: 'فرندة', postalCode: '14100' },
      { code: '1403', name: 'Ksar Chellala', nameAr: 'قصر الشلالة', postalCode: '14200' },
    ],
  },
  {
    code: '15',
    name: 'Tizi Ouzou',
    nameAr: 'تيزي وزو',
    shippingZone: 2,
    communes: [
      { code: '1501', name: 'Tizi Ouzou', nameAr: 'تيزي وزو', postalCode: '15000' },
      { code: '1502', name: 'Draa Ben Khedda', nameAr: 'ذراع بن خدة', postalCode: '15100' },
      { code: '1503', name: 'Azazga', nameAr: 'عزازقة', postalCode: '15300' },
      { code: '1504', name: 'Larbaâ Nath Irathen', nameAr: 'الأربعاء ناث إيراثن', postalCode: '15200' },
    ],
  },
  {
    code: '16',
    name: 'Alger',
    nameAr: 'الجزائر',
    shippingZone: 1,
    communes: [
      { code: '1601', name: 'Alger Centre', nameAr: 'الجزائر الوسطى', postalCode: '16000' },
      { code: '1602', name: 'Bab El Oued', nameAr: 'باب الوادي', postalCode: '16001' },
      { code: '1603', name: 'Hussein Dey', nameAr: 'حسين داي', postalCode: '16040' },
      { code: '1604', name: 'Kouba', nameAr: 'القبة', postalCode: '16050' },
      { code: '1605', name: 'El Harrach', nameAr: 'الحراش', postalCode: '16200' },
      { code: '1606', name: 'Bir Mourad Raïs', nameAr: 'بئر مراد رايس', postalCode: '16010' },
      { code: '1607', name: 'El Biar', nameAr: 'الأبيار', postalCode: '16030' },
      { code: '1608', name: 'Bouzareah', nameAr: 'بوزريعة', postalCode: '16340' },
      { code: '1609', name: 'Dar El Beida', nameAr: 'الدار البيضاء', postalCode: '16110' },
      { code: '1610', name: 'Bab Ezzouar', nameAr: 'باب الزوار', postalCode: '16046' },
      { code: '1611', name: 'Bordj El Kiffan', nameAr: 'برج الكيفان', postalCode: '16120' },
      { code: '1612', name: 'Cheraga', nameAr: 'شراقة', postalCode: '16002' },
      { code: '1613', name: 'Draria', nameAr: 'الدرارية', postalCode: '16014' },
      { code: '1614', name: 'Dely Ibrahim', nameAr: 'دالي إبراهيم', postalCode: '16320' },
      { code: '1615', name: 'Hydra', nameAr: 'حيدرة', postalCode: '16035' },
      { code: '1616', name: 'Mohammadia', nameAr: 'المحمدية', postalCode: '16058' },
      { code: '1617', name: 'Rouiba', nameAr: 'الرويبة', postalCode: '16012' },
      { code: '1618', name: 'Reghaia', nameAr: 'الرغاية', postalCode: '16121' },
    ],
  },
  {
    code: '17',
    name: 'Djelfa',
    nameAr: 'الجلفة',
    shippingZone: 3,
    communes: [
      { code: '1701', name: 'Djelfa', nameAr: 'الجلفة', postalCode: '17000' },
      { code: '1702', name: 'Messaad', nameAr: 'مسعد', postalCode: '17200' },
      { code: '1703', name: 'Ain Oussera', nameAr: 'عين وسارة', postalCode: '17100' },
    ],
  },
  {
    code: '18',
    name: 'Jijel',
    nameAr: 'جيجل',
    shippingZone: 2,
    communes: [
      { code: '1801', name: 'Jijel', nameAr: 'جيجل', postalCode: '18000' },
      { code: '1802', name: 'Taher', nameAr: 'الطاهير', postalCode: '18100' },
      { code: '1803', name: 'El Milia', nameAr: 'الميلية', postalCode: '18200' },
    ],
  },
  {
    code: '19',
    name: 'Sétif',
    nameAr: 'سطيف',
    shippingZone: 3,
    communes: [
      { code: '1901', name: 'Sétif', nameAr: 'سطيف', postalCode: '19000' },
      { code: '1902', name: 'El Eulma', nameAr: 'العلمة', postalCode: '19200' },
      { code: '1903', name: 'Ain Oulmene', nameAr: 'عين ولمان', postalCode: '19100' },
      { code: '1904', name: 'Bougaa', nameAr: 'بوقاعة', postalCode: '19300' },
    ],
  },
  {
    code: '20',
    name: 'Saïda',
    nameAr: 'سعيدة',
    shippingZone: 3,
    communes: [
      { code: '2001', name: 'Saïda', nameAr: 'سعيدة', postalCode: '20000' },
      { code: '2002', name: 'Ain El Hadjar', nameAr: 'عين الحجر', postalCode: '20100' },
    ],
  },
  {
    code: '21',
    name: 'Skikda',
    nameAr: 'سكيكدة',
    shippingZone: 2,
    communes: [
      { code: '2101', name: 'Skikda', nameAr: 'سكيكدة', postalCode: '21000' },
      { code: '2102', name: 'Collo', nameAr: 'القل', postalCode: '21200' },
      { code: '2103', name: 'Azzaba', nameAr: 'عزابة', postalCode: '21100' },
    ],
  },
  {
    code: '22',
    name: 'Sidi Bel Abbès',
    nameAr: 'سيدي بلعباس',
    shippingZone: 2,
    communes: [
      { code: '2201', name: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', postalCode: '22000' },
      { code: '2202', name: 'Telagh', nameAr: 'تلاغ', postalCode: '22200' },
      { code: '2203', name: 'Ben Badis', nameAr: 'بن باديس', postalCode: '22100' },
    ],
  },
  {
    code: '23',
    name: 'Annaba',
    nameAr: 'عنابة',
    shippingZone: 2,
    communes: [
      { code: '2301', name: 'Annaba', nameAr: 'عنابة', postalCode: '23000' },
      { code: '2302', name: 'El Bouni', nameAr: 'البوني', postalCode: '23100' },
      { code: '2303', name: 'El Hadjar', nameAr: 'الحجار', postalCode: '23200' },
    ],
  },
  {
    code: '24',
    name: 'Guelma',
    nameAr: 'قالمة',
    shippingZone: 2,
    communes: [
      { code: '2401', name: 'Guelma', nameAr: 'قالمة', postalCode: '24000' },
      { code: '2402', name: 'Bouchegouf', nameAr: 'بوشقوف', postalCode: '24200' },
      { code: '2403', name: 'Oued Zenati', nameAr: 'وادي الزناتي', postalCode: '24100' },
    ],
  },
  {
    code: '25',
    name: 'Constantine',
    nameAr: 'قسنطينة',
    shippingZone: 2,
    communes: [
      { code: '2501', name: 'Constantine', nameAr: 'قسنطينة', postalCode: '25000' },
      { code: '2502', name: 'El Khroub', nameAr: 'الخروب', postalCode: '25100' },
      { code: '2503', name: 'Ain Smara', nameAr: 'عين السمارة', postalCode: '25140' },
      { code: '2504', name: 'Hamma Bouziane', nameAr: 'حامة بوزيان', postalCode: '25220' },
    ],
  },
  {
    code: '26',
    name: 'Médéa',
    nameAr: 'المدية',
    shippingZone: 3,
    communes: [
      { code: '2601', name: 'Médéa', nameAr: 'المدية', postalCode: '26000' },
      { code: '2602', name: 'Berrouaghia', nameAr: 'البرواقية', postalCode: '26100' },
      { code: '2603', name: 'Ksar El Boukhari', nameAr: 'قصر البخاري', postalCode: '26200' },
    ],
  },
  {
    code: '27',
    name: 'Mostaganem',
    nameAr: 'مستغانم',
    shippingZone: 2,
    communes: [
      { code: '2701', name: 'Mostaganem', nameAr: 'مستغانم', postalCode: '27000' },
      { code: '2702', name: 'Ain Tedeles', nameAr: 'عين تادلس', postalCode: '27100' },
      { code: '2703', name: 'Hassi Mamèche', nameAr: 'حاسي ماماش', postalCode: '27200' },
    ],
  },
  {
    code: '28',
    name: 'M\'Sila',
    nameAr: 'المسيلة',
    shippingZone: 3,
    communes: [
      { code: '2801', name: 'M\'Sila', nameAr: 'المسيلة', postalCode: '28000' },
      { code: '2802', name: 'Bou Saada', nameAr: 'بوسعادة', postalCode: '28200' },
      { code: '2803', name: 'Sidi Aissa', nameAr: 'سيدي عيسى', postalCode: '28100' },
    ],
  },
  {
    code: '29',
    name: 'Mascara',
    nameAr: 'معسكر',
    shippingZone: 2,
    communes: [
      { code: '2901', name: 'Mascara', nameAr: 'معسكر', postalCode: '29000' },
      { code: '2902', name: 'Sig', nameAr: 'سيق', postalCode: '29100' },
      { code: '2903', name: 'Mohammadia', nameAr: 'المحمدية', postalCode: '29200' },
    ],
  },
  {
    code: '30',
    name: 'Ouargla',
    nameAr: 'ورقلة',
    shippingZone: 4,
    communes: [
      { code: '3001', name: 'Ouargla', nameAr: 'ورقلة', postalCode: '30000' },
      { code: '3002', name: 'Hassi Messaoud', nameAr: 'حاسي مسعود', postalCode: '30500' },
      { code: '3003', name: 'Touggourt', nameAr: 'تقرت', postalCode: '30200' },
    ],
  },
  {
    code: '31',
    name: 'Oran',
    nameAr: 'وهران',
    shippingZone: 2,
    communes: [
      { code: '3101', name: 'Oran', nameAr: 'وهران', postalCode: '31000' },
      { code: '3102', name: 'Es Senia', nameAr: 'السانية', postalCode: '31100' },
      { code: '3103', name: 'Bir El Djir', nameAr: 'بئر الجير', postalCode: '31024' },
      { code: '3104', name: 'Arzew', nameAr: 'أرزيو', postalCode: '31200' },
      { code: '3105', name: 'Ain El Turk', nameAr: 'عين الترك', postalCode: '31130' },
    ],
  },
  {
    code: '32',
    name: 'El Bayadh',
    nameAr: 'البيض',
    shippingZone: 4,
    communes: [
      { code: '3201', name: 'El Bayadh', nameAr: 'البيض', postalCode: '32000' },
      { code: '3202', name: 'Bougtob', nameAr: 'بوقطب', postalCode: '32100' },
    ],
  },
  {
    code: '33',
    name: 'Illizi',
    nameAr: 'إليزي',
    shippingZone: 4,
    communes: [
      { code: '3301', name: 'Illizi', nameAr: 'إليزي', postalCode: '33000' },
      { code: '3302', name: 'Djanet', nameAr: 'جانت', postalCode: '33100' },
    ],
  },
  {
    code: '34',
    name: 'Bordj Bou Arréridj',
    nameAr: 'برج بوعريريج',
    shippingZone: 3,
    communes: [
      { code: '3401', name: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج', postalCode: '34000' },
      { code: '3402', name: 'Ras El Oued', nameAr: 'رأس الوادي', postalCode: '34200' },
      { code: '3403', name: 'El Achir', nameAr: 'الأشير', postalCode: '34100' },
    ],
  },
  {
    code: '35',
    name: 'Boumerdès',
    nameAr: 'بومرداس',
    shippingZone: 1,
    communes: [
      { code: '3501', name: 'Boumerdès', nameAr: 'بومرداس', postalCode: '35000' },
      { code: '3502', name: 'Bordj Menaiel', nameAr: 'برج منايل', postalCode: '35200' },
      { code: '3503', name: 'Dellys', nameAr: 'دلس', postalCode: '35100' },
      { code: '3504', name: 'Khemis El Khechna', nameAr: 'خميس الخشنة', postalCode: '35300' },
    ],
  },
  {
    code: '36',
    name: 'El Tarf',
    nameAr: 'الطارف',
    shippingZone: 2,
    communes: [
      { code: '3601', name: 'El Tarf', nameAr: 'الطارف', postalCode: '36000' },
      { code: '3602', name: 'El Kala', nameAr: 'القالة', postalCode: '36100' },
      { code: '3603', name: 'Bouhadjar', nameAr: 'بوحجار', postalCode: '36200' },
    ],
  },
  {
    code: '37',
    name: 'Tindouf',
    nameAr: 'تندوف',
    shippingZone: 4,
    communes: [
      { code: '3701', name: 'Tindouf', nameAr: 'تندوف', postalCode: '37000' },
    ],
  },
  {
    code: '38',
    name: 'Tissemsilt',
    nameAr: 'تيسمسيلت',
    shippingZone: 3,
    communes: [
      { code: '3801', name: 'Tissemsilt', nameAr: 'تيسمسيلت', postalCode: '38000' },
      { code: '3802', name: 'Bordj Bou Naama', nameAr: 'برج بونعامة', postalCode: '38200' },
      { code: '3803', name: 'Theniet El Had', nameAr: 'ثنية الأحد', postalCode: '38100' },
    ],
  },
  {
    code: '39',
    name: 'El Oued',
    nameAr: 'الوادي',
    shippingZone: 4,
    communes: [
      { code: '3901', name: 'El Oued', nameAr: 'الوادي', postalCode: '39000' },
      { code: '3902', name: 'Guemar', nameAr: 'قمار', postalCode: '39100' },
      { code: '3903', name: 'Debila', nameAr: 'الدبيلة', postalCode: '39200' },
    ],
  },
  {
    code: '40',
    name: 'Khenchela',
    nameAr: 'خنشلة',
    shippingZone: 3,
    communes: [
      { code: '4001', name: 'Khenchela', nameAr: 'خنشلة', postalCode: '40000' },
      { code: '4002', name: 'Kais', nameAr: 'قايس', postalCode: '40100' },
      { code: '4003', name: 'Chechar', nameAr: 'ششار', postalCode: '40200' },
    ],
  },
  {
    code: '41',
    name: 'Souk Ahras',
    nameAr: 'سوق أهراس',
    shippingZone: 3,
    communes: [
      { code: '4101', name: 'Souk Ahras', nameAr: 'سوق أهراس', postalCode: '41000' },
      { code: '4102', name: 'Sedrata', nameAr: 'سدراتة', postalCode: '41200' },
      { code: '4103', name: 'Taoura', nameAr: 'تاورة', postalCode: '41100' },
    ],
  },
  {
    code: '42',
    name: 'Tipaza',
    nameAr: 'تيبازة',
    shippingZone: 1,
    communes: [
      { code: '4201', name: 'Tipaza', nameAr: 'تيبازة', postalCode: '42000' },
      { code: '4202', name: 'Kolea', nameAr: 'القليعة', postalCode: '42200' },
      { code: '4203', name: 'Cherchell', nameAr: 'شرشال', postalCode: '42100' },
      { code: '4204', name: 'Hadjout', nameAr: 'حجوط', postalCode: '42300' },
    ],
  },
  {
    code: '43',
    name: 'Mila',
    nameAr: 'ميلة',
    shippingZone: 3,
    communes: [
      { code: '4301', name: 'Mila', nameAr: 'ميلة', postalCode: '43000' },
      { code: '4302', name: 'Chelghoum Laïd', nameAr: 'شلغوم العيد', postalCode: '43100' },
      { code: '4303', name: 'Ferdjioua', nameAr: 'فرجيوة', postalCode: '43200' },
    ],
  },
  {
    code: '44',
    name: 'Aïn Defla',
    nameAr: 'عين الدفلى',
    shippingZone: 3,
    communes: [
      { code: '4401', name: 'Aïn Defla', nameAr: 'عين الدفلى', postalCode: '44000' },
      { code: '4402', name: 'Khemis Miliana', nameAr: 'خميس مليانة', postalCode: '44225' },
      { code: '4403', name: 'Miliana', nameAr: 'مليانة', postalCode: '44200' },
    ],
  },
  {
    code: '45',
    name: 'Naâma',
    nameAr: 'النعامة',
    shippingZone: 4,
    communes: [
      { code: '4501', name: 'Naâma', nameAr: 'النعامة', postalCode: '45000' },
      { code: '4502', name: 'Mecheria', nameAr: 'المشرية', postalCode: '45100' },
      { code: '4503', name: 'Ain Sefra', nameAr: 'عين الصفراء', postalCode: '45200' },
    ],
  },
  {
    code: '46',
    name: 'Aïn Témouchent',
    nameAr: 'عين تموشنت',
    shippingZone: 2,
    communes: [
      { code: '4601', name: 'Aïn Témouchent', nameAr: 'عين تموشنت', postalCode: '46000' },
      { code: '4602', name: 'El Malah', nameAr: 'المالح', postalCode: '46200' },
      { code: '4603', name: 'Hammam Bou Hadjar', nameAr: 'حمام بوحجر', postalCode: '46100' },
    ],
  },
  {
    code: '47',
    name: 'Ghardaïa',
    nameAr: 'غرداية',
    shippingZone: 4,
    communes: [
      { code: '4701', name: 'Ghardaïa', nameAr: 'غرداية', postalCode: '47000' },
      { code: '4702', name: 'El Meniaa', nameAr: 'المنيعة', postalCode: '47200' },
      { code: '4703', name: 'Berriane', nameAr: 'بريان', postalCode: '47100' },
    ],
  },
  {
    code: '48',
    name: 'Relizane',
    nameAr: 'غليزان',
    shippingZone: 2,
    communes: [
      { code: '4801', name: 'Relizane', nameAr: 'غليزان', postalCode: '48000' },
      { code: '4802', name: 'Oued Rhiou', nameAr: 'وادي رهيو', postalCode: '48100' },
      { code: '4803', name: 'Mazouna', nameAr: 'مازونة', postalCode: '48200' },
    ],
  },
];

// Shipping zone prices
export const shippingZonePrices: Record<1 | 2 | 3 | 4, number> = {
  1: 300, // Alger and nearby
  2: 400, // Coastal cities
  3: 500, // High plateaus
  4: 800, // South
};

// Shipping zone delays
export const shippingZoneDelays: Record<1 | 2 | 3 | 4, string> = {
  1: '1-2 jours ouvrés',
  2: '2-4 jours ouvrés',
  3: '3-5 jours ouvrés',
  4: '5-7 jours ouvrés',
};

// Helper functions
export function getWilayaByCode(code: string): Wilaya | undefined {
  return wilayas.find((w) => w.code === code);
}

export function getCommunesByWilayaCode(wilayaCode: string): Commune[] {
  const wilaya = getWilayaByCode(wilayaCode);
  return wilaya?.communes || [];
}

export function getShippingPrice(wilayaCode: string): number {
  const wilaya = getWilayaByCode(wilayaCode);
  return wilaya ? shippingZonePrices[wilaya.shippingZone] : 500;
}

export function getShippingDelay(wilayaCode: string): string {
  const wilaya = getWilayaByCode(wilayaCode);
  return wilaya ? shippingZoneDelays[wilaya.shippingZone] : '3-5 jours ouvrés';
}

/**
 * Locale-agnostic counterpart to {@link getShippingDelay}. Returns the
 * shipping zone (1-4) so the caller can pick the right localized delay text.
 * Use this from i18n-aware UI rather than the French-only {@link getShippingDelay}.
 */
export function getShippingZone(wilayaCode: string): 1 | 2 | 3 | 4 {
  const wilaya = getWilayaByCode(wilayaCode);
  return wilaya?.shippingZone ?? 3;
}

export function formatWilayaName(wilaya: Wilaya): string {
  return `${wilaya.code} - ${wilaya.name}`;
}
