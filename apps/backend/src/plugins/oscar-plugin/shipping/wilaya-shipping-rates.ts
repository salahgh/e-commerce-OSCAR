/**
 * Delivery rates per wilaya, in DZD (whole dinars).
 *
 * - `home`   = delivery to the customer address ("livraison à domicile").
 * - `office` = pickup at the courier office nearest to the customer ("bureau" / stop desk).
 * - `null`   = that mode is not offered in the wilaya (the option is then hidden at checkout).
 *
 * PLACEHOLDER VALUES: seeded from the project former shipping-zone table for `home`,
 * minus 100 DA for `office`. Replace them with the courier official grid.
 * Editing this file and redeploying the backend is the only step needed: the two
 * shipping methods (see shipping-setup.service.ts) read it on every quote.
 *
 * `name` is the canonical French wilaya name, exactly as the storefronts store it in
 * `shippingAddress.province` (see packages/shared/src/constants/wilayas.ts).
 */
export interface WilayaShippingRate {
  /** Two-digit wilaya code, e.g. "16" for Alger. */
  code: string;
  /** Canonical French name, matched case- and accent-insensitively. */
  name: string;
  home: number | null;
  office: number | null;
}

export const WILAYA_SHIPPING_RATES: readonly WilayaShippingRate[] = [
  { code: '01', name: 'Adrar', home: 800, office: 700 },
  { code: '02', name: 'Chlef', home: 400, office: 300 },
  { code: '03', name: 'Laghouat', home: 500, office: 400 },
  { code: '04', name: 'Oum El Bouaghi', home: 500, office: 400 },
  { code: '05', name: 'Batna', home: 500, office: 400 },
  { code: '06', name: 'Béjaïa', home: 400, office: 300 },
  { code: '07', name: 'Biskra', home: 500, office: 400 },
  { code: '08', name: 'Béchar', home: 800, office: 700 },
  { code: '09', name: 'Blida', home: 300, office: 200 },
  { code: '10', name: 'Bouira', home: 500, office: 400 },
  { code: '11', name: 'Tamanrasset', home: 800, office: 700 },
  { code: '12', name: 'Tébessa', home: 500, office: 400 },
  { code: '13', name: 'Tlemcen', home: 400, office: 300 },
  { code: '14', name: 'Tiaret', home: 500, office: 400 },
  { code: '15', name: 'Tizi Ouzou', home: 400, office: 300 },
  { code: '16', name: 'Alger', home: 300, office: 200 },
  { code: '17', name: 'Djelfa', home: 500, office: 400 },
  { code: '18', name: 'Jijel', home: 400, office: 300 },
  { code: '19', name: 'Sétif', home: 500, office: 400 },
  { code: '20', name: 'Saïda', home: 500, office: 400 },
  { code: '21', name: 'Skikda', home: 400, office: 300 },
  { code: '22', name: 'Sidi Bel Abbès', home: 400, office: 300 },
  { code: '23', name: 'Annaba', home: 400, office: 300 },
  { code: '24', name: 'Guelma', home: 400, office: 300 },
  { code: '25', name: 'Constantine', home: 400, office: 300 },
  { code: '26', name: 'Médéa', home: 500, office: 400 },
  { code: '27', name: 'Mostaganem', home: 400, office: 300 },
  { code: '28', name: 'M\'Sila', home: 500, office: 400 },
  { code: '29', name: 'Mascara', home: 400, office: 300 },
  { code: '30', name: 'Ouargla', home: 800, office: 700 },
  { code: '31', name: 'Oran', home: 400, office: 300 },
  { code: '32', name: 'El Bayadh', home: 800, office: 700 },
  { code: '33', name: 'Illizi', home: 800, office: 700 },
  { code: '34', name: 'Bordj Bou Arreridj', home: 500, office: 400 },
  { code: '35', name: 'Boumerdès', home: 300, office: 200 },
  { code: '36', name: 'El Tarf', home: 400, office: 300 },
  { code: '37', name: 'Tindouf', home: 800, office: 700 },
  { code: '38', name: 'Tissemsilt', home: 500, office: 400 },
  { code: '39', name: 'El Oued', home: 800, office: 700 },
  { code: '40', name: 'Khenchela', home: 500, office: 400 },
  { code: '41', name: 'Souk Ahras', home: 500, office: 400 },
  { code: '42', name: 'Tipaza', home: 300, office: 200 },
  { code: '43', name: 'Mila', home: 500, office: 400 },
  { code: '44', name: 'Aïn Defla', home: 500, office: 400 },
  { code: '45', name: 'Naâma', home: 800, office: 700 },
  { code: '46', name: 'Aïn Témouchent', home: 400, office: 300 },
  { code: '47', name: 'Ghardaïa', home: 800, office: 700 },
  { code: '48', name: 'Relizane', home: 400, office: 300 },
  { code: '49', name: 'Timimoun', home: 800, office: 700 },
  { code: '50', name: 'Bordj Badji Mokhtar', home: 800, office: 700 },
  { code: '51', name: 'Ouled Djellal', home: 500, office: 400 },
  { code: '52', name: 'Béni Abbès', home: 800, office: 700 },
  { code: '53', name: 'In Salah', home: 800, office: 700 },
  { code: '54', name: 'In Guezzam', home: 800, office: 700 },
  { code: '55', name: 'Touggourt', home: 800, office: 700 },
  { code: '56', name: 'Djanet', home: 800, office: 700 },
  { code: '57', name: 'El Meghaier', home: 800, office: 700 },
  { code: '58', name: 'El Menia', home: 800, office: 700 },
  { code: '59', name: 'Aflou', home: 500, office: 400 },
  { code: '60', name: 'Barika', home: 500, office: 400 },
  { code: '61', name: 'Ksar Chellala', home: 500, office: 400 },
  { code: '62', name: 'Messaad', home: 500, office: 400 },
  { code: '63', name: 'Aïn Oussera', home: 500, office: 400 },
  { code: '64', name: 'Boussaâda', home: 500, office: 400 },
  { code: '65', name: 'El Abiodh Sidi Cheikh', home: 800, office: 700 },
  { code: '66', name: 'El Kantara', home: 500, office: 400 },
  { code: '67', name: 'Bir El Ater', home: 500, office: 400 },
  { code: '68', name: 'Ksar El Boukhari', home: 500, office: 400 },
  { code: '69', name: 'El Aricha', home: 500, office: 400 },
];
