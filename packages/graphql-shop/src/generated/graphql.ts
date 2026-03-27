import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
  JSON: { input: Record<string, any>; output: Record<string, any> };
  Money: { input: number; output: number };
  Upload: { input: File; output: File };
};

export type ActiveOrderResult = NoActiveOrderError | Order;

export type AddItemInput = {
  productVariantId: Scalars["ID"]["input"];
  quantity: Scalars["Int"]["input"];
};

export type AddPaymentToOrderResult =
  | IneligiblePaymentMethodError
  | NoActiveOrderError
  | Order
  | OrderPaymentStateError
  | OrderStateTransitionError
  | PaymentDeclinedError
  | PaymentFailedError;

export type Address = Node & {
  __typename?: "Address";
  city?: Maybe<Scalars["String"]["output"]>;
  company?: Maybe<Scalars["String"]["output"]>;
  country: Country;
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  defaultBillingAddress?: Maybe<Scalars["Boolean"]["output"]>;
  defaultShippingAddress?: Maybe<Scalars["Boolean"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  phoneNumber?: Maybe<Scalars["String"]["output"]>;
  postalCode?: Maybe<Scalars["String"]["output"]>;
  province?: Maybe<Scalars["String"]["output"]>;
  streetLine1: Scalars["String"]["output"];
  streetLine2?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type Adjustment = {
  __typename?: "Adjustment";
  adjustmentSource: Scalars["String"]["output"];
  amount: Scalars["Money"]["output"];
  data?: Maybe<Scalars["JSON"]["output"]>;
  description: Scalars["String"]["output"];
  type: AdjustmentType;
};

export enum AdjustmentType {
  DistributedOrderPromotion = "DISTRIBUTED_ORDER_PROMOTION",
  Other = "OTHER",
  Promotion = "PROMOTION",
}

/** Returned when attempting to set the Customer for an Order when already logged in. */
export type AlreadyLoggedInError = ErrorResult & {
  __typename?: "AlreadyLoggedInError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

export type ApplyCouponCodeResult =
  | CouponCodeExpiredError
  | CouponCodeInvalidError
  | CouponCodeLimitError
  | Order;

export type Asset = Node & {
  __typename?: "Asset";
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  fileSize: Scalars["Int"]["output"];
  focalPoint?: Maybe<Coordinate>;
  height: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  mimeType: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  preview: Scalars["String"]["output"];
  source: Scalars["String"]["output"];
  tags: Array<Tag>;
  type: AssetType;
  updatedAt: Scalars["DateTime"]["output"];
  width: Scalars["Int"]["output"];
};

export type AssetList = PaginatedList & {
  __typename?: "AssetList";
  items: Array<Asset>;
  totalItems: Scalars["Int"]["output"];
};

export enum AssetType {
  Binary = "BINARY",
  Image = "IMAGE",
  Video = "VIDEO",
}

export type AuthenticationInput = {
  native?: InputMaybe<NativeAuthInput>;
};

export type AuthenticationMethod = Node & {
  __typename?: "AuthenticationMethod";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  strategy: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type AuthenticationResult =
  | CurrentUser
  | InvalidCredentialsError
  | NotVerifiedError;

export type BooleanCustomFieldConfig = CustomField & {
  __typename?: "BooleanCustomFieldConfig";
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

/** Operators for filtering on a list of Boolean fields */
export type BooleanListOperators = {
  inList: Scalars["Boolean"]["input"];
};

/** Operators for filtering on a Boolean field */
export type BooleanOperators = {
  eq?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type BooleanStructFieldConfig = StructField & {
  __typename?: "BooleanStructFieldConfig";
  description?: Maybe<Array<LocalizedString>>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type Channel = Node & {
  __typename?: "Channel";
  availableCurrencyCodes: Array<CurrencyCode>;
  availableLanguageCodes?: Maybe<Array<LanguageCode>>;
  code: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  /** @deprecated Use defaultCurrencyCode instead */
  currencyCode: CurrencyCode;
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  defaultCurrencyCode: CurrencyCode;
  defaultLanguageCode: LanguageCode;
  defaultShippingZone?: Maybe<Zone>;
  defaultTaxZone?: Maybe<Zone>;
  id: Scalars["ID"]["output"];
  /** Not yet used - will be implemented in a future release. */
  outOfStockThreshold?: Maybe<Scalars["Int"]["output"]>;
  pricesIncludeTax: Scalars["Boolean"]["output"];
  seller?: Maybe<Seller>;
  token: Scalars["String"]["output"];
  /** Not yet used - will be implemented in a future release. */
  trackInventory?: Maybe<Scalars["Boolean"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type Collection = Node & {
  __typename?: "Collection";
  assets: Array<Asset>;
  breadcrumbs: Array<CollectionBreadcrumb>;
  children?: Maybe<Array<Collection>>;
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<CollectionCustomFields>;
  description: Scalars["String"]["output"];
  featuredAsset?: Maybe<Asset>;
  filters: Array<ConfigurableOperation>;
  id: Scalars["ID"]["output"];
  languageCode?: Maybe<LanguageCode>;
  name: Scalars["String"]["output"];
  parent?: Maybe<Collection>;
  parentId: Scalars["ID"]["output"];
  position: Scalars["Int"]["output"];
  productVariantCount: Scalars["Int"]["output"];
  productVariants: ProductVariantList;
  slug: Scalars["String"]["output"];
  translations: Array<CollectionTranslation>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type CollectionProductVariantsArgs = {
  options?: InputMaybe<ProductVariantListOptions>;
};

export type CollectionBreadcrumb = {
  __typename?: "CollectionBreadcrumb";
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  slug: Scalars["String"]["output"];
};

export type CollectionCustomFields = {
  __typename?: "CollectionCustomFields";
  displayOrder?: Maybe<Scalars["Int"]["output"]>;
};

export type CollectionFilterParameter = {
  _and?: InputMaybe<Array<CollectionFilterParameter>>;
  _or?: InputMaybe<Array<CollectionFilterParameter>>;
  createdAt?: InputMaybe<DateOperators>;
  description?: InputMaybe<StringOperators>;
  displayOrder?: InputMaybe<NumberOperators>;
  id?: InputMaybe<IdOperators>;
  languageCode?: InputMaybe<StringOperators>;
  name?: InputMaybe<StringOperators>;
  parentId?: InputMaybe<IdOperators>;
  position?: InputMaybe<NumberOperators>;
  productVariantCount?: InputMaybe<NumberOperators>;
  slug?: InputMaybe<StringOperators>;
  updatedAt?: InputMaybe<DateOperators>;
};

export type CollectionList = PaginatedList & {
  __typename?: "CollectionList";
  items: Array<Collection>;
  totalItems: Scalars["Int"]["output"];
};

export type CollectionListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<CollectionFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<LogicalOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<CollectionSortParameter>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars["Int"]["input"]>;
  topLevelOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/**
 * Which Collections are present in the products returned
 * by the search, and in what quantity.
 */
export type CollectionResult = {
  __typename?: "CollectionResult";
  collection: Collection;
  count: Scalars["Int"]["output"];
};

export type CollectionSortParameter = {
  createdAt?: InputMaybe<SortOrder>;
  description?: InputMaybe<SortOrder>;
  displayOrder?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  parentId?: InputMaybe<SortOrder>;
  position?: InputMaybe<SortOrder>;
  productVariantCount?: InputMaybe<SortOrder>;
  slug?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type CollectionTranslation = {
  __typename?: "CollectionTranslation";
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  slug: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type ConfigArg = {
  __typename?: "ConfigArg";
  name: Scalars["String"]["output"];
  value: Scalars["String"]["output"];
};

export type ConfigArgDefinition = {
  __typename?: "ConfigArgDefinition";
  defaultValue?: Maybe<Scalars["JSON"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  label?: Maybe<Scalars["String"]["output"]>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  required: Scalars["Boolean"]["output"];
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type ConfigArgInput = {
  name: Scalars["String"]["input"];
  /** A JSON stringified representation of the actual value */
  value: Scalars["String"]["input"];
};

export type ConfigurableOperation = {
  __typename?: "ConfigurableOperation";
  args: Array<ConfigArg>;
  code: Scalars["String"]["output"];
};

export type ConfigurableOperationDefinition = {
  __typename?: "ConfigurableOperationDefinition";
  args: Array<ConfigArgDefinition>;
  code: Scalars["String"]["output"];
  description: Scalars["String"]["output"];
};

export type ConfigurableOperationInput = {
  arguments: Array<ConfigArgInput>;
  code: Scalars["String"]["input"];
};

export type Coordinate = {
  __typename?: "Coordinate";
  x: Scalars["Float"]["output"];
  y: Scalars["Float"]["output"];
};

/**
 * A Country of the world which your shop operates in.
 *
 * The `code` field is typically a 2-character ISO code such as "GB", "US", "DE" etc. This code is used in certain inputs such as
 * `UpdateAddressInput` and `CreateAddressInput` to specify the country.
 */
export type Country = Node &
  Region & {
    __typename?: "Country";
    code: Scalars["String"]["output"];
    createdAt: Scalars["DateTime"]["output"];
    customFields?: Maybe<Scalars["JSON"]["output"]>;
    enabled: Scalars["Boolean"]["output"];
    id: Scalars["ID"]["output"];
    languageCode: LanguageCode;
    name: Scalars["String"]["output"];
    parent?: Maybe<Region>;
    parentId?: Maybe<Scalars["ID"]["output"]>;
    translations: Array<RegionTranslation>;
    type: Scalars["String"]["output"];
    updatedAt: Scalars["DateTime"]["output"];
  };

export type CountryList = PaginatedList & {
  __typename?: "CountryList";
  items: Array<Country>;
  totalItems: Scalars["Int"]["output"];
};

/** Returned if the provided coupon code is invalid */
export type CouponCodeExpiredError = ErrorResult & {
  __typename?: "CouponCodeExpiredError";
  couponCode: Scalars["String"]["output"];
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/** Returned if the provided coupon code is invalid */
export type CouponCodeInvalidError = ErrorResult & {
  __typename?: "CouponCodeInvalidError";
  couponCode: Scalars["String"]["output"];
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/** Returned if the provided coupon code is invalid */
export type CouponCodeLimitError = ErrorResult & {
  __typename?: "CouponCodeLimitError";
  couponCode: Scalars["String"]["output"];
  errorCode: ErrorCode;
  limit: Scalars["Int"]["output"];
  message: Scalars["String"]["output"];
};

/**
 * Input used to create an Address.
 *
 * The countryCode must correspond to a `code` property of a Country that has been defined in the
 * Vendure server. The `code` property is typically a 2-character ISO code such as "GB", "US", "DE" etc.
 * If an invalid code is passed, the mutation will fail.
 */
export type CreateAddressInput = {
  city?: InputMaybe<Scalars["String"]["input"]>;
  company?: InputMaybe<Scalars["String"]["input"]>;
  countryCode: Scalars["String"]["input"];
  customFields?: InputMaybe<Scalars["JSON"]["input"]>;
  defaultBillingAddress?: InputMaybe<Scalars["Boolean"]["input"]>;
  defaultShippingAddress?: InputMaybe<Scalars["Boolean"]["input"]>;
  fullName?: InputMaybe<Scalars["String"]["input"]>;
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
  postalCode?: InputMaybe<Scalars["String"]["input"]>;
  province?: InputMaybe<Scalars["String"]["input"]>;
  streetLine1: Scalars["String"]["input"];
  streetLine2?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateCustomerCustomFieldsInput = {
  adminNotes?: InputMaybe<Scalars["String"]["input"]>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  wilaya?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateCustomerInput = {
  customFields?: InputMaybe<CreateCustomerCustomFieldsInput>;
  emailAddress: Scalars["String"]["input"];
  firstName: Scalars["String"]["input"];
  lastName: Scalars["String"]["input"];
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

/**
 * @description
 * ISO 4217 currency code
 *
 * @docsCategory common
 */
export enum CurrencyCode {
  /** United Arab Emirates dirham */
  Aed = "AED",
  /** Afghan afghani */
  Afn = "AFN",
  /** Albanian lek */
  All = "ALL",
  /** Armenian dram */
  Amd = "AMD",
  /** Netherlands Antillean guilder */
  Ang = "ANG",
  /** Angolan kwanza */
  Aoa = "AOA",
  /** Argentine peso */
  Ars = "ARS",
  /** Australian dollar */
  Aud = "AUD",
  /** Aruban florin */
  Awg = "AWG",
  /** Azerbaijani manat */
  Azn = "AZN",
  /** Bosnia and Herzegovina convertible mark */
  Bam = "BAM",
  /** Barbados dollar */
  Bbd = "BBD",
  /** Bangladeshi taka */
  Bdt = "BDT",
  /** Bulgarian lev */
  Bgn = "BGN",
  /** Bahraini dinar */
  Bhd = "BHD",
  /** Burundian franc */
  Bif = "BIF",
  /** Bermudian dollar */
  Bmd = "BMD",
  /** Brunei dollar */
  Bnd = "BND",
  /** Boliviano */
  Bob = "BOB",
  /** Brazilian real */
  Brl = "BRL",
  /** Bahamian dollar */
  Bsd = "BSD",
  /** Bhutanese ngultrum */
  Btn = "BTN",
  /** Botswana pula */
  Bwp = "BWP",
  /** Belarusian ruble */
  Byn = "BYN",
  /** Belize dollar */
  Bzd = "BZD",
  /** Canadian dollar */
  Cad = "CAD",
  /** Congolese franc */
  Cdf = "CDF",
  /** Swiss franc */
  Chf = "CHF",
  /** Chilean peso */
  Clp = "CLP",
  /** Renminbi (Chinese) yuan */
  Cny = "CNY",
  /** Colombian peso */
  Cop = "COP",
  /** Costa Rican colon */
  Crc = "CRC",
  /** Cuban convertible peso */
  Cuc = "CUC",
  /** Cuban peso */
  Cup = "CUP",
  /** Cape Verde escudo */
  Cve = "CVE",
  /** Czech koruna */
  Czk = "CZK",
  /** Djiboutian franc */
  Djf = "DJF",
  /** Danish krone */
  Dkk = "DKK",
  /** Dominican peso */
  Dop = "DOP",
  /** Algerian dinar */
  Dzd = "DZD",
  /** Egyptian pound */
  Egp = "EGP",
  /** Eritrean nakfa */
  Ern = "ERN",
  /** Ethiopian birr */
  Etb = "ETB",
  /** Euro */
  Eur = "EUR",
  /** Fiji dollar */
  Fjd = "FJD",
  /** Falkland Islands pound */
  Fkp = "FKP",
  /** Pound sterling */
  Gbp = "GBP",
  /** Georgian lari */
  Gel = "GEL",
  /** Ghanaian cedi */
  Ghs = "GHS",
  /** Gibraltar pound */
  Gip = "GIP",
  /** Gambian dalasi */
  Gmd = "GMD",
  /** Guinean franc */
  Gnf = "GNF",
  /** Guatemalan quetzal */
  Gtq = "GTQ",
  /** Guyanese dollar */
  Gyd = "GYD",
  /** Hong Kong dollar */
  Hkd = "HKD",
  /** Honduran lempira */
  Hnl = "HNL",
  /** Croatian kuna */
  Hrk = "HRK",
  /** Haitian gourde */
  Htg = "HTG",
  /** Hungarian forint */
  Huf = "HUF",
  /** Indonesian rupiah */
  Idr = "IDR",
  /** Israeli new shekel */
  Ils = "ILS",
  /** Indian rupee */
  Inr = "INR",
  /** Iraqi dinar */
  Iqd = "IQD",
  /** Iranian rial */
  Irr = "IRR",
  /** Icelandic króna */
  Isk = "ISK",
  /** Jamaican dollar */
  Jmd = "JMD",
  /** Jordanian dinar */
  Jod = "JOD",
  /** Japanese yen */
  Jpy = "JPY",
  /** Kenyan shilling */
  Kes = "KES",
  /** Kyrgyzstani som */
  Kgs = "KGS",
  /** Cambodian riel */
  Khr = "KHR",
  /** Comoro franc */
  Kmf = "KMF",
  /** North Korean won */
  Kpw = "KPW",
  /** South Korean won */
  Krw = "KRW",
  /** Kuwaiti dinar */
  Kwd = "KWD",
  /** Cayman Islands dollar */
  Kyd = "KYD",
  /** Kazakhstani tenge */
  Kzt = "KZT",
  /** Lao kip */
  Lak = "LAK",
  /** Lebanese pound */
  Lbp = "LBP",
  /** Sri Lankan rupee */
  Lkr = "LKR",
  /** Liberian dollar */
  Lrd = "LRD",
  /** Lesotho loti */
  Lsl = "LSL",
  /** Libyan dinar */
  Lyd = "LYD",
  /** Moroccan dirham */
  Mad = "MAD",
  /** Moldovan leu */
  Mdl = "MDL",
  /** Malagasy ariary */
  Mga = "MGA",
  /** Macedonian denar */
  Mkd = "MKD",
  /** Myanmar kyat */
  Mmk = "MMK",
  /** Mongolian tögrög */
  Mnt = "MNT",
  /** Macanese pataca */
  Mop = "MOP",
  /** Mauritanian ouguiya */
  Mru = "MRU",
  /** Mauritian rupee */
  Mur = "MUR",
  /** Maldivian rufiyaa */
  Mvr = "MVR",
  /** Malawian kwacha */
  Mwk = "MWK",
  /** Mexican peso */
  Mxn = "MXN",
  /** Malaysian ringgit */
  Myr = "MYR",
  /** Mozambican metical */
  Mzn = "MZN",
  /** Namibian dollar */
  Nad = "NAD",
  /** Nigerian naira */
  Ngn = "NGN",
  /** Nicaraguan córdoba */
  Nio = "NIO",
  /** Norwegian krone */
  Nok = "NOK",
  /** Nepalese rupee */
  Npr = "NPR",
  /** New Zealand dollar */
  Nzd = "NZD",
  /** Omani rial */
  Omr = "OMR",
  /** Panamanian balboa */
  Pab = "PAB",
  /** Peruvian sol */
  Pen = "PEN",
  /** Papua New Guinean kina */
  Pgk = "PGK",
  /** Philippine peso */
  Php = "PHP",
  /** Pakistani rupee */
  Pkr = "PKR",
  /** Polish złoty */
  Pln = "PLN",
  /** Paraguayan guaraní */
  Pyg = "PYG",
  /** Qatari riyal */
  Qar = "QAR",
  /** Romanian leu */
  Ron = "RON",
  /** Serbian dinar */
  Rsd = "RSD",
  /** Russian ruble */
  Rub = "RUB",
  /** Rwandan franc */
  Rwf = "RWF",
  /** Saudi riyal */
  Sar = "SAR",
  /** Solomon Islands dollar */
  Sbd = "SBD",
  /** Seychelles rupee */
  Scr = "SCR",
  /** Sudanese pound */
  Sdg = "SDG",
  /** Swedish krona/kronor */
  Sek = "SEK",
  /** Singapore dollar */
  Sgd = "SGD",
  /** Saint Helena pound */
  Shp = "SHP",
  /** Sierra Leonean leone */
  Sll = "SLL",
  /** Somali shilling */
  Sos = "SOS",
  /** Surinamese dollar */
  Srd = "SRD",
  /** South Sudanese pound */
  Ssp = "SSP",
  /** São Tomé and Príncipe dobra */
  Stn = "STN",
  /** Salvadoran colón */
  Svc = "SVC",
  /** Syrian pound */
  Syp = "SYP",
  /** Swazi lilangeni */
  Szl = "SZL",
  /** Thai baht */
  Thb = "THB",
  /** Tajikistani somoni */
  Tjs = "TJS",
  /** Turkmenistan manat */
  Tmt = "TMT",
  /** Tunisian dinar */
  Tnd = "TND",
  /** Tongan paʻanga */
  Top = "TOP",
  /** Turkish lira */
  Try = "TRY",
  /** Trinidad and Tobago dollar */
  Ttd = "TTD",
  /** New Taiwan dollar */
  Twd = "TWD",
  /** Tanzanian shilling */
  Tzs = "TZS",
  /** Ukrainian hryvnia */
  Uah = "UAH",
  /** Ugandan shilling */
  Ugx = "UGX",
  /** United States dollar */
  Usd = "USD",
  /** Uruguayan peso */
  Uyu = "UYU",
  /** Uzbekistan som */
  Uzs = "UZS",
  /** Venezuelan bolívar soberano */
  Ves = "VES",
  /** Vietnamese đồng */
  Vnd = "VND",
  /** Vanuatu vatu */
  Vuv = "VUV",
  /** Samoan tala */
  Wst = "WST",
  /** CFA franc BEAC */
  Xaf = "XAF",
  /** East Caribbean dollar */
  Xcd = "XCD",
  /** CFA franc BCEAO */
  Xof = "XOF",
  /** CFP franc (franc Pacifique) */
  Xpf = "XPF",
  /** Yemeni rial */
  Yer = "YER",
  /** South African rand */
  Zar = "ZAR",
  /** Zambian kwacha */
  Zmw = "ZMW",
  /** Zimbabwean dollar */
  Zwl = "ZWL",
}

export type CurrentUser = {
  __typename?: "CurrentUser";
  channels: Array<CurrentUserChannel>;
  id: Scalars["ID"]["output"];
  identifier: Scalars["String"]["output"];
};

export type CurrentUserChannel = {
  __typename?: "CurrentUserChannel";
  code: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  permissions: Array<Permission>;
  token: Scalars["String"]["output"];
};

export type CustomField = {
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type CustomFieldConfig =
  | BooleanCustomFieldConfig
  | DateTimeCustomFieldConfig
  | FloatCustomFieldConfig
  | IntCustomFieldConfig
  | LocaleStringCustomFieldConfig
  | LocaleTextCustomFieldConfig
  | RelationCustomFieldConfig
  | StringCustomFieldConfig
  | StructCustomFieldConfig
  | TextCustomFieldConfig;

export type Customer = Node & {
  __typename?: "Customer";
  addresses?: Maybe<Array<Address>>;
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<CustomerCustomFields>;
  emailAddress: Scalars["String"]["output"];
  firstName: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  lastName: Scalars["String"]["output"];
  orders: OrderList;
  phoneNumber?: Maybe<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
  user?: Maybe<User>;
};

export type CustomerOrdersArgs = {
  options?: InputMaybe<OrderListOptions>;
};

export type CustomerCustomFields = {
  __typename?: "CustomerCustomFields";
  adminNotes?: Maybe<Scalars["String"]["output"]>;
  city?: Maybe<Scalars["String"]["output"]>;
  wilaya?: Maybe<Scalars["String"]["output"]>;
};

export type CustomerFilterParameter = {
  _and?: InputMaybe<Array<CustomerFilterParameter>>;
  _or?: InputMaybe<Array<CustomerFilterParameter>>;
  adminNotes?: InputMaybe<StringOperators>;
  city?: InputMaybe<StringOperators>;
  createdAt?: InputMaybe<DateOperators>;
  emailAddress?: InputMaybe<StringOperators>;
  firstName?: InputMaybe<StringOperators>;
  id?: InputMaybe<IdOperators>;
  lastName?: InputMaybe<StringOperators>;
  phoneNumber?: InputMaybe<StringOperators>;
  title?: InputMaybe<StringOperators>;
  updatedAt?: InputMaybe<DateOperators>;
  wilaya?: InputMaybe<StringOperators>;
};

export type CustomerGroup = Node & {
  __typename?: "CustomerGroup";
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  customers: CustomerList;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type CustomerGroupCustomersArgs = {
  options?: InputMaybe<CustomerListOptions>;
};

export type CustomerList = PaginatedList & {
  __typename?: "CustomerList";
  items: Array<Customer>;
  totalItems: Scalars["Int"]["output"];
};

export type CustomerListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<CustomerFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<LogicalOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<CustomerSortParameter>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type CustomerSortParameter = {
  adminNotes?: InputMaybe<SortOrder>;
  city?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  emailAddress?: InputMaybe<SortOrder>;
  firstName?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  lastName?: InputMaybe<SortOrder>;
  phoneNumber?: InputMaybe<SortOrder>;
  title?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
  wilaya?: InputMaybe<SortOrder>;
};

/** Operators for filtering on a list of Date fields */
export type DateListOperators = {
  inList: Scalars["DateTime"]["input"];
};

/** Operators for filtering on a DateTime field */
export type DateOperators = {
  after?: InputMaybe<Scalars["DateTime"]["input"]>;
  before?: InputMaybe<Scalars["DateTime"]["input"]>;
  between?: InputMaybe<DateRange>;
  eq?: InputMaybe<Scalars["DateTime"]["input"]>;
  isNull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type DateRange = {
  end: Scalars["DateTime"]["input"];
  start: Scalars["DateTime"]["input"];
};

/**
 * Expects the same validation formats as the `<input type="datetime-local">` HTML element.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#Additional_attributes
 */
export type DateTimeCustomFieldConfig = CustomField & {
  __typename?: "DateTimeCustomFieldConfig";
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  max?: Maybe<Scalars["String"]["output"]>;
  min?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  step?: Maybe<Scalars["Int"]["output"]>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

/**
 * Expects the same validation formats as the `<input type="datetime-local">` HTML element.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#Additional_attributes
 */
export type DateTimeStructFieldConfig = StructField & {
  __typename?: "DateTimeStructFieldConfig";
  description?: Maybe<Array<LocalizedString>>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  max?: Maybe<Scalars["String"]["output"]>;
  min?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  step?: Maybe<Scalars["Int"]["output"]>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type DeletionResponse = {
  __typename?: "DeletionResponse";
  message?: Maybe<Scalars["String"]["output"]>;
  result: DeletionResult;
};

export enum DeletionResult {
  /** The entity was successfully deleted */
  Deleted = "DELETED",
  /** Deletion did not take place, reason given in message */
  NotDeleted = "NOT_DELETED",
}

export type Discount = {
  __typename?: "Discount";
  adjustmentSource: Scalars["String"]["output"];
  amount: Scalars["Money"]["output"];
  amountWithTax: Scalars["Money"]["output"];
  description: Scalars["String"]["output"];
  type: AdjustmentType;
};

/** Returned when attempting to create a Customer with an email address already registered to an existing User. */
export type EmailAddressConflictError = ErrorResult & {
  __typename?: "EmailAddressConflictError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

export enum ErrorCode {
  AlreadyLoggedInError = "ALREADY_LOGGED_IN_ERROR",
  CouponCodeExpiredError = "COUPON_CODE_EXPIRED_ERROR",
  CouponCodeInvalidError = "COUPON_CODE_INVALID_ERROR",
  CouponCodeLimitError = "COUPON_CODE_LIMIT_ERROR",
  EmailAddressConflictError = "EMAIL_ADDRESS_CONFLICT_ERROR",
  GuestCheckoutError = "GUEST_CHECKOUT_ERROR",
  IdentifierChangeTokenExpiredError = "IDENTIFIER_CHANGE_TOKEN_EXPIRED_ERROR",
  IdentifierChangeTokenInvalidError = "IDENTIFIER_CHANGE_TOKEN_INVALID_ERROR",
  IneligiblePaymentMethodError = "INELIGIBLE_PAYMENT_METHOD_ERROR",
  IneligibleShippingMethodError = "INELIGIBLE_SHIPPING_METHOD_ERROR",
  InsufficientStockError = "INSUFFICIENT_STOCK_ERROR",
  InvalidCredentialsError = "INVALID_CREDENTIALS_ERROR",
  MissingPasswordError = "MISSING_PASSWORD_ERROR",
  NativeAuthStrategyError = "NATIVE_AUTH_STRATEGY_ERROR",
  NegativeQuantityError = "NEGATIVE_QUANTITY_ERROR",
  NotVerifiedError = "NOT_VERIFIED_ERROR",
  NoActiveOrderError = "NO_ACTIVE_ORDER_ERROR",
  OrderInterceptorError = "ORDER_INTERCEPTOR_ERROR",
  OrderLimitError = "ORDER_LIMIT_ERROR",
  OrderModificationError = "ORDER_MODIFICATION_ERROR",
  OrderPaymentStateError = "ORDER_PAYMENT_STATE_ERROR",
  OrderStateTransitionError = "ORDER_STATE_TRANSITION_ERROR",
  PasswordAlreadySetError = "PASSWORD_ALREADY_SET_ERROR",
  PasswordResetTokenExpiredError = "PASSWORD_RESET_TOKEN_EXPIRED_ERROR",
  PasswordResetTokenInvalidError = "PASSWORD_RESET_TOKEN_INVALID_ERROR",
  PasswordValidationError = "PASSWORD_VALIDATION_ERROR",
  PaymentDeclinedError = "PAYMENT_DECLINED_ERROR",
  PaymentFailedError = "PAYMENT_FAILED_ERROR",
  UnknownError = "UNKNOWN_ERROR",
  VerificationTokenExpiredError = "VERIFICATION_TOKEN_EXPIRED_ERROR",
  VerificationTokenInvalidError = "VERIFICATION_TOKEN_INVALID_ERROR",
}

export type ErrorResult = {
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

export type Facet = Node & {
  __typename?: "Facet";
  code: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  translations: Array<FacetTranslation>;
  updatedAt: Scalars["DateTime"]["output"];
  /** Returns a paginated, sortable, filterable list of the Facet's values. Added in v2.1.0. */
  valueList: FacetValueList;
  values: Array<FacetValue>;
};

export type FacetValueListArgs = {
  options?: InputMaybe<FacetValueListOptions>;
};

export type FacetFilterParameter = {
  _and?: InputMaybe<Array<FacetFilterParameter>>;
  _or?: InputMaybe<Array<FacetFilterParameter>>;
  code?: InputMaybe<StringOperators>;
  createdAt?: InputMaybe<DateOperators>;
  id?: InputMaybe<IdOperators>;
  languageCode?: InputMaybe<StringOperators>;
  name?: InputMaybe<StringOperators>;
  updatedAt?: InputMaybe<DateOperators>;
};

export type FacetList = PaginatedList & {
  __typename?: "FacetList";
  items: Array<Facet>;
  totalItems: Scalars["Int"]["output"];
};

export type FacetListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<FacetFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<LogicalOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<FacetSortParameter>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type FacetSortParameter = {
  code?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type FacetTranslation = {
  __typename?: "FacetTranslation";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type FacetValue = Node & {
  __typename?: "FacetValue";
  code: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<FacetValueCustomFields>;
  facet: Facet;
  facetId: Scalars["ID"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  translations: Array<FacetValueTranslation>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type FacetValueCustomFields = {
  __typename?: "FacetValueCustomFields";
  colorHex?: Maybe<Scalars["String"]["output"]>;
};

/**
 * Used to construct boolean expressions for filtering search results
 * by FacetValue ID. Examples:
 *
 * * ID=1 OR ID=2: `{ facetValueFilters: [{ or: [1,2] }] }`
 * * ID=1 AND ID=2: `{ facetValueFilters: [{ and: 1 }, { and: 2 }] }`
 * * ID=1 AND (ID=2 OR ID=3): `{ facetValueFilters: [{ and: 1 }, { or: [2,3] }] }`
 */
export type FacetValueFilterInput = {
  and?: InputMaybe<Scalars["ID"]["input"]>;
  or?: InputMaybe<Array<Scalars["ID"]["input"]>>;
};

export type FacetValueFilterParameter = {
  _and?: InputMaybe<Array<FacetValueFilterParameter>>;
  _or?: InputMaybe<Array<FacetValueFilterParameter>>;
  code?: InputMaybe<StringOperators>;
  colorHex?: InputMaybe<StringOperators>;
  createdAt?: InputMaybe<DateOperators>;
  facetId?: InputMaybe<IdOperators>;
  id?: InputMaybe<IdOperators>;
  languageCode?: InputMaybe<StringOperators>;
  name?: InputMaybe<StringOperators>;
  updatedAt?: InputMaybe<DateOperators>;
};

export type FacetValueList = PaginatedList & {
  __typename?: "FacetValueList";
  items: Array<FacetValue>;
  totalItems: Scalars["Int"]["output"];
};

export type FacetValueListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<FacetValueFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<LogicalOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<FacetValueSortParameter>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

/**
 * Which FacetValues are present in the products returned
 * by the search, and in what quantity.
 */
export type FacetValueResult = {
  __typename?: "FacetValueResult";
  count: Scalars["Int"]["output"];
  facetValue: FacetValue;
};

export type FacetValueSortParameter = {
  code?: InputMaybe<SortOrder>;
  colorHex?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  facetId?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type FacetValueTranslation = {
  __typename?: "FacetValueTranslation";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type FloatCustomFieldConfig = CustomField & {
  __typename?: "FloatCustomFieldConfig";
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  max?: Maybe<Scalars["Float"]["output"]>;
  min?: Maybe<Scalars["Float"]["output"]>;
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  step?: Maybe<Scalars["Float"]["output"]>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type FloatStructFieldConfig = StructField & {
  __typename?: "FloatStructFieldConfig";
  description?: Maybe<Array<LocalizedString>>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  max?: Maybe<Scalars["Float"]["output"]>;
  min?: Maybe<Scalars["Float"]["output"]>;
  name: Scalars["String"]["output"];
  step?: Maybe<Scalars["Float"]["output"]>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type Fulfillment = Node & {
  __typename?: "Fulfillment";
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  id: Scalars["ID"]["output"];
  lines: Array<FulfillmentLine>;
  method: Scalars["String"]["output"];
  state: Scalars["String"]["output"];
  /** @deprecated Use the `lines` field instead */
  summary: Array<FulfillmentLine>;
  trackingCode?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type FulfillmentLine = {
  __typename?: "FulfillmentLine";
  fulfillment: Fulfillment;
  fulfillmentId: Scalars["ID"]["output"];
  orderLine: OrderLine;
  orderLineId: Scalars["ID"]["output"];
  quantity: Scalars["Int"]["output"];
};

export enum GlobalFlag {
  False = "FALSE",
  Inherit = "INHERIT",
  True = "TRUE",
}

/** Returned when attempting to set the Customer on a guest checkout when the configured GuestCheckoutStrategy does not allow it. */
export type GuestCheckoutError = ErrorResult & {
  __typename?: "GuestCheckoutError";
  errorCode: ErrorCode;
  errorDetail: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
};

export type HistoryEntry = Node & {
  __typename?: "HistoryEntry";
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  data: Scalars["JSON"]["output"];
  id: Scalars["ID"]["output"];
  type: HistoryEntryType;
  updatedAt: Scalars["DateTime"]["output"];
};

export type HistoryEntryFilterParameter = {
  _and?: InputMaybe<Array<HistoryEntryFilterParameter>>;
  _or?: InputMaybe<Array<HistoryEntryFilterParameter>>;
  createdAt?: InputMaybe<DateOperators>;
  id?: InputMaybe<IdOperators>;
  type?: InputMaybe<StringOperators>;
  updatedAt?: InputMaybe<DateOperators>;
};

export type HistoryEntryList = PaginatedList & {
  __typename?: "HistoryEntryList";
  items: Array<HistoryEntry>;
  totalItems: Scalars["Int"]["output"];
};

export type HistoryEntryListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<HistoryEntryFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<LogicalOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<HistoryEntrySortParameter>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type HistoryEntrySortParameter = {
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export enum HistoryEntryType {
  CustomerAddedToGroup = "CUSTOMER_ADDED_TO_GROUP",
  CustomerAddressCreated = "CUSTOMER_ADDRESS_CREATED",
  CustomerAddressDeleted = "CUSTOMER_ADDRESS_DELETED",
  CustomerAddressUpdated = "CUSTOMER_ADDRESS_UPDATED",
  CustomerDetailUpdated = "CUSTOMER_DETAIL_UPDATED",
  CustomerEmailUpdateRequested = "CUSTOMER_EMAIL_UPDATE_REQUESTED",
  CustomerEmailUpdateVerified = "CUSTOMER_EMAIL_UPDATE_VERIFIED",
  CustomerNote = "CUSTOMER_NOTE",
  CustomerPasswordResetRequested = "CUSTOMER_PASSWORD_RESET_REQUESTED",
  CustomerPasswordResetVerified = "CUSTOMER_PASSWORD_RESET_VERIFIED",
  CustomerPasswordUpdated = "CUSTOMER_PASSWORD_UPDATED",
  CustomerRegistered = "CUSTOMER_REGISTERED",
  CustomerRemovedFromGroup = "CUSTOMER_REMOVED_FROM_GROUP",
  CustomerVerified = "CUSTOMER_VERIFIED",
  OrderCancellation = "ORDER_CANCELLATION",
  OrderCouponApplied = "ORDER_COUPON_APPLIED",
  OrderCouponRemoved = "ORDER_COUPON_REMOVED",
  OrderCustomerUpdated = "ORDER_CUSTOMER_UPDATED",
  OrderFulfillment = "ORDER_FULFILLMENT",
  OrderFulfillmentTransition = "ORDER_FULFILLMENT_TRANSITION",
  OrderModified = "ORDER_MODIFIED",
  OrderNote = "ORDER_NOTE",
  OrderPaymentTransition = "ORDER_PAYMENT_TRANSITION",
  OrderRefundTransition = "ORDER_REFUND_TRANSITION",
  OrderStateTransition = "ORDER_STATE_TRANSITION",
}

/** Operators for filtering on a list of ID fields */
export type IdListOperators = {
  inList: Scalars["ID"]["input"];
};

/** Operators for filtering on an ID field */
export type IdOperators = {
  eq?: InputMaybe<Scalars["String"]["input"]>;
  in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  isNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  notEq?: InputMaybe<Scalars["String"]["input"]>;
  notIn?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

/**
 * Returned if the token used to change a Customer's email address is valid, but has
 * expired according to the `verificationTokenDuration` setting in the AuthOptions.
 */
export type IdentifierChangeTokenExpiredError = ErrorResult & {
  __typename?: "IdentifierChangeTokenExpiredError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/**
 * Returned if the token used to change a Customer's email address is either
 * invalid or does not match any expected tokens.
 */
export type IdentifierChangeTokenInvalidError = ErrorResult & {
  __typename?: "IdentifierChangeTokenInvalidError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/** Returned when attempting to add a Payment using a PaymentMethod for which the Order is not eligible. */
export type IneligiblePaymentMethodError = ErrorResult & {
  __typename?: "IneligiblePaymentMethodError";
  eligibilityCheckerMessage?: Maybe<Scalars["String"]["output"]>;
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/** Returned when attempting to set a ShippingMethod for which the Order is not eligible */
export type IneligibleShippingMethodError = ErrorResult & {
  __typename?: "IneligibleShippingMethodError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/** Returned when attempting to add more items to the Order than are available */
export type InsufficientStockError = ErrorResult & {
  __typename?: "InsufficientStockError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
  order: Order;
  quantityAvailable: Scalars["Int"]["output"];
};

export type IntCustomFieldConfig = CustomField & {
  __typename?: "IntCustomFieldConfig";
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  max?: Maybe<Scalars["Int"]["output"]>;
  min?: Maybe<Scalars["Int"]["output"]>;
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  step?: Maybe<Scalars["Int"]["output"]>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type IntStructFieldConfig = StructField & {
  __typename?: "IntStructFieldConfig";
  description?: Maybe<Array<LocalizedString>>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  max?: Maybe<Scalars["Int"]["output"]>;
  min?: Maybe<Scalars["Int"]["output"]>;
  name: Scalars["String"]["output"];
  step?: Maybe<Scalars["Int"]["output"]>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

/** Returned if the user authentication credentials are not valid */
export type InvalidCredentialsError = ErrorResult & {
  __typename?: "InvalidCredentialsError";
  authenticationError: Scalars["String"]["output"];
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/**
 * @description
 * Languages in the form of a ISO 639-1 language code with optional
 * region or script modifier (e.g. de_AT). The selection available is based
 * on the [Unicode CLDR summary list](https://unicode-org.github.io/cldr-staging/charts/37/summary/root.html)
 * and includes the major spoken languages of the world and any widely-used variants.
 *
 * @docsCategory common
 */
export enum LanguageCode {
  /** Afrikaans */
  Af = "af",
  /** Akan */
  Ak = "ak",
  /** Amharic */
  Am = "am",
  /** Arabic */
  Ar = "ar",
  /** Assamese */
  As = "as",
  /** Azerbaijani */
  Az = "az",
  /** Belarusian */
  Be = "be",
  /** Bulgarian */
  Bg = "bg",
  /** Bambara */
  Bm = "bm",
  /** Bangla */
  Bn = "bn",
  /** Tibetan */
  Bo = "bo",
  /** Breton */
  Br = "br",
  /** Bosnian */
  Bs = "bs",
  /** Catalan */
  Ca = "ca",
  /** Chechen */
  Ce = "ce",
  /** Corsican */
  Co = "co",
  /** Czech */
  Cs = "cs",
  /** Church Slavic */
  Cu = "cu",
  /** Welsh */
  Cy = "cy",
  /** Danish */
  Da = "da",
  /** German */
  De = "de",
  /** Austrian German */
  DeAt = "de_AT",
  /** Swiss High German */
  DeCh = "de_CH",
  /** Dzongkha */
  Dz = "dz",
  /** Ewe */
  Ee = "ee",
  /** Greek */
  El = "el",
  /** English */
  En = "en",
  /** Australian English */
  EnAu = "en_AU",
  /** Canadian English */
  EnCa = "en_CA",
  /** British English */
  EnGb = "en_GB",
  /** American English */
  EnUs = "en_US",
  /** Esperanto */
  Eo = "eo",
  /** Spanish */
  Es = "es",
  /** European Spanish */
  EsEs = "es_ES",
  /** Mexican Spanish */
  EsMx = "es_MX",
  /** Estonian */
  Et = "et",
  /** Basque */
  Eu = "eu",
  /** Persian */
  Fa = "fa",
  /** Dari */
  FaAf = "fa_AF",
  /** Fulah */
  Ff = "ff",
  /** Finnish */
  Fi = "fi",
  /** Faroese */
  Fo = "fo",
  /** French */
  Fr = "fr",
  /** Canadian French */
  FrCa = "fr_CA",
  /** Swiss French */
  FrCh = "fr_CH",
  /** Western Frisian */
  Fy = "fy",
  /** Irish */
  Ga = "ga",
  /** Scottish Gaelic */
  Gd = "gd",
  /** Galician */
  Gl = "gl",
  /** Gujarati */
  Gu = "gu",
  /** Manx */
  Gv = "gv",
  /** Hausa */
  Ha = "ha",
  /** Hebrew */
  He = "he",
  /** Hindi */
  Hi = "hi",
  /** Croatian */
  Hr = "hr",
  /** Haitian Creole */
  Ht = "ht",
  /** Hungarian */
  Hu = "hu",
  /** Armenian */
  Hy = "hy",
  /** Interlingua */
  Ia = "ia",
  /** Indonesian */
  Id = "id",
  /** Igbo */
  Ig = "ig",
  /** Sichuan Yi */
  Ii = "ii",
  /** Icelandic */
  Is = "is",
  /** Italian */
  It = "it",
  /** Japanese */
  Ja = "ja",
  /** Javanese */
  Jv = "jv",
  /** Georgian */
  Ka = "ka",
  /** Kikuyu */
  Ki = "ki",
  /** Kazakh */
  Kk = "kk",
  /** Kalaallisut */
  Kl = "kl",
  /** Khmer */
  Km = "km",
  /** Kannada */
  Kn = "kn",
  /** Korean */
  Ko = "ko",
  /** Kashmiri */
  Ks = "ks",
  /** Kurdish */
  Ku = "ku",
  /** Cornish */
  Kw = "kw",
  /** Kyrgyz */
  Ky = "ky",
  /** Latin */
  La = "la",
  /** Luxembourgish */
  Lb = "lb",
  /** Ganda */
  Lg = "lg",
  /** Lingala */
  Ln = "ln",
  /** Lao */
  Lo = "lo",
  /** Lithuanian */
  Lt = "lt",
  /** Luba-Katanga */
  Lu = "lu",
  /** Latvian */
  Lv = "lv",
  /** Malagasy */
  Mg = "mg",
  /** Maori */
  Mi = "mi",
  /** Macedonian */
  Mk = "mk",
  /** Malayalam */
  Ml = "ml",
  /** Mongolian */
  Mn = "mn",
  /** Marathi */
  Mr = "mr",
  /** Malay */
  Ms = "ms",
  /** Maltese */
  Mt = "mt",
  /** Burmese */
  My = "my",
  /** Norwegian Bokmål */
  Nb = "nb",
  /** North Ndebele */
  Nd = "nd",
  /** Nepali */
  Ne = "ne",
  /** Dutch */
  Nl = "nl",
  /** Flemish */
  NlBe = "nl_BE",
  /** Norwegian Nynorsk */
  Nn = "nn",
  /** Nyanja */
  Ny = "ny",
  /** Oromo */
  Om = "om",
  /** Odia */
  Or = "or",
  /** Ossetic */
  Os = "os",
  /** Punjabi */
  Pa = "pa",
  /** Polish */
  Pl = "pl",
  /** Pashto */
  Ps = "ps",
  /** Portuguese */
  Pt = "pt",
  /** Brazilian Portuguese */
  PtBr = "pt_BR",
  /** European Portuguese */
  PtPt = "pt_PT",
  /** Quechua */
  Qu = "qu",
  /** Romansh */
  Rm = "rm",
  /** Rundi */
  Rn = "rn",
  /** Romanian */
  Ro = "ro",
  /** Moldavian */
  RoMd = "ro_MD",
  /** Russian */
  Ru = "ru",
  /** Kinyarwanda */
  Rw = "rw",
  /** Sanskrit */
  Sa = "sa",
  /** Sindhi */
  Sd = "sd",
  /** Northern Sami */
  Se = "se",
  /** Sango */
  Sg = "sg",
  /** Sinhala */
  Si = "si",
  /** Slovak */
  Sk = "sk",
  /** Slovenian */
  Sl = "sl",
  /** Samoan */
  Sm = "sm",
  /** Shona */
  Sn = "sn",
  /** Somali */
  So = "so",
  /** Albanian */
  Sq = "sq",
  /** Serbian */
  Sr = "sr",
  /** Southern Sotho */
  St = "st",
  /** Sundanese */
  Su = "su",
  /** Swedish */
  Sv = "sv",
  /** Swahili */
  Sw = "sw",
  /** Congo Swahili */
  SwCd = "sw_CD",
  /** Tamil */
  Ta = "ta",
  /** Telugu */
  Te = "te",
  /** Tajik */
  Tg = "tg",
  /** Thai */
  Th = "th",
  /** Tigrinya */
  Ti = "ti",
  /** Turkmen */
  Tk = "tk",
  /** Tongan */
  To = "to",
  /** Turkish */
  Tr = "tr",
  /** Tatar */
  Tt = "tt",
  /** Uyghur */
  Ug = "ug",
  /** Ukrainian */
  Uk = "uk",
  /** Urdu */
  Ur = "ur",
  /** Uzbek */
  Uz = "uz",
  /** Vietnamese */
  Vi = "vi",
  /** Volapük */
  Vo = "vo",
  /** Wolof */
  Wo = "wo",
  /** Xhosa */
  Xh = "xh",
  /** Yiddish */
  Yi = "yi",
  /** Yoruba */
  Yo = "yo",
  /** Chinese */
  Zh = "zh",
  /** Simplified Chinese */
  ZhHans = "zh_Hans",
  /** Traditional Chinese */
  ZhHant = "zh_Hant",
  /** Zulu */
  Zu = "zu",
}

export type LocaleStringCustomFieldConfig = CustomField & {
  __typename?: "LocaleStringCustomFieldConfig";
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  length?: Maybe<Scalars["Int"]["output"]>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  pattern?: Maybe<Scalars["String"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type LocaleTextCustomFieldConfig = CustomField & {
  __typename?: "LocaleTextCustomFieldConfig";
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type LocalizedString = {
  __typename?: "LocalizedString";
  languageCode: LanguageCode;
  value: Scalars["String"]["output"];
};

export enum LogicalOperator {
  And = "AND",
  Or = "OR",
}

/** Returned when attempting to register or verify a customer account without a password, when one is required. */
export type MissingPasswordError = ErrorResult & {
  __typename?: "MissingPasswordError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

export type MultilingualSearchResult = {
  __typename?: "MultilingualSearchResult";
  items: Array<Product>;
  totalItems: Scalars["Int"]["output"];
};

export type Mutation = {
  __typename?: "Mutation";
  /** Adds an item to the Order. If custom fields are defined on the OrderLine entity, a third argument 'customFields' will be available. */
  addItemToOrder: UpdateOrderItemsResult;
  /** Adds mutliple items to the Order. Returns a list of errors for each item that failed to add. It will still add successful items. */
  addItemsToOrder: UpdateMultipleOrderItemsResult;
  /** Add a Payment to the Order */
  addPaymentToOrder: AddPaymentToOrderResult;
  /** Adjusts an OrderLine. If custom fields are defined on the OrderLine entity, a third argument 'customFields' of type `OrderLineCustomFieldsInput` will be available. */
  adjustOrderLine: UpdateOrderItemsResult;
  /** Applies the given coupon code to the active Order */
  applyCouponCode: ApplyCouponCodeResult;
  /** Authenticates the user using a named authentication strategy */
  authenticate: AuthenticationResult;
  /** Create a new Customer Address */
  createCustomerAddress: Address;
  /** Delete an existing Address */
  deleteCustomerAddress: Success;
  /**
   * Authenticates the user using the native authentication strategy. This mutation is an alias for authenticate({ native: { ... }})
   *
   * The `rememberMe` option applies when using cookie-based sessions, and if `true` it will set the maxAge of the session cookie
   * to 1 year.
   */
  login: NativeAuthenticationResult;
  /** End the current authenticated session */
  logout: Success;
  /** Regenerate and send a verification token for a new Customer registration. Only applicable if `authOptions.requireVerification` is set to true. */
  refreshCustomerVerification: RefreshCustomerVerificationResult;
  /**
   * Register a Customer account with the given credentials. There are three possible registration flows:
   *
   * _If `authOptions.requireVerification` is set to `true`:_
   *
   * 1. **The Customer is registered _with_ a password**. A verificationToken will be created (and typically emailed to the Customer). That
   *    verificationToken would then be passed to the `verifyCustomerAccount` mutation _without_ a password. The Customer is then
   *    verified and authenticated in one step.
   * 2. **The Customer is registered _without_ a password**. A verificationToken will be created (and typically emailed to the Customer). That
   *    verificationToken would then be passed to the `verifyCustomerAccount` mutation _with_ the chosen password of the Customer. The Customer is then
   *    verified and authenticated in one step.
   *
   * _If `authOptions.requireVerification` is set to `false`:_
   *
   * 3. The Customer _must_ be registered _with_ a password. No further action is needed - the Customer is able to authenticate immediately.
   */
  registerCustomerAccount: RegisterCustomerAccountResult;
  /** Remove all OrderLine from the Order */
  removeAllOrderLines: RemoveOrderItemsResult;
  /** Removes the given coupon code from the active Order */
  removeCouponCode?: Maybe<Order>;
  /** Remove an OrderLine from the Order */
  removeOrderLine: RemoveOrderItemsResult;
  /** Requests a password reset email to be sent */
  requestPasswordReset?: Maybe<RequestPasswordResetResult>;
  /**
   * Request to update the emailAddress of the active Customer. If `authOptions.requireVerification` is enabled
   * (as is the default), then the `identifierChangeToken` will be assigned to the current User and
   * a IdentifierChangeRequestEvent will be raised. This can then be used e.g. by the EmailPlugin to email
   * that verification token to the Customer, which is then used to verify the change of email address.
   */
  requestUpdateCustomerEmailAddress: RequestUpdateCustomerEmailAddressResult;
  /** Resets a Customer's password based on the provided token */
  resetPassword: ResetPasswordResult;
  /** Set the Customer for the Order. Required only if the Customer is not currently logged in */
  setCustomerForOrder: SetCustomerForOrderResult;
  /** Sets the billing address for the active Order */
  setOrderBillingAddress: ActiveOrderResult;
  /** Allows any custom fields to be set for the active Order */
  setOrderCustomFields: ActiveOrderResult;
  /** Sets the shipping address for the active Order */
  setOrderShippingAddress: ActiveOrderResult;
  /**
   * Sets the shipping method by id, which can be obtained with the `eligibleShippingMethods` query.
   * An Order can have multiple shipping methods, in which case you can pass an array of ids. In this case,
   * you should configure a custom ShippingLineAssignmentStrategy in order to know which OrderLines each
   * shipping method will apply to.
   */
  setOrderShippingMethod: SetOrderShippingMethodResult;
  /** Track product view for analytics */
  trackProductView: Scalars["Boolean"]["output"];
  /** Transitions an Order to a new state. Valid next states can be found by querying `nextOrderStates` */
  transitionOrderToState?: Maybe<TransitionOrderToStateResult>;
  /** Unsets the billing address for the active Order. Available since version 3.1.0 */
  unsetOrderBillingAddress: ActiveOrderResult;
  /** Unsets the shipping address for the active Order. Available since version 3.1.0 */
  unsetOrderShippingAddress: ActiveOrderResult;
  /** Update an existing Customer */
  updateCustomer: Customer;
  /** Update an existing Address */
  updateCustomerAddress: Address;
  /**
   * Confirm the update of the emailAddress with the provided token, which has been generated by the
   * `requestUpdateCustomerEmailAddress` mutation.
   */
  updateCustomerEmailAddress: UpdateCustomerEmailAddressResult;
  /** Update the password of the active Customer */
  updateCustomerPassword: UpdateCustomerPasswordResult;
  /**
   * Verify a Customer email address with the token sent to that address. Only applicable if `authOptions.requireVerification` is set to true.
   *
   * If the Customer was not registered with a password in the `registerCustomerAccount` mutation, the password _must_ be
   * provided here.
   */
  verifyCustomerAccount: VerifyCustomerAccountResult;
};

export type MutationAddItemToOrderArgs = {
  productVariantId: Scalars["ID"]["input"];
  quantity: Scalars["Int"]["input"];
};

export type MutationAddItemsToOrderArgs = {
  inputs: Array<AddItemInput>;
};

export type MutationAddPaymentToOrderArgs = {
  input: PaymentInput;
};

export type MutationAdjustOrderLineArgs = {
  orderLineId: Scalars["ID"]["input"];
  quantity: Scalars["Int"]["input"];
};

export type MutationApplyCouponCodeArgs = {
  couponCode: Scalars["String"]["input"];
};

export type MutationAuthenticateArgs = {
  input: AuthenticationInput;
  rememberMe?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationCreateCustomerAddressArgs = {
  input: CreateAddressInput;
};

export type MutationDeleteCustomerAddressArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationLoginArgs = {
  password: Scalars["String"]["input"];
  rememberMe?: InputMaybe<Scalars["Boolean"]["input"]>;
  username: Scalars["String"]["input"];
};

export type MutationRefreshCustomerVerificationArgs = {
  emailAddress: Scalars["String"]["input"];
};

export type MutationRegisterCustomerAccountArgs = {
  input: RegisterCustomerInput;
};

export type MutationRemoveCouponCodeArgs = {
  couponCode: Scalars["String"]["input"];
};

export type MutationRemoveOrderLineArgs = {
  orderLineId: Scalars["ID"]["input"];
};

export type MutationRequestPasswordResetArgs = {
  emailAddress: Scalars["String"]["input"];
};

export type MutationRequestUpdateCustomerEmailAddressArgs = {
  newEmailAddress: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
};

export type MutationResetPasswordArgs = {
  password: Scalars["String"]["input"];
  token: Scalars["String"]["input"];
};

export type MutationSetCustomerForOrderArgs = {
  input: CreateCustomerInput;
};

export type MutationSetOrderBillingAddressArgs = {
  input: CreateAddressInput;
};

export type MutationSetOrderCustomFieldsArgs = {
  input: UpdateOrderInput;
};

export type MutationSetOrderShippingAddressArgs = {
  input: CreateAddressInput;
};

export type MutationSetOrderShippingMethodArgs = {
  shippingMethodId: Array<Scalars["ID"]["input"]>;
};

export type MutationTrackProductViewArgs = {
  productId: Scalars["ID"]["input"];
};

export type MutationTransitionOrderToStateArgs = {
  state: Scalars["String"]["input"];
};

export type MutationUpdateCustomerArgs = {
  input: UpdateCustomerInput;
};

export type MutationUpdateCustomerAddressArgs = {
  input: UpdateAddressInput;
};

export type MutationUpdateCustomerEmailAddressArgs = {
  token: Scalars["String"]["input"];
};

export type MutationUpdateCustomerPasswordArgs = {
  currentPassword: Scalars["String"]["input"];
  newPassword: Scalars["String"]["input"];
};

export type MutationVerifyCustomerAccountArgs = {
  password?: InputMaybe<Scalars["String"]["input"]>;
  token: Scalars["String"]["input"];
};

export type NativeAuthInput = {
  password: Scalars["String"]["input"];
  username: Scalars["String"]["input"];
};

/** Returned when attempting an operation that relies on the NativeAuthStrategy, if that strategy is not configured. */
export type NativeAuthStrategyError = ErrorResult & {
  __typename?: "NativeAuthStrategyError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

export type NativeAuthenticationResult =
  | CurrentUser
  | InvalidCredentialsError
  | NativeAuthStrategyError
  | NotVerifiedError;

/** Returned when attempting to set a negative OrderLine quantity. */
export type NegativeQuantityError = ErrorResult & {
  __typename?: "NegativeQuantityError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/**
 * Returned when invoking a mutation which depends on there being an active Order on the
 * current session.
 */
export type NoActiveOrderError = ErrorResult & {
  __typename?: "NoActiveOrderError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

export type Node = {
  id: Scalars["ID"]["output"];
};

/**
 * Returned if `authOptions.requireVerification` is set to `true` (which is the default)
 * and an unverified user attempts to authenticate.
 */
export type NotVerifiedError = ErrorResult & {
  __typename?: "NotVerifiedError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/** Operators for filtering on a list of Number fields */
export type NumberListOperators = {
  inList: Scalars["Float"]["input"];
};

/** Operators for filtering on a Int or Float field */
export type NumberOperators = {
  between?: InputMaybe<NumberRange>;
  eq?: InputMaybe<Scalars["Float"]["input"]>;
  gt?: InputMaybe<Scalars["Float"]["input"]>;
  gte?: InputMaybe<Scalars["Float"]["input"]>;
  isNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  lt?: InputMaybe<Scalars["Float"]["input"]>;
  lte?: InputMaybe<Scalars["Float"]["input"]>;
};

export type NumberRange = {
  end: Scalars["Float"]["input"];
  start: Scalars["Float"]["input"];
};

export type Order = Node & {
  __typename?: "Order";
  /** An order is active as long as the payment process has not been completed */
  active: Scalars["Boolean"]["output"];
  billingAddress?: Maybe<OrderAddress>;
  /** A unique code for the Order */
  code: Scalars["String"]["output"];
  /** An array of all coupon codes applied to the Order */
  couponCodes: Array<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  currencyCode: CurrencyCode;
  customFields?: Maybe<OrderCustomFields>;
  customer?: Maybe<Customer>;
  discounts: Array<Discount>;
  fulfillments?: Maybe<Array<Fulfillment>>;
  history: HistoryEntryList;
  id: Scalars["ID"]["output"];
  lines: Array<OrderLine>;
  /**
   * The date & time that the Order was placed, i.e. the Customer
   * completed the checkout and the Order is no longer "active"
   */
  orderPlacedAt?: Maybe<Scalars["DateTime"]["output"]>;
  payments?: Maybe<Array<Payment>>;
  /** Promotions applied to the order. Only gets populated after the payment process has completed. */
  promotions: Array<Promotion>;
  shipping: Scalars["Money"]["output"];
  shippingAddress?: Maybe<OrderAddress>;
  shippingLines: Array<ShippingLine>;
  shippingWithTax: Scalars["Money"]["output"];
  state: Scalars["String"]["output"];
  /**
   * The subTotal is the total of all OrderLines in the Order. This figure also includes any Order-level
   * discounts which have been prorated (proportionally distributed) amongst the items of each OrderLine.
   * To get a total of all OrderLines which does not account for prorated discounts, use the
   * sum of `OrderLine.discountedLinePrice` values.
   */
  subTotal: Scalars["Money"]["output"];
  /** Same as subTotal, but inclusive of tax */
  subTotalWithTax: Scalars["Money"]["output"];
  /**
   * Surcharges are arbitrary modifications to the Order total which are neither
   * ProductVariants nor discounts resulting from applied Promotions. For example,
   * one-off discounts based on customer interaction, or surcharges based on payment
   * methods.
   */
  surcharges: Array<Surcharge>;
  /** A summary of the taxes being applied to this Order */
  taxSummary: Array<OrderTaxSummary>;
  /** Equal to subTotal plus shipping */
  total: Scalars["Money"]["output"];
  totalQuantity: Scalars["Int"]["output"];
  /** The final payable amount. Equal to subTotalWithTax plus shippingWithTax */
  totalWithTax: Scalars["Money"]["output"];
  type: OrderType;
  updatedAt: Scalars["DateTime"]["output"];
};

export type OrderHistoryArgs = {
  options?: InputMaybe<HistoryEntryListOptions>;
};

export type OrderAddress = {
  __typename?: "OrderAddress";
  city?: Maybe<Scalars["String"]["output"]>;
  company?: Maybe<Scalars["String"]["output"]>;
  country?: Maybe<Scalars["String"]["output"]>;
  countryCode?: Maybe<Scalars["String"]["output"]>;
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  phoneNumber?: Maybe<Scalars["String"]["output"]>;
  postalCode?: Maybe<Scalars["String"]["output"]>;
  province?: Maybe<Scalars["String"]["output"]>;
  streetLine1?: Maybe<Scalars["String"]["output"]>;
  streetLine2?: Maybe<Scalars["String"]["output"]>;
};

export type OrderCustomFields = {
  __typename?: "OrderCustomFields";
  adminNotes?: Maybe<Scalars["String"]["output"]>;
  cancellationReason?: Maybe<Scalars["String"]["output"]>;
  customerNotes?: Maybe<Scalars["String"]["output"]>;
  trackingNumber?: Maybe<Scalars["String"]["output"]>;
  wilaya?: Maybe<Scalars["String"]["output"]>;
};

export type OrderFilterParameter = {
  _and?: InputMaybe<Array<OrderFilterParameter>>;
  _or?: InputMaybe<Array<OrderFilterParameter>>;
  active?: InputMaybe<BooleanOperators>;
  adminNotes?: InputMaybe<StringOperators>;
  cancellationReason?: InputMaybe<StringOperators>;
  code?: InputMaybe<StringOperators>;
  createdAt?: InputMaybe<DateOperators>;
  currencyCode?: InputMaybe<StringOperators>;
  customerNotes?: InputMaybe<StringOperators>;
  id?: InputMaybe<IdOperators>;
  orderPlacedAt?: InputMaybe<DateOperators>;
  shipping?: InputMaybe<NumberOperators>;
  shippingWithTax?: InputMaybe<NumberOperators>;
  state?: InputMaybe<StringOperators>;
  subTotal?: InputMaybe<NumberOperators>;
  subTotalWithTax?: InputMaybe<NumberOperators>;
  total?: InputMaybe<NumberOperators>;
  totalQuantity?: InputMaybe<NumberOperators>;
  totalWithTax?: InputMaybe<NumberOperators>;
  trackingNumber?: InputMaybe<StringOperators>;
  type?: InputMaybe<StringOperators>;
  updatedAt?: InputMaybe<DateOperators>;
  wilaya?: InputMaybe<StringOperators>;
};

/** Returned when an order operation is rejected by an OrderInterceptor method. */
export type OrderInterceptorError = ErrorResult & {
  __typename?: "OrderInterceptorError";
  errorCode: ErrorCode;
  interceptorError: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
};

/** Returned when the maximum order size limit has been reached. */
export type OrderLimitError = ErrorResult & {
  __typename?: "OrderLimitError";
  errorCode: ErrorCode;
  maxItems: Scalars["Int"]["output"];
  message: Scalars["String"]["output"];
};

export type OrderLine = Node & {
  __typename?: "OrderLine";
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  /** The price of the line including discounts, excluding tax */
  discountedLinePrice: Scalars["Money"]["output"];
  /** The price of the line including discounts and tax */
  discountedLinePriceWithTax: Scalars["Money"]["output"];
  /**
   * The price of a single unit including discounts, excluding tax.
   *
   * If Order-level discounts have been applied, this will not be the
   * actual taxable unit price (see `proratedUnitPrice`), but is generally the
   * correct price to display to customers to avoid confusion
   * about the internal handling of distributed Order-level discounts.
   */
  discountedUnitPrice: Scalars["Money"]["output"];
  /** The price of a single unit including discounts and tax */
  discountedUnitPriceWithTax: Scalars["Money"]["output"];
  discounts: Array<Discount>;
  featuredAsset?: Maybe<Asset>;
  fulfillmentLines?: Maybe<Array<FulfillmentLine>>;
  id: Scalars["ID"]["output"];
  /** The total price of the line excluding tax and discounts. */
  linePrice: Scalars["Money"]["output"];
  /** The total price of the line including tax but excluding discounts. */
  linePriceWithTax: Scalars["Money"]["output"];
  /** The total tax on this line */
  lineTax: Scalars["Money"]["output"];
  order: Order;
  /** The quantity at the time the Order was placed */
  orderPlacedQuantity: Scalars["Int"]["output"];
  productVariant: ProductVariant;
  /**
   * The actual line price, taking into account both item discounts _and_ prorated (proportionally-distributed)
   * Order-level discounts. This value is the true economic value of the OrderLine, and is used in tax
   * and refund calculations.
   */
  proratedLinePrice: Scalars["Money"]["output"];
  /** The proratedLinePrice including tax */
  proratedLinePriceWithTax: Scalars["Money"]["output"];
  /**
   * The actual unit price, taking into account both item discounts _and_ prorated (proportionally-distributed)
   * Order-level discounts. This value is the true economic value of the OrderItem, and is used in tax
   * and refund calculations.
   */
  proratedUnitPrice: Scalars["Money"]["output"];
  /** The proratedUnitPrice including tax */
  proratedUnitPriceWithTax: Scalars["Money"]["output"];
  /** The quantity of items purchased */
  quantity: Scalars["Int"]["output"];
  taxLines: Array<TaxLine>;
  taxRate: Scalars["Float"]["output"];
  /** The price of a single unit, excluding tax and discounts */
  unitPrice: Scalars["Money"]["output"];
  /** Non-zero if the unitPrice has changed since it was initially added to Order */
  unitPriceChangeSinceAdded: Scalars["Money"]["output"];
  /** The price of a single unit, including tax but excluding discounts */
  unitPriceWithTax: Scalars["Money"]["output"];
  /** Non-zero if the unitPriceWithTax has changed since it was initially added to Order */
  unitPriceWithTaxChangeSinceAdded: Scalars["Money"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type OrderList = PaginatedList & {
  __typename?: "OrderList";
  items: Array<Order>;
  totalItems: Scalars["Int"]["output"];
};

export type OrderListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<OrderFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<LogicalOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<OrderSortParameter>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Returned when attempting to modify the contents of an Order that is not in the `AddingItems` state. */
export type OrderModificationError = ErrorResult & {
  __typename?: "OrderModificationError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/** Returned when attempting to add a Payment to an Order that is not in the `ArrangingPayment` state. */
export type OrderPaymentStateError = ErrorResult & {
  __typename?: "OrderPaymentStateError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

export type OrderSortParameter = {
  adminNotes?: InputMaybe<SortOrder>;
  cancellationReason?: InputMaybe<SortOrder>;
  code?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  customerNotes?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  orderPlacedAt?: InputMaybe<SortOrder>;
  shipping?: InputMaybe<SortOrder>;
  shippingWithTax?: InputMaybe<SortOrder>;
  state?: InputMaybe<SortOrder>;
  subTotal?: InputMaybe<SortOrder>;
  subTotalWithTax?: InputMaybe<SortOrder>;
  total?: InputMaybe<SortOrder>;
  totalQuantity?: InputMaybe<SortOrder>;
  totalWithTax?: InputMaybe<SortOrder>;
  trackingNumber?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
  wilaya?: InputMaybe<SortOrder>;
};

/** Returned if there is an error in transitioning the Order state */
export type OrderStateTransitionError = ErrorResult & {
  __typename?: "OrderStateTransitionError";
  errorCode: ErrorCode;
  fromState: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
  toState: Scalars["String"]["output"];
  transitionError: Scalars["String"]["output"];
};

/**
 * A summary of the taxes being applied to this order, grouped
 * by taxRate.
 */
export type OrderTaxSummary = {
  __typename?: "OrderTaxSummary";
  /** A description of this tax */
  description: Scalars["String"]["output"];
  /** The total net price of OrderLines to which this taxRate applies */
  taxBase: Scalars["Money"]["output"];
  /** The taxRate as a percentage */
  taxRate: Scalars["Float"]["output"];
  /** The total tax being applied to the Order at this taxRate */
  taxTotal: Scalars["Money"]["output"];
};

export enum OrderType {
  Aggregate = "Aggregate",
  Regular = "Regular",
  Seller = "Seller",
}

export type PaginatedList = {
  items: Array<Node>;
  totalItems: Scalars["Int"]["output"];
};

/** Returned when attempting to verify a customer account with a password, when a password has already been set. */
export type PasswordAlreadySetError = ErrorResult & {
  __typename?: "PasswordAlreadySetError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/**
 * Returned if the token used to reset a Customer's password is valid, but has
 * expired according to the `verificationTokenDuration` setting in the AuthOptions.
 */
export type PasswordResetTokenExpiredError = ErrorResult & {
  __typename?: "PasswordResetTokenExpiredError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/**
 * Returned if the token used to reset a Customer's password is either
 * invalid or does not match any expected tokens.
 */
export type PasswordResetTokenInvalidError = ErrorResult & {
  __typename?: "PasswordResetTokenInvalidError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/** Returned when attempting to register or verify a customer account where the given password fails password validation. */
export type PasswordValidationError = ErrorResult & {
  __typename?: "PasswordValidationError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
  validationErrorMessage: Scalars["String"]["output"];
};

export type Payment = Node & {
  __typename?: "Payment";
  amount: Scalars["Money"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  errorMessage?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  method: Scalars["String"]["output"];
  refunds: Array<Refund>;
  state: Scalars["String"]["output"];
  transactionId?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

/** Returned when a Payment is declined by the payment provider. */
export type PaymentDeclinedError = ErrorResult & {
  __typename?: "PaymentDeclinedError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
  paymentErrorMessage: Scalars["String"]["output"];
};

/** Returned when a Payment fails due to an error. */
export type PaymentFailedError = ErrorResult & {
  __typename?: "PaymentFailedError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
  paymentErrorMessage: Scalars["String"]["output"];
};

/** Passed as input to the `addPaymentToOrder` mutation. */
export type PaymentInput = {
  /**
   * This field should contain arbitrary data passed to the specified PaymentMethodHandler's `createPayment()` method
   * as the "metadata" argument. For example, it could contain an ID for the payment and other
   * data generated by the payment provider.
   */
  metadata: Scalars["JSON"]["input"];
  /** This field should correspond to the `code` property of a PaymentMethod. */
  method: Scalars["String"]["input"];
};

export type PaymentMethod = Node & {
  __typename?: "PaymentMethod";
  checker?: Maybe<ConfigurableOperation>;
  code: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  description: Scalars["String"]["output"];
  enabled: Scalars["Boolean"]["output"];
  handler: ConfigurableOperation;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  translations: Array<PaymentMethodTranslation>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type PaymentMethodQuote = {
  __typename?: "PaymentMethodQuote";
  code: Scalars["String"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  description: Scalars["String"]["output"];
  eligibilityMessage?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isEligible: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
};

export type PaymentMethodTranslation = {
  __typename?: "PaymentMethodTranslation";
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

/**
 * @description
 * Permissions for administrators and customers. Used to control access to
 * GraphQL resolvers via the {@link Allow} decorator.
 *
 * ## Understanding Permission.Owner
 *
 * `Permission.Owner` is a special permission which is used in some Vendure resolvers to indicate that that resolver should only
 * be accessible to the "owner" of that resource.
 *
 * For example, the Shop API `activeCustomer` query resolver should only return the Customer object for the "owner" of that Customer, i.e.
 * based on the activeUserId of the current session. As a result, the resolver code looks like this:
 *
 * @example
 * ```TypeScript
 * \@Query()
 * \@Allow(Permission.Owner)
 * async activeCustomer(\@Ctx() ctx: RequestContext): Promise<Customer | undefined> {
 *   const userId = ctx.activeUserId;
 *   if (userId) {
 *     return this.customerService.findOneByUserId(ctx, userId);
 *   }
 * }
 * ```
 *
 * Here we can see that the "ownership" must be enforced by custom logic inside the resolver. Since "ownership" cannot be defined generally
 * nor statically encoded at build-time, any resolvers using `Permission.Owner` **must** include logic to enforce that only the owner
 * of the resource has access. If not, then it is the equivalent of using `Permission.Public`.
 *
 *
 * @docsCategory common
 */
export enum Permission {
  /** Authenticated means simply that the user is logged in */
  Authenticated = "Authenticated",
  /** Grants permission to create Administrator */
  CreateAdministrator = "CreateAdministrator",
  /** Grants permission to create Asset */
  CreateAsset = "CreateAsset",
  /** Grants permission to create Products, Facets, Assets, Collections */
  CreateCatalog = "CreateCatalog",
  /** Grants permission to create Channel */
  CreateChannel = "CreateChannel",
  /** Grants permission to create Collection */
  CreateCollection = "CreateCollection",
  /** Grants permission to create Country */
  CreateCountry = "CreateCountry",
  /** Grants permission to create Customer */
  CreateCustomer = "CreateCustomer",
  /** Grants permission to create CustomerGroup */
  CreateCustomerGroup = "CreateCustomerGroup",
  /** Grants permission to create Facet */
  CreateFacet = "CreateFacet",
  /** Grants permission to create Order */
  CreateOrder = "CreateOrder",
  /** Grants permission to create PaymentMethod */
  CreatePaymentMethod = "CreatePaymentMethod",
  /** Grants permission to create Product */
  CreateProduct = "CreateProduct",
  /** Grants permission to create Promotion */
  CreatePromotion = "CreatePromotion",
  /** Grants permission to create Seller */
  CreateSeller = "CreateSeller",
  /** Grants permission to create PaymentMethods, ShippingMethods, TaxCategories, TaxRates, Zones, Countries, System & GlobalSettings */
  CreateSettings = "CreateSettings",
  /** Grants permission to create ShippingMethod */
  CreateShippingMethod = "CreateShippingMethod",
  /** Grants permission to create StockLocation */
  CreateStockLocation = "CreateStockLocation",
  /** Grants permission to create System */
  CreateSystem = "CreateSystem",
  /** Grants permission to create Tag */
  CreateTag = "CreateTag",
  /** Grants permission to create TaxCategory */
  CreateTaxCategory = "CreateTaxCategory",
  /** Grants permission to create TaxRate */
  CreateTaxRate = "CreateTaxRate",
  /** Grants permission to create Zone */
  CreateZone = "CreateZone",
  /** Grants permission to delete Administrator */
  DeleteAdministrator = "DeleteAdministrator",
  /** Grants permission to delete Asset */
  DeleteAsset = "DeleteAsset",
  /** Grants permission to delete Products, Facets, Assets, Collections */
  DeleteCatalog = "DeleteCatalog",
  /** Grants permission to delete Channel */
  DeleteChannel = "DeleteChannel",
  /** Grants permission to delete Collection */
  DeleteCollection = "DeleteCollection",
  /** Grants permission to delete Country */
  DeleteCountry = "DeleteCountry",
  /** Grants permission to delete Customer */
  DeleteCustomer = "DeleteCustomer",
  /** Grants permission to delete CustomerGroup */
  DeleteCustomerGroup = "DeleteCustomerGroup",
  /** Grants permission to delete Facet */
  DeleteFacet = "DeleteFacet",
  /** Grants permission to delete Order */
  DeleteOrder = "DeleteOrder",
  /** Grants permission to delete PaymentMethod */
  DeletePaymentMethod = "DeletePaymentMethod",
  /** Grants permission to delete Product */
  DeleteProduct = "DeleteProduct",
  /** Grants permission to delete Promotion */
  DeletePromotion = "DeletePromotion",
  /** Grants permission to delete Seller */
  DeleteSeller = "DeleteSeller",
  /** Grants permission to delete PaymentMethods, ShippingMethods, TaxCategories, TaxRates, Zones, Countries, System & GlobalSettings */
  DeleteSettings = "DeleteSettings",
  /** Grants permission to delete ShippingMethod */
  DeleteShippingMethod = "DeleteShippingMethod",
  /** Grants permission to delete StockLocation */
  DeleteStockLocation = "DeleteStockLocation",
  /** Grants permission to delete System */
  DeleteSystem = "DeleteSystem",
  /** Grants permission to delete Tag */
  DeleteTag = "DeleteTag",
  /** Grants permission to delete TaxCategory */
  DeleteTaxCategory = "DeleteTaxCategory",
  /** Grants permission to delete TaxRate */
  DeleteTaxRate = "DeleteTaxRate",
  /** Grants permission to delete Zone */
  DeleteZone = "DeleteZone",
  /** Owner means the user owns this entity, e.g. a Customer's own Order */
  Owner = "Owner",
  /** Public means any unauthenticated user may perform the operation */
  Public = "Public",
  /** Grants permission to read Administrator */
  ReadAdministrator = "ReadAdministrator",
  /** Grants permission to read Asset */
  ReadAsset = "ReadAsset",
  /** Grants permission to read Products, Facets, Assets, Collections */
  ReadCatalog = "ReadCatalog",
  /** Grants permission to read Channel */
  ReadChannel = "ReadChannel",
  /** Grants permission to read Collection */
  ReadCollection = "ReadCollection",
  /** Grants permission to read Country */
  ReadCountry = "ReadCountry",
  /** Grants permission to read Customer */
  ReadCustomer = "ReadCustomer",
  /** Grants permission to read CustomerGroup */
  ReadCustomerGroup = "ReadCustomerGroup",
  /** Grants permission to read Facet */
  ReadFacet = "ReadFacet",
  /** Grants permission to read Order */
  ReadOrder = "ReadOrder",
  /** Grants permission to read PaymentMethod */
  ReadPaymentMethod = "ReadPaymentMethod",
  /** Grants permission to read Product */
  ReadProduct = "ReadProduct",
  /** Grants permission to read Promotion */
  ReadPromotion = "ReadPromotion",
  /** Grants permission to read Seller */
  ReadSeller = "ReadSeller",
  /** Grants permission to read PaymentMethods, ShippingMethods, TaxCategories, TaxRates, Zones, Countries, System & GlobalSettings */
  ReadSettings = "ReadSettings",
  /** Grants permission to read ShippingMethod */
  ReadShippingMethod = "ReadShippingMethod",
  /** Grants permission to read StockLocation */
  ReadStockLocation = "ReadStockLocation",
  /** Grants permission to read System */
  ReadSystem = "ReadSystem",
  /** Grants permission to read Tag */
  ReadTag = "ReadTag",
  /** Grants permission to read TaxCategory */
  ReadTaxCategory = "ReadTaxCategory",
  /** Grants permission to read TaxRate */
  ReadTaxRate = "ReadTaxRate",
  /** Grants permission to read Zone */
  ReadZone = "ReadZone",
  /** SuperAdmin has unrestricted access to all operations */
  SuperAdmin = "SuperAdmin",
  /** Grants permission to update Administrator */
  UpdateAdministrator = "UpdateAdministrator",
  /** Grants permission to update Asset */
  UpdateAsset = "UpdateAsset",
  /** Grants permission to update Products, Facets, Assets, Collections */
  UpdateCatalog = "UpdateCatalog",
  /** Grants permission to update Channel */
  UpdateChannel = "UpdateChannel",
  /** Grants permission to update Collection */
  UpdateCollection = "UpdateCollection",
  /** Grants permission to update Country */
  UpdateCountry = "UpdateCountry",
  /** Grants permission to update Customer */
  UpdateCustomer = "UpdateCustomer",
  /** Grants permission to update CustomerGroup */
  UpdateCustomerGroup = "UpdateCustomerGroup",
  /** Grants permission to update Facet */
  UpdateFacet = "UpdateFacet",
  /** Grants permission to update GlobalSettings */
  UpdateGlobalSettings = "UpdateGlobalSettings",
  /** Grants permission to update Order */
  UpdateOrder = "UpdateOrder",
  /** Grants permission to update PaymentMethod */
  UpdatePaymentMethod = "UpdatePaymentMethod",
  /** Grants permission to update Product */
  UpdateProduct = "UpdateProduct",
  /** Grants permission to update Promotion */
  UpdatePromotion = "UpdatePromotion",
  /** Grants permission to update Seller */
  UpdateSeller = "UpdateSeller",
  /** Grants permission to update PaymentMethods, ShippingMethods, TaxCategories, TaxRates, Zones, Countries, System & GlobalSettings */
  UpdateSettings = "UpdateSettings",
  /** Grants permission to update ShippingMethod */
  UpdateShippingMethod = "UpdateShippingMethod",
  /** Grants permission to update StockLocation */
  UpdateStockLocation = "UpdateStockLocation",
  /** Grants permission to update System */
  UpdateSystem = "UpdateSystem",
  /** Grants permission to update Tag */
  UpdateTag = "UpdateTag",
  /** Grants permission to update TaxCategory */
  UpdateTaxCategory = "UpdateTaxCategory",
  /** Grants permission to update TaxRate */
  UpdateTaxRate = "UpdateTaxRate",
  /** Grants permission to update Zone */
  UpdateZone = "UpdateZone",
}

/** The price range where the result has more than one price */
export type PriceRange = {
  __typename?: "PriceRange";
  max: Scalars["Money"]["output"];
  min: Scalars["Money"]["output"];
};

export type Product = Node & {
  __typename?: "Product";
  assets: Array<Asset>;
  collections: Array<Collection>;
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  description: Scalars["String"]["output"];
  enabled: Scalars["Boolean"]["output"];
  facetValues: Array<FacetValue>;
  featuredAsset?: Maybe<Asset>;
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  optionGroups: Array<ProductOptionGroup>;
  slug: Scalars["String"]["output"];
  translations: Array<ProductTranslation>;
  updatedAt: Scalars["DateTime"]["output"];
  /** Returns a paginated, sortable, filterable list of ProductVariants */
  variantList: ProductVariantList;
  /** Returns all ProductVariants */
  variants: Array<ProductVariant>;
};

export type ProductVariantListArgs = {
  options?: InputMaybe<ProductVariantListOptions>;
};

export type ProductFilterParameter = {
  _and?: InputMaybe<Array<ProductFilterParameter>>;
  _or?: InputMaybe<Array<ProductFilterParameter>>;
  createdAt?: InputMaybe<DateOperators>;
  description?: InputMaybe<StringOperators>;
  enabled?: InputMaybe<BooleanOperators>;
  id?: InputMaybe<IdOperators>;
  languageCode?: InputMaybe<StringOperators>;
  name?: InputMaybe<StringOperators>;
  slug?: InputMaybe<StringOperators>;
  updatedAt?: InputMaybe<DateOperators>;
};

export type ProductList = PaginatedList & {
  __typename?: "ProductList";
  items: Array<Product>;
  totalItems: Scalars["Int"]["output"];
};

export type ProductListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<ProductFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<LogicalOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<ProductSortParameter>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ProductOption = Node & {
  __typename?: "ProductOption";
  code: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  group: ProductOptionGroup;
  groupId: Scalars["ID"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  translations: Array<ProductOptionTranslation>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type ProductOptionGroup = Node & {
  __typename?: "ProductOptionGroup";
  code: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  options: Array<ProductOption>;
  translations: Array<ProductOptionGroupTranslation>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type ProductOptionGroupTranslation = {
  __typename?: "ProductOptionGroupTranslation";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type ProductOptionTranslation = {
  __typename?: "ProductOptionTranslation";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type ProductSortParameter = {
  createdAt?: InputMaybe<SortOrder>;
  description?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  slug?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type ProductTranslation = {
  __typename?: "ProductTranslation";
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  slug: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type ProductVariant = Node & {
  __typename?: "ProductVariant";
  assets: Array<Asset>;
  createdAt: Scalars["DateTime"]["output"];
  currencyCode: CurrencyCode;
  customFields?: Maybe<ProductVariantCustomFields>;
  facetValues: Array<FacetValue>;
  featuredAsset?: Maybe<Asset>;
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  options: Array<ProductOption>;
  price: Scalars["Money"]["output"];
  priceWithTax: Scalars["Money"]["output"];
  product: Product;
  productId: Scalars["ID"]["output"];
  sku: Scalars["String"]["output"];
  stockLevel: Scalars["String"]["output"];
  taxCategory: TaxCategory;
  taxRateApplied: TaxRate;
  translations: Array<ProductVariantTranslation>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type ProductVariantCustomFields = {
  __typename?: "ProductVariantCustomFields";
  minStockAlert?: Maybe<Scalars["Int"]["output"]>;
};

export type ProductVariantFilterParameter = {
  _and?: InputMaybe<Array<ProductVariantFilterParameter>>;
  _or?: InputMaybe<Array<ProductVariantFilterParameter>>;
  createdAt?: InputMaybe<DateOperators>;
  currencyCode?: InputMaybe<StringOperators>;
  id?: InputMaybe<IdOperators>;
  languageCode?: InputMaybe<StringOperators>;
  minStockAlert?: InputMaybe<NumberOperators>;
  name?: InputMaybe<StringOperators>;
  price?: InputMaybe<NumberOperators>;
  priceWithTax?: InputMaybe<NumberOperators>;
  productId?: InputMaybe<IdOperators>;
  sku?: InputMaybe<StringOperators>;
  stockLevel?: InputMaybe<StringOperators>;
  updatedAt?: InputMaybe<DateOperators>;
};

export type ProductVariantList = PaginatedList & {
  __typename?: "ProductVariantList";
  items: Array<ProductVariant>;
  totalItems: Scalars["Int"]["output"];
};

export type ProductVariantListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<ProductVariantFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<LogicalOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<ProductVariantSortParameter>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ProductVariantSortParameter = {
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  minStockAlert?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  price?: InputMaybe<SortOrder>;
  priceWithTax?: InputMaybe<SortOrder>;
  productId?: InputMaybe<SortOrder>;
  sku?: InputMaybe<SortOrder>;
  stockLevel?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type ProductVariantTranslation = {
  __typename?: "ProductVariantTranslation";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type Promotion = Node & {
  __typename?: "Promotion";
  actions: Array<ConfigurableOperation>;
  conditions: Array<ConfigurableOperation>;
  couponCode?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  description: Scalars["String"]["output"];
  enabled: Scalars["Boolean"]["output"];
  endsAt?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  perCustomerUsageLimit?: Maybe<Scalars["Int"]["output"]>;
  startsAt?: Maybe<Scalars["DateTime"]["output"]>;
  translations: Array<PromotionTranslation>;
  updatedAt: Scalars["DateTime"]["output"];
  usageLimit?: Maybe<Scalars["Int"]["output"]>;
};

export type PromotionList = PaginatedList & {
  __typename?: "PromotionList";
  items: Array<Promotion>;
  totalItems: Scalars["Int"]["output"];
};

export type PromotionTranslation = {
  __typename?: "PromotionTranslation";
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type Province = Node &
  Region & {
    __typename?: "Province";
    code: Scalars["String"]["output"];
    createdAt: Scalars["DateTime"]["output"];
    customFields?: Maybe<Scalars["JSON"]["output"]>;
    enabled: Scalars["Boolean"]["output"];
    id: Scalars["ID"]["output"];
    languageCode: LanguageCode;
    name: Scalars["String"]["output"];
    parent?: Maybe<Region>;
    parentId?: Maybe<Scalars["ID"]["output"]>;
    translations: Array<RegionTranslation>;
    type: Scalars["String"]["output"];
    updatedAt: Scalars["DateTime"]["output"];
  };

export type ProvinceList = PaginatedList & {
  __typename?: "ProvinceList";
  items: Array<Province>;
  totalItems: Scalars["Int"]["output"];
};

export type PublicPaymentMethod = {
  __typename?: "PublicPaymentMethod";
  code: Scalars["String"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  translations: Array<PaymentMethodTranslation>;
};

export type PublicShippingMethod = {
  __typename?: "PublicShippingMethod";
  code: Scalars["String"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  translations: Array<ShippingMethodTranslation>;
};

export type Query = {
  __typename?: "Query";
  /** The active Channel */
  activeChannel: Channel;
  /** The active Customer */
  activeCustomer?: Maybe<Customer>;
  /**
   * The active Order. Will be `null` until an Order is created via `addItemToOrder`. Once an Order reaches the
   * state of `PaymentAuthorized` or `PaymentSettled`, then that Order is no longer considered "active" and this
   * query will once again return `null`.
   */
  activeOrder?: Maybe<Order>;
  /** Get active payment methods */
  activePaymentMethods: Array<Maybe<PublicPaymentMethod>>;
  /** Get active shipping methods */
  activeShippingMethods: Array<Maybe<PublicShippingMethod>>;
  /** An array of supported Countries */
  availableCountries: Array<Country>;
  /** Returns a Collection either by its id or slug. If neither 'id' nor 'slug' is specified, an error will result. */
  collection?: Maybe<Collection>;
  /** A list of Collections available to the shop */
  collections: CollectionList;
  /** Returns a list of payment methods and their eligibility based on the current active Order */
  eligiblePaymentMethods: Array<PaymentMethodQuote>;
  /** Returns a list of eligible shipping methods based on the current active Order */
  eligibleShippingMethods: Array<ShippingMethodQuote>;
  /** Returns a Facet by its id */
  facet?: Maybe<Facet>;
  /** A list of Facets available to the shop */
  facets: FacetList;
  /** Get featured products for homepage */
  featuredProducts: Array<Product>;
  /** Returns information about the current authenticated User */
  me?: Maybe<CurrentUser>;
  /** Get new arrivals (last 30 days) */
  newArrivals: Array<Product>;
  /** Returns the possible next states that the activeOrder can transition to */
  nextOrderStates: Array<Scalars["String"]["output"]>;
  /**
   * Returns an Order based on the id. Note that in the Shop API, only orders belonging to the
   * currently-authenticated User may be queried.
   */
  order?: Maybe<Order>;
  /**
   * Returns an Order based on the order `code`. For guest Orders (i.e. Orders placed by non-authenticated Customers)
   * this query will only return the Order within 2 hours of the Order being placed. This allows an Order confirmation
   * screen to be shown immediately after completion of a guest checkout, yet prevents security risks of allowing
   * general anonymous access to Order data.
   */
  orderByCode?: Maybe<Order>;
  /** Get popular products by view count */
  popularProducts: Array<Product>;
  /** Get a Product either by id or slug. If neither 'id' nor 'slug' is specified, an error will result. */
  product?: Maybe<Product>;
  /** Get a list of Products */
  products: ProductList;
  /** Search Products based on the criteria set by the `SearchInput` */
  search: SearchResponse;
  /** Search products with multilingual support (FR/AR/EN) */
  searchProductsMultilingual: MultilingualSearchResult;
  /** Calculate shipping cost for a wilaya */
  shippingCost: ShippingCost;
  /** Get all Algeria wilayas for shipping */
  wilayas: Array<Wilaya>;
};

export type QueryCollectionArgs = {
  id?: InputMaybe<Scalars["ID"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryCollectionsArgs = {
  options?: InputMaybe<CollectionListOptions>;
};

export type QueryFacetArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryFacetsArgs = {
  options?: InputMaybe<FacetListOptions>;
};

export type QueryFeaturedProductsArgs = {
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryNewArrivalsArgs = {
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryOrderArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryOrderByCodeArgs = {
  code: Scalars["String"]["input"];
};

export type QueryPopularProductsArgs = {
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryProductArgs = {
  id?: InputMaybe<Scalars["ID"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryProductsArgs = {
  options?: InputMaybe<ProductListOptions>;
};

export type QuerySearchArgs = {
  input: SearchInput;
};

export type QuerySearchProductsMultilingualArgs = {
  keyword: Scalars["String"]["input"];
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryShippingCostArgs = {
  wilayaCode: Scalars["String"]["input"];
};

export type RefreshCustomerVerificationResult =
  | NativeAuthStrategyError
  | Success;

export type Refund = Node & {
  __typename?: "Refund";
  adjustment: Scalars["Money"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  id: Scalars["ID"]["output"];
  items: Scalars["Money"]["output"];
  lines: Array<RefundLine>;
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  method?: Maybe<Scalars["String"]["output"]>;
  paymentId: Scalars["ID"]["output"];
  reason?: Maybe<Scalars["String"]["output"]>;
  shipping: Scalars["Money"]["output"];
  state: Scalars["String"]["output"];
  total: Scalars["Money"]["output"];
  transactionId?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type RefundLine = {
  __typename?: "RefundLine";
  orderLine: OrderLine;
  orderLineId: Scalars["ID"]["output"];
  quantity: Scalars["Int"]["output"];
  refund: Refund;
  refundId: Scalars["ID"]["output"];
};

export type Region = {
  code: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  enabled: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  parent?: Maybe<Region>;
  parentId?: Maybe<Scalars["ID"]["output"]>;
  translations: Array<RegionTranslation>;
  type: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type RegionTranslation = {
  __typename?: "RegionTranslation";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type RegisterCustomerAccountResult =
  | MissingPasswordError
  | NativeAuthStrategyError
  | PasswordValidationError
  | Success;

export type RegisterCustomerCustomFieldsInput = {
  adminNotes?: InputMaybe<Scalars["String"]["input"]>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  wilaya?: InputMaybe<Scalars["String"]["input"]>;
};

export type RegisterCustomerInput = {
  customFields?: InputMaybe<RegisterCustomerCustomFieldsInput>;
  emailAddress: Scalars["String"]["input"];
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  password?: InputMaybe<Scalars["String"]["input"]>;
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type RelationCustomFieldConfig = CustomField & {
  __typename?: "RelationCustomFieldConfig";
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  entity: Scalars["String"]["output"];
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  scalarFields: Array<Scalars["String"]["output"]>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type RemoveOrderItemsResult =
  | Order
  | OrderInterceptorError
  | OrderModificationError;

export type RequestPasswordResetResult = NativeAuthStrategyError | Success;

export type RequestUpdateCustomerEmailAddressResult =
  | EmailAddressConflictError
  | InvalidCredentialsError
  | NativeAuthStrategyError
  | Success;

export type ResetPasswordResult =
  | CurrentUser
  | NativeAuthStrategyError
  | NotVerifiedError
  | PasswordResetTokenExpiredError
  | PasswordResetTokenInvalidError
  | PasswordValidationError;

export type Role = Node & {
  __typename?: "Role";
  channels: Array<Channel>;
  code: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  permissions: Array<Permission>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type RoleList = PaginatedList & {
  __typename?: "RoleList";
  items: Array<Role>;
  totalItems: Scalars["Int"]["output"];
};

export type SearchInput = {
  collectionId?: InputMaybe<Scalars["ID"]["input"]>;
  collectionSlug?: InputMaybe<Scalars["String"]["input"]>;
  facetValueFilters?: InputMaybe<Array<FacetValueFilterInput>>;
  groupByProduct?: InputMaybe<Scalars["Boolean"]["input"]>;
  inStock?: InputMaybe<Scalars["Boolean"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  sort?: InputMaybe<SearchResultSortParameter>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
  term?: InputMaybe<Scalars["String"]["input"]>;
};

export type SearchReindexResponse = {
  __typename?: "SearchReindexResponse";
  success: Scalars["Boolean"]["output"];
};

export type SearchResponse = {
  __typename?: "SearchResponse";
  collections: Array<CollectionResult>;
  facetValues: Array<FacetValueResult>;
  items: Array<SearchResult>;
  totalItems: Scalars["Int"]["output"];
};

export type SearchResult = {
  __typename?: "SearchResult";
  /** An array of ids of the Collections in which this result appears */
  collectionIds: Array<Scalars["ID"]["output"]>;
  currencyCode: CurrencyCode;
  description: Scalars["String"]["output"];
  facetIds: Array<Scalars["ID"]["output"]>;
  facetValueIds: Array<Scalars["ID"]["output"]>;
  inStock: Scalars["Boolean"]["output"];
  price: SearchResultPrice;
  priceWithTax: SearchResultPrice;
  productAsset?: Maybe<SearchResultAsset>;
  productId: Scalars["ID"]["output"];
  productName: Scalars["String"]["output"];
  productVariantAsset?: Maybe<SearchResultAsset>;
  productVariantId: Scalars["ID"]["output"];
  productVariantName: Scalars["String"]["output"];
  /** A relevance score for the result. Differs between database implementations */
  score: Scalars["Float"]["output"];
  sku: Scalars["String"]["output"];
  slug: Scalars["String"]["output"];
};

export type SearchResultAsset = {
  __typename?: "SearchResultAsset";
  focalPoint?: Maybe<Coordinate>;
  id: Scalars["ID"]["output"];
  preview: Scalars["String"]["output"];
};

/** The price of a search result product, either as a range or as a single price */
export type SearchResultPrice = PriceRange | SinglePrice;

export type SearchResultSortParameter = {
  name?: InputMaybe<SortOrder>;
  price?: InputMaybe<SortOrder>;
};

export type Seller = Node & {
  __typename?: "Seller";
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type SetCustomerForOrderResult =
  | AlreadyLoggedInError
  | EmailAddressConflictError
  | GuestCheckoutError
  | NoActiveOrderError
  | Order;

export type SetOrderShippingMethodResult =
  | IneligibleShippingMethodError
  | NoActiveOrderError
  | Order
  | OrderModificationError;

export type ShippingCost = {
  __typename?: "ShippingCost";
  amount: Scalars["Int"]["output"];
  currency: Scalars["String"]["output"];
};

export type ShippingLine = {
  __typename?: "ShippingLine";
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  discountedPrice: Scalars["Money"]["output"];
  discountedPriceWithTax: Scalars["Money"]["output"];
  discounts: Array<Discount>;
  id: Scalars["ID"]["output"];
  price: Scalars["Money"]["output"];
  priceWithTax: Scalars["Money"]["output"];
  shippingMethod: ShippingMethod;
};

export type ShippingMethod = Node & {
  __typename?: "ShippingMethod";
  calculator: ConfigurableOperation;
  checker: ConfigurableOperation;
  code: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  description: Scalars["String"]["output"];
  fulfillmentHandlerCode: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  translations: Array<ShippingMethodTranslation>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type ShippingMethodList = PaginatedList & {
  __typename?: "ShippingMethodList";
  items: Array<ShippingMethod>;
  totalItems: Scalars["Int"]["output"];
};

export type ShippingMethodQuote = {
  __typename?: "ShippingMethodQuote";
  code: Scalars["String"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  /** Any optional metadata returned by the ShippingCalculator in the ShippingCalculationResult */
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  name: Scalars["String"]["output"];
  price: Scalars["Money"]["output"];
  priceWithTax: Scalars["Money"]["output"];
};

export type ShippingMethodTranslation = {
  __typename?: "ShippingMethodTranslation";
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  languageCode: LanguageCode;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

/** The price value where the result has a single price */
export type SinglePrice = {
  __typename?: "SinglePrice";
  value: Scalars["Money"]["output"];
};

export enum SortOrder {
  Asc = "ASC",
  Desc = "DESC",
}

export type StringCustomFieldConfig = CustomField & {
  __typename?: "StringCustomFieldConfig";
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  length?: Maybe<Scalars["Int"]["output"]>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  options?: Maybe<Array<StringFieldOption>>;
  pattern?: Maybe<Scalars["String"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type StringFieldOption = {
  __typename?: "StringFieldOption";
  label?: Maybe<Array<LocalizedString>>;
  value: Scalars["String"]["output"];
};

/** Operators for filtering on a list of String fields */
export type StringListOperators = {
  inList: Scalars["String"]["input"];
};

/** Operators for filtering on a String field */
export type StringOperators = {
  contains?: InputMaybe<Scalars["String"]["input"]>;
  eq?: InputMaybe<Scalars["String"]["input"]>;
  in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  isNull?: InputMaybe<Scalars["Boolean"]["input"]>;
  notContains?: InputMaybe<Scalars["String"]["input"]>;
  notEq?: InputMaybe<Scalars["String"]["input"]>;
  notIn?: InputMaybe<Array<Scalars["String"]["input"]>>;
  regex?: InputMaybe<Scalars["String"]["input"]>;
};

export type StringStructFieldConfig = StructField & {
  __typename?: "StringStructFieldConfig";
  description?: Maybe<Array<LocalizedString>>;
  label?: Maybe<Array<LocalizedString>>;
  length?: Maybe<Scalars["Int"]["output"]>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  options?: Maybe<Array<StringFieldOption>>;
  pattern?: Maybe<Scalars["String"]["output"]>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type StructCustomFieldConfig = CustomField & {
  __typename?: "StructCustomFieldConfig";
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  fields: Array<StructFieldConfig>;
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type StructField = {
  description?: Maybe<Array<LocalizedString>>;
  label?: Maybe<Array<LocalizedString>>;
  list?: Maybe<Scalars["Boolean"]["output"]>;
  name: Scalars["String"]["output"];
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type StructFieldConfig =
  | BooleanStructFieldConfig
  | DateTimeStructFieldConfig
  | FloatStructFieldConfig
  | IntStructFieldConfig
  | StringStructFieldConfig
  | TextStructFieldConfig;

/** Indicates that an operation succeeded, where we do not want to return any more specific information. */
export type Success = {
  __typename?: "Success";
  success: Scalars["Boolean"]["output"];
};

export type Surcharge = Node & {
  __typename?: "Surcharge";
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  price: Scalars["Money"]["output"];
  priceWithTax: Scalars["Money"]["output"];
  sku?: Maybe<Scalars["String"]["output"]>;
  taxLines: Array<TaxLine>;
  taxRate: Scalars["Float"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type Tag = Node & {
  __typename?: "Tag";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  value: Scalars["String"]["output"];
};

export type TagList = PaginatedList & {
  __typename?: "TagList";
  items: Array<Tag>;
  totalItems: Scalars["Int"]["output"];
};

export type TaxCategory = Node & {
  __typename?: "TaxCategory";
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  id: Scalars["ID"]["output"];
  isDefault: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type TaxLine = {
  __typename?: "TaxLine";
  description: Scalars["String"]["output"];
  taxRate: Scalars["Float"]["output"];
};

export type TaxRate = Node & {
  __typename?: "TaxRate";
  category: TaxCategory;
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  customerGroup?: Maybe<CustomerGroup>;
  enabled: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  value: Scalars["Float"]["output"];
  zone: Zone;
};

export type TaxRateList = PaginatedList & {
  __typename?: "TaxRateList";
  items: Array<TaxRate>;
  totalItems: Scalars["Int"]["output"];
};

export type TextCustomFieldConfig = CustomField & {
  __typename?: "TextCustomFieldConfig";
  deprecated?: Maybe<Scalars["Boolean"]["output"]>;
  deprecationReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Array<LocalizedString>>;
  internal?: Maybe<Scalars["Boolean"]["output"]>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  nullable?: Maybe<Scalars["Boolean"]["output"]>;
  readonly?: Maybe<Scalars["Boolean"]["output"]>;
  requiresPermission?: Maybe<Array<Permission>>;
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type TextStructFieldConfig = StructField & {
  __typename?: "TextStructFieldConfig";
  description?: Maybe<Array<LocalizedString>>;
  label?: Maybe<Array<LocalizedString>>;
  list: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  type: Scalars["String"]["output"];
  ui?: Maybe<Scalars["JSON"]["output"]>;
};

export type TransitionOrderToStateResult = Order | OrderStateTransitionError;

/**
 * Input used to update an Address.
 *
 * The countryCode must correspond to a `code` property of a Country that has been defined in the
 * Vendure server. The `code` property is typically a 2-character ISO code such as "GB", "US", "DE" etc.
 * If an invalid code is passed, the mutation will fail.
 */
export type UpdateAddressInput = {
  city?: InputMaybe<Scalars["String"]["input"]>;
  company?: InputMaybe<Scalars["String"]["input"]>;
  countryCode?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Scalars["JSON"]["input"]>;
  defaultBillingAddress?: InputMaybe<Scalars["Boolean"]["input"]>;
  defaultShippingAddress?: InputMaybe<Scalars["Boolean"]["input"]>;
  fullName?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
  postalCode?: InputMaybe<Scalars["String"]["input"]>;
  province?: InputMaybe<Scalars["String"]["input"]>;
  streetLine1?: InputMaybe<Scalars["String"]["input"]>;
  streetLine2?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateCustomerCustomFieldsInput = {
  adminNotes?: InputMaybe<Scalars["String"]["input"]>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  wilaya?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateCustomerEmailAddressResult =
  | IdentifierChangeTokenExpiredError
  | IdentifierChangeTokenInvalidError
  | NativeAuthStrategyError
  | Success;

export type UpdateCustomerInput = {
  customFields?: InputMaybe<UpdateCustomerCustomFieldsInput>;
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateCustomerPasswordResult =
  | InvalidCredentialsError
  | NativeAuthStrategyError
  | PasswordValidationError
  | Success;

/**
 * Returned when multiple items are added to an Order.
 * The errorResults array contains the errors that occurred for each item, if any.
 */
export type UpdateMultipleOrderItemsResult = {
  __typename?: "UpdateMultipleOrderItemsResult";
  errorResults: Array<UpdateOrderItemErrorResult>;
  order: Order;
};

export type UpdateOrderCustomFieldsInput = {
  adminNotes?: InputMaybe<Scalars["String"]["input"]>;
  cancellationReason?: InputMaybe<Scalars["String"]["input"]>;
  customerNotes?: InputMaybe<Scalars["String"]["input"]>;
  trackingNumber?: InputMaybe<Scalars["String"]["input"]>;
  wilaya?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateOrderInput = {
  customFields?: InputMaybe<UpdateOrderCustomFieldsInput>;
};

/** Union type of all possible errors that can occur when adding or removing items from an Order. */
export type UpdateOrderItemErrorResult =
  | InsufficientStockError
  | NegativeQuantityError
  | OrderInterceptorError
  | OrderLimitError
  | OrderModificationError;

export type UpdateOrderItemsResult =
  | InsufficientStockError
  | NegativeQuantityError
  | Order
  | OrderInterceptorError
  | OrderLimitError
  | OrderModificationError;

export type User = Node & {
  __typename?: "User";
  authenticationMethods: Array<AuthenticationMethod>;
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  id: Scalars["ID"]["output"];
  identifier: Scalars["String"]["output"];
  lastLogin?: Maybe<Scalars["DateTime"]["output"]>;
  roles: Array<Role>;
  updatedAt: Scalars["DateTime"]["output"];
  verified: Scalars["Boolean"]["output"];
};

/**
 * Returned if the verification token (used to verify a Customer's email address) is valid, but has
 * expired according to the `verificationTokenDuration` setting in the AuthOptions.
 */
export type VerificationTokenExpiredError = ErrorResult & {
  __typename?: "VerificationTokenExpiredError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

/**
 * Returned if the verification token (used to verify a Customer's email address) is either
 * invalid or does not match any expected tokens.
 */
export type VerificationTokenInvalidError = ErrorResult & {
  __typename?: "VerificationTokenInvalidError";
  errorCode: ErrorCode;
  message: Scalars["String"]["output"];
};

export type VerifyCustomerAccountResult =
  | CurrentUser
  | MissingPasswordError
  | NativeAuthStrategyError
  | PasswordAlreadySetError
  | PasswordValidationError
  | VerificationTokenExpiredError
  | VerificationTokenInvalidError;

export type Wilaya = {
  __typename?: "Wilaya";
  code: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type Zone = Node & {
  __typename?: "Zone";
  createdAt: Scalars["DateTime"]["output"];
  customFields?: Maybe<Scalars["JSON"]["output"]>;
  id: Scalars["ID"]["output"];
  members: Array<Region>;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type CurrentUserFieldsFragment = {
  __typename?: "CurrentUser";
  id: string;
  identifier: string;
  channels: Array<{
    __typename?: "CurrentUserChannel";
    id: string;
    code: string;
    token: string;
    permissions: Array<Permission>;
  }>;
};

export type CustomerFieldsFragment = {
  __typename?: "Customer";
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string | null;
  addresses?: Array<{
    __typename?: "Address";
    id: string;
    fullName?: string | null;
    company?: string | null;
    streetLine1: string;
    streetLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    phoneNumber?: string | null;
    defaultShippingAddress?: boolean | null;
    defaultBillingAddress?: boolean | null;
    country: { __typename?: "Country"; code: string; name: string };
  }> | null;
  customFields?: {
    __typename?: "CustomerCustomFields";
    wilaya?: string | null;
    city?: string | null;
  } | null;
};

export type ActiveCustomerQueryVariables = Exact<{ [key: string]: never }>;

export type ActiveCustomerQuery = {
  __typename?: "Query";
  activeCustomer?: {
    __typename?: "Customer";
    id: string;
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber?: string | null;
    addresses?: Array<{
      __typename?: "Address";
      id: string;
      fullName?: string | null;
      company?: string | null;
      streetLine1: string;
      streetLine2?: string | null;
      city?: string | null;
      province?: string | null;
      postalCode?: string | null;
      phoneNumber?: string | null;
      defaultShippingAddress?: boolean | null;
      defaultBillingAddress?: boolean | null;
      country: { __typename?: "Country"; code: string; name: string };
    }> | null;
    customFields?: {
      __typename?: "CustomerCustomFields";
      wilaya?: string | null;
      city?: string | null;
    } | null;
  } | null;
};

export type ShopLoginMutationVariables = Exact<{
  username: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  rememberMe?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type ShopLoginMutation = {
  __typename?: "Mutation";
  login:
    | {
        __typename?: "CurrentUser";
        id: string;
        identifier: string;
        channels: Array<{
          __typename?: "CurrentUserChannel";
          id: string;
          code: string;
          token: string;
          permissions: Array<Permission>;
        }>;
      }
    | {
        __typename?: "InvalidCredentialsError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "NativeAuthStrategyError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "NotVerifiedError";
        errorCode: ErrorCode;
        message: string;
      };
};

export type ShopLogoutMutationVariables = Exact<{ [key: string]: never }>;

export type ShopLogoutMutation = {
  __typename?: "Mutation";
  logout: { __typename?: "Success"; success: boolean };
};

export type ShopRegisterMutationVariables = Exact<{
  input: RegisterCustomerInput;
}>;

export type ShopRegisterMutation = {
  __typename?: "Mutation";
  registerCustomerAccount:
    | {
        __typename?: "MissingPasswordError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "NativeAuthStrategyError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "PasswordValidationError";
        errorCode: ErrorCode;
        message: string;
        validationErrorMessage: string;
      }
    | { __typename?: "Success"; success: boolean };
};

export type VerifyCustomerAccountMutationVariables = Exact<{
  token: Scalars["String"]["input"];
  password?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type VerifyCustomerAccountMutation = {
  __typename?: "Mutation";
  verifyCustomerAccount:
    | {
        __typename?: "CurrentUser";
        id: string;
        identifier: string;
        channels: Array<{
          __typename?: "CurrentUserChannel";
          id: string;
          code: string;
          token: string;
          permissions: Array<Permission>;
        }>;
      }
    | {
        __typename?: "MissingPasswordError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "NativeAuthStrategyError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "PasswordAlreadySetError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "PasswordValidationError";
        errorCode: ErrorCode;
        message: string;
        validationErrorMessage: string;
      }
    | {
        __typename?: "VerificationTokenExpiredError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "VerificationTokenInvalidError";
        errorCode: ErrorCode;
        message: string;
      };
};

export type RefreshVerificationMutationVariables = Exact<{
  emailAddress: Scalars["String"]["input"];
}>;

export type RefreshVerificationMutation = {
  __typename?: "Mutation";
  refreshCustomerVerification:
    | {
        __typename?: "NativeAuthStrategyError";
        errorCode: ErrorCode;
        message: string;
      }
    | { __typename?: "Success"; success: boolean };
};

export type RequestPasswordResetMutationVariables = Exact<{
  emailAddress: Scalars["String"]["input"];
}>;

export type RequestPasswordResetMutation = {
  __typename?: "Mutation";
  requestPasswordReset?:
    | {
        __typename?: "NativeAuthStrategyError";
        errorCode: ErrorCode;
        message: string;
      }
    | { __typename?: "Success"; success: boolean }
    | null;
};

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
}>;

export type ResetPasswordMutation = {
  __typename?: "Mutation";
  resetPassword:
    | {
        __typename?: "CurrentUser";
        id: string;
        identifier: string;
        channels: Array<{
          __typename?: "CurrentUserChannel";
          id: string;
          code: string;
          token: string;
          permissions: Array<Permission>;
        }>;
      }
    | {
        __typename?: "NativeAuthStrategyError";
        errorCode: ErrorCode;
        message: string;
      }
    | { __typename?: "NotVerifiedError"; errorCode: ErrorCode; message: string }
    | {
        __typename?: "PasswordResetTokenExpiredError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "PasswordResetTokenInvalidError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "PasswordValidationError";
        errorCode: ErrorCode;
        message: string;
        validationErrorMessage: string;
      };
};

export type UpdateCustomerProfileMutationVariables = Exact<{
  input: UpdateCustomerInput;
}>;

export type UpdateCustomerProfileMutation = {
  __typename?: "Mutation";
  updateCustomer: {
    __typename?: "Customer";
    id: string;
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber?: string | null;
    addresses?: Array<{
      __typename?: "Address";
      id: string;
      fullName?: string | null;
      company?: string | null;
      streetLine1: string;
      streetLine2?: string | null;
      city?: string | null;
      province?: string | null;
      postalCode?: string | null;
      phoneNumber?: string | null;
      defaultShippingAddress?: boolean | null;
      defaultBillingAddress?: boolean | null;
      country: { __typename?: "Country"; code: string; name: string };
    }> | null;
    customFields?: {
      __typename?: "CustomerCustomFields";
      wilaya?: string | null;
      city?: string | null;
    } | null;
  };
};

export type UpdateCustomerPasswordMutationVariables = Exact<{
  currentPassword: Scalars["String"]["input"];
  newPassword: Scalars["String"]["input"];
}>;

export type UpdateCustomerPasswordMutation = {
  __typename?: "Mutation";
  updateCustomerPassword:
    | {
        __typename?: "InvalidCredentialsError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "NativeAuthStrategyError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "PasswordValidationError";
        errorCode: ErrorCode;
        message: string;
        validationErrorMessage: string;
      }
    | { __typename?: "Success"; success: boolean };
};

export type CreateCustomerAddressMutationVariables = Exact<{
  input: CreateAddressInput;
}>;

export type CreateCustomerAddressMutation = {
  __typename?: "Mutation";
  createCustomerAddress: {
    __typename?: "Address";
    id: string;
    fullName?: string | null;
    company?: string | null;
    streetLine1: string;
    streetLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    phoneNumber?: string | null;
    defaultShippingAddress?: boolean | null;
    defaultBillingAddress?: boolean | null;
    country: { __typename?: "Country"; code: string; name: string };
  };
};

export type UpdateCustomerAddressMutationVariables = Exact<{
  input: UpdateAddressInput;
}>;

export type UpdateCustomerAddressMutation = {
  __typename?: "Mutation";
  updateCustomerAddress: {
    __typename?: "Address";
    id: string;
    fullName?: string | null;
    company?: string | null;
    streetLine1: string;
    streetLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    phoneNumber?: string | null;
    defaultShippingAddress?: boolean | null;
    defaultBillingAddress?: boolean | null;
    country: { __typename?: "Country"; code: string; name: string };
  };
};

export type DeleteCustomerAddressMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteCustomerAddressMutation = {
  __typename?: "Mutation";
  deleteCustomerAddress: { __typename?: "Success"; success: boolean };
};

export type OrderLineFieldsFragment = {
  __typename?: "OrderLine";
  id: string;
  quantity: number;
  linePriceWithTax: number;
  unitPriceWithTax: number;
  productVariant: {
    __typename?: "ProductVariant";
    id: string;
    name: string;
    sku: string;
    priceWithTax: number;
    product: {
      __typename?: "Product";
      id: string;
      name: string;
      slug: string;
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
      } | null;
    };
  };
  featuredAsset?: { __typename?: "Asset"; id: string; preview: string } | null;
};

export type DiscountFieldsFragment = {
  __typename?: "Discount";
  adjustmentSource: string;
  amount: number;
  amountWithTax: number;
  description: string;
  type: AdjustmentType;
};

export type OrderFieldsFragment = {
  __typename?: "Order";
  id: string;
  code: string;
  state: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  totalQuantity: number;
  subTotalWithTax: number;
  shippingWithTax: number;
  totalWithTax: number;
  currencyCode: CurrencyCode;
  couponCodes: Array<string>;
  discounts: Array<{
    __typename?: "Discount";
    adjustmentSource: string;
    amount: number;
    amountWithTax: number;
    description: string;
    type: AdjustmentType;
  }>;
  lines: Array<{
    __typename?: "OrderLine";
    id: string;
    quantity: number;
    linePriceWithTax: number;
    unitPriceWithTax: number;
    productVariant: {
      __typename?: "ProductVariant";
      id: string;
      name: string;
      sku: string;
      priceWithTax: number;
      product: {
        __typename?: "Product";
        id: string;
        name: string;
        slug: string;
        featuredAsset?: {
          __typename?: "Asset";
          id: string;
          preview: string;
        } | null;
      };
    };
    featuredAsset?: {
      __typename?: "Asset";
      id: string;
      preview: string;
    } | null;
  }>;
  shippingAddress?: {
    __typename?: "OrderAddress";
    fullName?: string | null;
    streetLine1?: string | null;
    streetLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
    phoneNumber?: string | null;
  } | null;
  billingAddress?: {
    __typename?: "OrderAddress";
    fullName?: string | null;
    streetLine1?: string | null;
    streetLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
    phoneNumber?: string | null;
  } | null;
  customer?: {
    __typename?: "Customer";
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
  } | null;
  payments?: Array<{
    __typename?: "Payment";
    id: string;
    method: string;
    amount: number;
    state: string;
    transactionId?: string | null;
    createdAt: string;
    metadata?: Record<string, any> | null;
  }> | null;
  fulfillments?: Array<{
    __typename?: "Fulfillment";
    id: string;
    state: string;
    method: string;
    trackingCode?: string | null;
    createdAt: string;
    lines: Array<{
      __typename?: "FulfillmentLine";
      orderLineId: string;
      quantity: number;
    }>;
  }> | null;
};

export type GetActiveOrderQueryVariables = Exact<{ [key: string]: never }>;

export type GetActiveOrderQuery = {
  __typename?: "Query";
  activeOrder?: {
    __typename?: "Order";
    id: string;
    code: string;
    state: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    totalQuantity: number;
    subTotalWithTax: number;
    shippingWithTax: number;
    totalWithTax: number;
    currencyCode: CurrencyCode;
    couponCodes: Array<string>;
    discounts: Array<{
      __typename?: "Discount";
      adjustmentSource: string;
      amount: number;
      amountWithTax: number;
      description: string;
      type: AdjustmentType;
    }>;
    lines: Array<{
      __typename?: "OrderLine";
      id: string;
      quantity: number;
      linePriceWithTax: number;
      unitPriceWithTax: number;
      productVariant: {
        __typename?: "ProductVariant";
        id: string;
        name: string;
        sku: string;
        priceWithTax: number;
        product: {
          __typename?: "Product";
          id: string;
          name: string;
          slug: string;
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        };
      };
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
      } | null;
    }>;
    shippingAddress?: {
      __typename?: "OrderAddress";
      fullName?: string | null;
      streetLine1?: string | null;
      streetLine2?: string | null;
      city?: string | null;
      province?: string | null;
      postalCode?: string | null;
      country?: string | null;
      phoneNumber?: string | null;
    } | null;
    billingAddress?: {
      __typename?: "OrderAddress";
      fullName?: string | null;
      streetLine1?: string | null;
      streetLine2?: string | null;
      city?: string | null;
      province?: string | null;
      postalCode?: string | null;
      country?: string | null;
      phoneNumber?: string | null;
    } | null;
    customer?: {
      __typename?: "Customer";
      id: string;
      firstName: string;
      lastName: string;
      emailAddress: string;
    } | null;
    payments?: Array<{
      __typename?: "Payment";
      id: string;
      method: string;
      amount: number;
      state: string;
      transactionId?: string | null;
      createdAt: string;
      metadata?: Record<string, any> | null;
    }> | null;
    fulfillments?: Array<{
      __typename?: "Fulfillment";
      id: string;
      state: string;
      method: string;
      trackingCode?: string | null;
      createdAt: string;
      lines: Array<{
        __typename?: "FulfillmentLine";
        orderLineId: string;
        quantity: number;
      }>;
    }> | null;
  } | null;
};

export type AddItemToOrderMutationVariables = Exact<{
  productVariantId: Scalars["ID"]["input"];
  quantity: Scalars["Int"]["input"];
}>;

export type AddItemToOrderMutation = {
  __typename?: "Mutation";
  addItemToOrder:
    | {
        __typename?: "InsufficientStockError";
        errorCode: ErrorCode;
        message: string;
        quantityAvailable: number;
        order: {
          __typename?: "Order";
          id: string;
          code: string;
          state: string;
          active: boolean;
          createdAt: string;
          updatedAt: string;
          totalQuantity: number;
          subTotalWithTax: number;
          shippingWithTax: number;
          totalWithTax: number;
          currencyCode: CurrencyCode;
          couponCodes: Array<string>;
          discounts: Array<{
            __typename?: "Discount";
            adjustmentSource: string;
            amount: number;
            amountWithTax: number;
            description: string;
            type: AdjustmentType;
          }>;
          lines: Array<{
            __typename?: "OrderLine";
            id: string;
            quantity: number;
            linePriceWithTax: number;
            unitPriceWithTax: number;
            productVariant: {
              __typename?: "ProductVariant";
              id: string;
              name: string;
              sku: string;
              priceWithTax: number;
              product: {
                __typename?: "Product";
                id: string;
                name: string;
                slug: string;
                featuredAsset?: {
                  __typename?: "Asset";
                  id: string;
                  preview: string;
                } | null;
              };
            };
            featuredAsset?: {
              __typename?: "Asset";
              id: string;
              preview: string;
            } | null;
          }>;
          shippingAddress?: {
            __typename?: "OrderAddress";
            fullName?: string | null;
            streetLine1?: string | null;
            streetLine2?: string | null;
            city?: string | null;
            province?: string | null;
            postalCode?: string | null;
            country?: string | null;
            phoneNumber?: string | null;
          } | null;
          billingAddress?: {
            __typename?: "OrderAddress";
            fullName?: string | null;
            streetLine1?: string | null;
            streetLine2?: string | null;
            city?: string | null;
            province?: string | null;
            postalCode?: string | null;
            country?: string | null;
            phoneNumber?: string | null;
          } | null;
          customer?: {
            __typename?: "Customer";
            id: string;
            firstName: string;
            lastName: string;
            emailAddress: string;
          } | null;
          payments?: Array<{
            __typename?: "Payment";
            id: string;
            method: string;
            amount: number;
            state: string;
            transactionId?: string | null;
            createdAt: string;
            metadata?: Record<string, any> | null;
          }> | null;
          fulfillments?: Array<{
            __typename?: "Fulfillment";
            id: string;
            state: string;
            method: string;
            trackingCode?: string | null;
            createdAt: string;
            lines: Array<{
              __typename?: "FulfillmentLine";
              orderLineId: string;
              quantity: number;
            }>;
          }> | null;
        };
      }
    | {
        __typename?: "NegativeQuantityError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      }
    | { __typename?: "OrderInterceptorError" }
    | {
        __typename?: "OrderLimitError";
        errorCode: ErrorCode;
        message: string;
        maxItems: number;
      }
    | {
        __typename?: "OrderModificationError";
        errorCode: ErrorCode;
        message: string;
      };
};

export type AdjustOrderLineMutationVariables = Exact<{
  orderLineId: Scalars["ID"]["input"];
  quantity: Scalars["Int"]["input"];
}>;

export type AdjustOrderLineMutation = {
  __typename?: "Mutation";
  adjustOrderLine:
    | {
        __typename?: "InsufficientStockError";
        errorCode: ErrorCode;
        message: string;
        quantityAvailable: number;
        order: {
          __typename?: "Order";
          id: string;
          code: string;
          state: string;
          active: boolean;
          createdAt: string;
          updatedAt: string;
          totalQuantity: number;
          subTotalWithTax: number;
          shippingWithTax: number;
          totalWithTax: number;
          currencyCode: CurrencyCode;
          couponCodes: Array<string>;
          discounts: Array<{
            __typename?: "Discount";
            adjustmentSource: string;
            amount: number;
            amountWithTax: number;
            description: string;
            type: AdjustmentType;
          }>;
          lines: Array<{
            __typename?: "OrderLine";
            id: string;
            quantity: number;
            linePriceWithTax: number;
            unitPriceWithTax: number;
            productVariant: {
              __typename?: "ProductVariant";
              id: string;
              name: string;
              sku: string;
              priceWithTax: number;
              product: {
                __typename?: "Product";
                id: string;
                name: string;
                slug: string;
                featuredAsset?: {
                  __typename?: "Asset";
                  id: string;
                  preview: string;
                } | null;
              };
            };
            featuredAsset?: {
              __typename?: "Asset";
              id: string;
              preview: string;
            } | null;
          }>;
          shippingAddress?: {
            __typename?: "OrderAddress";
            fullName?: string | null;
            streetLine1?: string | null;
            streetLine2?: string | null;
            city?: string | null;
            province?: string | null;
            postalCode?: string | null;
            country?: string | null;
            phoneNumber?: string | null;
          } | null;
          billingAddress?: {
            __typename?: "OrderAddress";
            fullName?: string | null;
            streetLine1?: string | null;
            streetLine2?: string | null;
            city?: string | null;
            province?: string | null;
            postalCode?: string | null;
            country?: string | null;
            phoneNumber?: string | null;
          } | null;
          customer?: {
            __typename?: "Customer";
            id: string;
            firstName: string;
            lastName: string;
            emailAddress: string;
          } | null;
          payments?: Array<{
            __typename?: "Payment";
            id: string;
            method: string;
            amount: number;
            state: string;
            transactionId?: string | null;
            createdAt: string;
            metadata?: Record<string, any> | null;
          }> | null;
          fulfillments?: Array<{
            __typename?: "Fulfillment";
            id: string;
            state: string;
            method: string;
            trackingCode?: string | null;
            createdAt: string;
            lines: Array<{
              __typename?: "FulfillmentLine";
              orderLineId: string;
              quantity: number;
            }>;
          }> | null;
        };
      }
    | {
        __typename?: "NegativeQuantityError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      }
    | { __typename?: "OrderInterceptorError" }
    | {
        __typename?: "OrderLimitError";
        errorCode: ErrorCode;
        message: string;
        maxItems: number;
      }
    | {
        __typename?: "OrderModificationError";
        errorCode: ErrorCode;
        message: string;
      };
};

export type RemoveOrderLineMutationVariables = Exact<{
  orderLineId: Scalars["ID"]["input"];
}>;

export type RemoveOrderLineMutation = {
  __typename?: "Mutation";
  removeOrderLine:
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      }
    | { __typename?: "OrderInterceptorError" }
    | {
        __typename?: "OrderModificationError";
        errorCode: ErrorCode;
        message: string;
      };
};

export type RemoveAllOrderLinesMutationVariables = Exact<{
  [key: string]: never;
}>;

export type RemoveAllOrderLinesMutation = {
  __typename?: "Mutation";
  removeAllOrderLines:
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      }
    | { __typename?: "OrderInterceptorError" }
    | {
        __typename?: "OrderModificationError";
        errorCode: ErrorCode;
        message: string;
      };
};

export type SetCustomerForOrderMutationVariables = Exact<{
  input: CreateCustomerInput;
}>;

export type SetCustomerForOrderMutation = {
  __typename?: "Mutation";
  setCustomerForOrder:
    | {
        __typename?: "AlreadyLoggedInError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "EmailAddressConflictError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "GuestCheckoutError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "NoActiveOrderError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      };
};

export type SetOrderShippingAddressMutationVariables = Exact<{
  input: CreateAddressInput;
}>;

export type SetOrderShippingAddressMutation = {
  __typename?: "Mutation";
  setOrderShippingAddress:
    | {
        __typename?: "NoActiveOrderError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      };
};

export type SetOrderBillingAddressMutationVariables = Exact<{
  input: CreateAddressInput;
}>;

export type SetOrderBillingAddressMutation = {
  __typename?: "Mutation";
  setOrderBillingAddress:
    | {
        __typename?: "NoActiveOrderError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      };
};

export type GetEligibleShippingMethodsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetEligibleShippingMethodsQuery = {
  __typename?: "Query";
  eligibleShippingMethods: Array<{
    __typename?: "ShippingMethodQuote";
    id: string;
    name: string;
    description: string;
    price: number;
    priceWithTax: number;
    metadata?: Record<string, any> | null;
  }>;
};

export type SetOrderShippingMethodMutationVariables = Exact<{
  shippingMethodId: Array<Scalars["ID"]["input"]> | Scalars["ID"]["input"];
}>;

export type SetOrderShippingMethodMutation = {
  __typename?: "Mutation";
  setOrderShippingMethod:
    | {
        __typename?: "IneligibleShippingMethodError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "NoActiveOrderError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        shippingLines: Array<{
          __typename?: "ShippingLine";
          priceWithTax: number;
          shippingMethod: {
            __typename?: "ShippingMethod";
            id: string;
            name: string;
          };
        }>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      }
    | {
        __typename?: "OrderModificationError";
        errorCode: ErrorCode;
        message: string;
      };
};

export type GetEligiblePaymentMethodsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetEligiblePaymentMethodsQuery = {
  __typename?: "Query";
  eligiblePaymentMethods: Array<{
    __typename?: "PaymentMethodQuote";
    id: string;
    name: string;
    code: string;
    description: string;
    isEligible: boolean;
    eligibilityMessage?: string | null;
  }>;
};

export type TransitionOrderToStateMutationVariables = Exact<{
  state: Scalars["String"]["input"];
}>;

export type TransitionOrderToStateMutation = {
  __typename?: "Mutation";
  transitionOrderToState?:
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      }
    | {
        __typename?: "OrderStateTransitionError";
        errorCode: ErrorCode;
        message: string;
        transitionError: string;
        fromState: string;
        toState: string;
      }
    | null;
};

export type AddPaymentToOrderMutationVariables = Exact<{
  input: PaymentInput;
}>;

export type AddPaymentToOrderMutation = {
  __typename?: "Mutation";
  addPaymentToOrder:
    | {
        __typename?: "IneligiblePaymentMethodError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "NoActiveOrderError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      }
    | {
        __typename?: "OrderPaymentStateError";
        errorCode: ErrorCode;
        message: string;
      }
    | {
        __typename?: "OrderStateTransitionError";
        errorCode: ErrorCode;
        message: string;
        transitionError: string;
        fromState: string;
        toState: string;
      }
    | {
        __typename?: "PaymentDeclinedError";
        errorCode: ErrorCode;
        message: string;
        paymentErrorMessage: string;
      }
    | {
        __typename?: "PaymentFailedError";
        errorCode: ErrorCode;
        message: string;
        paymentErrorMessage: string;
      };
};

export type GetOrderByCodeQueryVariables = Exact<{
  code: Scalars["String"]["input"];
}>;

export type GetOrderByCodeQuery = {
  __typename?: "Query";
  orderByCode?: {
    __typename?: "Order";
    id: string;
    code: string;
    state: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    totalQuantity: number;
    subTotalWithTax: number;
    shippingWithTax: number;
    totalWithTax: number;
    currencyCode: CurrencyCode;
    couponCodes: Array<string>;
    discounts: Array<{
      __typename?: "Discount";
      adjustmentSource: string;
      amount: number;
      amountWithTax: number;
      description: string;
      type: AdjustmentType;
    }>;
    lines: Array<{
      __typename?: "OrderLine";
      id: string;
      quantity: number;
      linePriceWithTax: number;
      unitPriceWithTax: number;
      productVariant: {
        __typename?: "ProductVariant";
        id: string;
        name: string;
        sku: string;
        priceWithTax: number;
        product: {
          __typename?: "Product";
          id: string;
          name: string;
          slug: string;
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        };
      };
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
      } | null;
    }>;
    shippingAddress?: {
      __typename?: "OrderAddress";
      fullName?: string | null;
      streetLine1?: string | null;
      streetLine2?: string | null;
      city?: string | null;
      province?: string | null;
      postalCode?: string | null;
      country?: string | null;
      phoneNumber?: string | null;
    } | null;
    billingAddress?: {
      __typename?: "OrderAddress";
      fullName?: string | null;
      streetLine1?: string | null;
      streetLine2?: string | null;
      city?: string | null;
      province?: string | null;
      postalCode?: string | null;
      country?: string | null;
      phoneNumber?: string | null;
    } | null;
    customer?: {
      __typename?: "Customer";
      id: string;
      firstName: string;
      lastName: string;
      emailAddress: string;
    } | null;
    payments?: Array<{
      __typename?: "Payment";
      id: string;
      method: string;
      amount: number;
      state: string;
      transactionId?: string | null;
      createdAt: string;
      metadata?: Record<string, any> | null;
    }> | null;
    fulfillments?: Array<{
      __typename?: "Fulfillment";
      id: string;
      state: string;
      method: string;
      trackingCode?: string | null;
      createdAt: string;
      lines: Array<{
        __typename?: "FulfillmentLine";
        orderLineId: string;
        quantity: number;
      }>;
    }> | null;
  } | null;
};

export type GetCustomerOrdersQueryVariables = Exact<{
  options?: InputMaybe<OrderListOptions>;
}>;

export type GetCustomerOrdersQuery = {
  __typename?: "Query";
  activeCustomer?: {
    __typename?: "Customer";
    orders: {
      __typename?: "OrderList";
      totalItems: number;
      items: Array<{
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        totalWithTax: number;
        createdAt: string;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          productVariant: { __typename?: "ProductVariant"; name: string };
          featuredAsset?: { __typename?: "Asset"; preview: string } | null;
        }>;
      }>;
    };
  } | null;
};

export type ApplyCouponCodeMutationVariables = Exact<{
  couponCode: Scalars["String"]["input"];
}>;

export type ApplyCouponCodeMutation = {
  __typename?: "Mutation";
  applyCouponCode:
    | {
        __typename?: "CouponCodeExpiredError";
        errorCode: ErrorCode;
        message: string;
        couponCode: string;
      }
    | {
        __typename?: "CouponCodeInvalidError";
        errorCode: ErrorCode;
        message: string;
        couponCode: string;
      }
    | {
        __typename?: "CouponCodeLimitError";
        errorCode: ErrorCode;
        message: string;
        couponCode: string;
        limit: number;
      }
    | {
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        active: boolean;
        createdAt: string;
        updatedAt: string;
        totalQuantity: number;
        subTotalWithTax: number;
        shippingWithTax: number;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        couponCodes: Array<string>;
        discounts: Array<{
          __typename?: "Discount";
          adjustmentSource: string;
          amount: number;
          amountWithTax: number;
          description: string;
          type: AdjustmentType;
        }>;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          linePriceWithTax: number;
          unitPriceWithTax: number;
          productVariant: {
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            product: {
              __typename?: "Product";
              id: string;
              name: string;
              slug: string;
              featuredAsset?: {
                __typename?: "Asset";
                id: string;
                preview: string;
              } | null;
            };
          };
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        }>;
        shippingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        billingAddress?: {
          __typename?: "OrderAddress";
          fullName?: string | null;
          streetLine1?: string | null;
          streetLine2?: string | null;
          city?: string | null;
          province?: string | null;
          postalCode?: string | null;
          country?: string | null;
          phoneNumber?: string | null;
        } | null;
        customer?: {
          __typename?: "Customer";
          id: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
        } | null;
        payments?: Array<{
          __typename?: "Payment";
          id: string;
          method: string;
          amount: number;
          state: string;
          transactionId?: string | null;
          createdAt: string;
          metadata?: Record<string, any> | null;
        }> | null;
        fulfillments?: Array<{
          __typename?: "Fulfillment";
          id: string;
          state: string;
          method: string;
          trackingCode?: string | null;
          createdAt: string;
          lines: Array<{
            __typename?: "FulfillmentLine";
            orderLineId: string;
            quantity: number;
          }>;
        }> | null;
      };
};

export type RemoveCouponCodeMutationVariables = Exact<{
  couponCode: Scalars["String"]["input"];
}>;

export type RemoveCouponCodeMutation = {
  __typename?: "Mutation";
  removeCouponCode?: {
    __typename?: "Order";
    id: string;
    code: string;
    state: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    totalQuantity: number;
    subTotalWithTax: number;
    shippingWithTax: number;
    totalWithTax: number;
    currencyCode: CurrencyCode;
    couponCodes: Array<string>;
    discounts: Array<{
      __typename?: "Discount";
      adjustmentSource: string;
      amount: number;
      amountWithTax: number;
      description: string;
      type: AdjustmentType;
    }>;
    lines: Array<{
      __typename?: "OrderLine";
      id: string;
      quantity: number;
      linePriceWithTax: number;
      unitPriceWithTax: number;
      productVariant: {
        __typename?: "ProductVariant";
        id: string;
        name: string;
        sku: string;
        priceWithTax: number;
        product: {
          __typename?: "Product";
          id: string;
          name: string;
          slug: string;
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        };
      };
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
      } | null;
    }>;
    shippingAddress?: {
      __typename?: "OrderAddress";
      fullName?: string | null;
      streetLine1?: string | null;
      streetLine2?: string | null;
      city?: string | null;
      province?: string | null;
      postalCode?: string | null;
      country?: string | null;
      phoneNumber?: string | null;
    } | null;
    billingAddress?: {
      __typename?: "OrderAddress";
      fullName?: string | null;
      streetLine1?: string | null;
      streetLine2?: string | null;
      city?: string | null;
      province?: string | null;
      postalCode?: string | null;
      country?: string | null;
      phoneNumber?: string | null;
    } | null;
    customer?: {
      __typename?: "Customer";
      id: string;
      firstName: string;
      lastName: string;
      emailAddress: string;
    } | null;
    payments?: Array<{
      __typename?: "Payment";
      id: string;
      method: string;
      amount: number;
      state: string;
      transactionId?: string | null;
      createdAt: string;
      metadata?: Record<string, any> | null;
    }> | null;
    fulfillments?: Array<{
      __typename?: "Fulfillment";
      id: string;
      state: string;
      method: string;
      trackingCode?: string | null;
      createdAt: string;
      lines: Array<{
        __typename?: "FulfillmentLine";
        orderLineId: string;
        quantity: number;
      }>;
    }> | null;
  } | null;
};

export type CustomerOrderFieldsFragment = {
  __typename?: "Order";
  id: string;
  code: string;
  state: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  totalQuantity: number;
  subTotalWithTax: number;
  shippingWithTax: number;
  totalWithTax: number;
  currencyCode: CurrencyCode;
  lines: Array<{
    __typename?: "OrderLine";
    id: string;
    quantity: number;
    linePriceWithTax: number;
    unitPriceWithTax: number;
    productVariant: {
      __typename?: "ProductVariant";
      id: string;
      name: string;
      sku: string;
      product: {
        __typename?: "Product";
        id: string;
        name: string;
        slug: string;
        featuredAsset?: {
          __typename?: "Asset";
          id: string;
          preview: string;
        } | null;
      };
    };
    featuredAsset?: {
      __typename?: "Asset";
      id: string;
      preview: string;
    } | null;
  }>;
  shippingAddress?: {
    __typename?: "OrderAddress";
    fullName?: string | null;
    streetLine1?: string | null;
    streetLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
    phoneNumber?: string | null;
  } | null;
  billingAddress?: {
    __typename?: "OrderAddress";
    fullName?: string | null;
    streetLine1?: string | null;
    streetLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
    phoneNumber?: string | null;
  } | null;
  shippingLines: Array<{
    __typename?: "ShippingLine";
    priceWithTax: number;
    shippingMethod: {
      __typename?: "ShippingMethod";
      id: string;
      name: string;
      description: string;
    };
  }>;
  payments?: Array<{
    __typename?: "Payment";
    id: string;
    method: string;
    amount: number;
    state: string;
    transactionId?: string | null;
    createdAt: string;
    metadata?: Record<string, any> | null;
  }> | null;
  fulfillments?: Array<{
    __typename?: "Fulfillment";
    id: string;
    state: string;
    method: string;
    trackingCode?: string | null;
    createdAt: string;
    lines: Array<{
      __typename?: "FulfillmentLine";
      orderLineId: string;
      quantity: number;
    }>;
  }> | null;
};

export type GetMyOrdersQueryVariables = Exact<{
  options?: InputMaybe<OrderListOptions>;
}>;

export type GetMyOrdersQuery = {
  __typename?: "Query";
  activeCustomer?: {
    __typename?: "Customer";
    orders: {
      __typename?: "OrderList";
      totalItems: number;
      items: Array<{
        __typename?: "Order";
        id: string;
        code: string;
        state: string;
        createdAt: string;
        totalWithTax: number;
        currencyCode: CurrencyCode;
        totalQuantity: number;
        lines: Array<{
          __typename?: "OrderLine";
          id: string;
          quantity: number;
          productVariant: {
            __typename?: "ProductVariant";
            name: string;
            product: {
              __typename?: "Product";
              name: string;
              featuredAsset?: { __typename?: "Asset"; preview: string } | null;
            };
          };
          featuredAsset?: { __typename?: "Asset"; preview: string } | null;
        }>;
      }>;
    };
  } | null;
};

export type GetOrderQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetOrderQuery = {
  __typename?: "Query";
  order?: {
    __typename?: "Order";
    id: string;
    code: string;
    state: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    totalQuantity: number;
    subTotalWithTax: number;
    shippingWithTax: number;
    totalWithTax: number;
    currencyCode: CurrencyCode;
    lines: Array<{
      __typename?: "OrderLine";
      id: string;
      quantity: number;
      linePriceWithTax: number;
      unitPriceWithTax: number;
      productVariant: {
        __typename?: "ProductVariant";
        id: string;
        name: string;
        sku: string;
        product: {
          __typename?: "Product";
          id: string;
          name: string;
          slug: string;
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
          } | null;
        };
      };
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
      } | null;
    }>;
    shippingAddress?: {
      __typename?: "OrderAddress";
      fullName?: string | null;
      streetLine1?: string | null;
      streetLine2?: string | null;
      city?: string | null;
      province?: string | null;
      postalCode?: string | null;
      country?: string | null;
      phoneNumber?: string | null;
    } | null;
    billingAddress?: {
      __typename?: "OrderAddress";
      fullName?: string | null;
      streetLine1?: string | null;
      streetLine2?: string | null;
      city?: string | null;
      province?: string | null;
      postalCode?: string | null;
      country?: string | null;
      phoneNumber?: string | null;
    } | null;
    shippingLines: Array<{
      __typename?: "ShippingLine";
      priceWithTax: number;
      shippingMethod: {
        __typename?: "ShippingMethod";
        id: string;
        name: string;
        description: string;
      };
    }>;
    payments?: Array<{
      __typename?: "Payment";
      id: string;
      method: string;
      amount: number;
      state: string;
      transactionId?: string | null;
      createdAt: string;
      metadata?: Record<string, any> | null;
    }> | null;
    fulfillments?: Array<{
      __typename?: "Fulfillment";
      id: string;
      state: string;
      method: string;
      trackingCode?: string | null;
      createdAt: string;
      lines: Array<{
        __typename?: "FulfillmentLine";
        orderLineId: string;
        quantity: number;
      }>;
    }> | null;
  } | null;
};

export type GetNextOrderStatesQueryVariables = Exact<{ [key: string]: never }>;

export type GetNextOrderStatesQuery = {
  __typename?: "Query";
  nextOrderStates: Array<string>;
};

export type AssetFieldsFragment = {
  __typename?: "Asset";
  id: string;
  preview: string;
  source: string;
  width: number;
  height: number;
  name: string;
};

export type ProductVariantFieldsFragment = {
  __typename?: "ProductVariant";
  id: string;
  name: string;
  sku: string;
  priceWithTax: number;
  currencyCode: CurrencyCode;
  stockLevel: string;
  featuredAsset?: {
    __typename?: "Asset";
    id: string;
    preview: string;
    source: string;
    width: number;
    height: number;
    name: string;
  } | null;
  options: Array<{
    __typename?: "ProductOption";
    id: string;
    code: string;
    name: string;
    group: {
      __typename?: "ProductOptionGroup";
      id: string;
      code: string;
      name: string;
    };
  }>;
};

export type ProductFieldsFragment = {
  __typename?: "Product";
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset?: {
    __typename?: "Asset";
    id: string;
    preview: string;
    source: string;
    width: number;
    height: number;
    name: string;
  } | null;
  assets: Array<{
    __typename?: "Asset";
    id: string;
    preview: string;
    source: string;
    width: number;
    height: number;
    name: string;
  }>;
  variants: Array<{
    __typename?: "ProductVariant";
    id: string;
    name: string;
    sku: string;
    priceWithTax: number;
    currencyCode: CurrencyCode;
    stockLevel: string;
    featuredAsset?: {
      __typename?: "Asset";
      id: string;
      preview: string;
      source: string;
      width: number;
      height: number;
      name: string;
    } | null;
    options: Array<{
      __typename?: "ProductOption";
      id: string;
      code: string;
      name: string;
      group: {
        __typename?: "ProductOptionGroup";
        id: string;
        code: string;
        name: string;
      };
    }>;
  }>;
  collections: Array<{
    __typename?: "Collection";
    id: string;
    name: string;
    slug: string;
  }>;
  facetValues: Array<{
    __typename?: "FacetValue";
    id: string;
    name: string;
    code: string;
    facet: { __typename?: "Facet"; id: string; name: string; code: string };
  }>;
};

export type CollectionFieldsFragment = {
  __typename?: "Collection";
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset?: {
    __typename?: "Asset";
    id: string;
    preview: string;
    source: string;
    width: number;
    height: number;
    name: string;
  } | null;
  parent?: {
    __typename?: "Collection";
    id: string;
    name: string;
    slug: string;
  } | null;
  children?: Array<{
    __typename?: "Collection";
    id: string;
    name: string;
    slug: string;
  }> | null;
  breadcrumbs: Array<{
    __typename?: "CollectionBreadcrumb";
    id: string;
    name: string;
    slug: string;
  }>;
};

export type GetProductsQueryVariables = Exact<{
  options?: InputMaybe<ProductListOptions>;
}>;

export type GetProductsQuery = {
  __typename?: "Query";
  products: {
    __typename?: "ProductList";
    totalItems: number;
    items: Array<{
      __typename?: "Product";
      id: string;
      name: string;
      slug: string;
      description: string;
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
        source: string;
        width: number;
        height: number;
        name: string;
      } | null;
      assets: Array<{
        __typename?: "Asset";
        id: string;
        preview: string;
        source: string;
        width: number;
        height: number;
        name: string;
      }>;
      variants: Array<{
        __typename?: "ProductVariant";
        id: string;
        name: string;
        sku: string;
        priceWithTax: number;
        currencyCode: CurrencyCode;
        stockLevel: string;
        featuredAsset?: {
          __typename?: "Asset";
          id: string;
          preview: string;
          source: string;
          width: number;
          height: number;
          name: string;
        } | null;
        options: Array<{
          __typename?: "ProductOption";
          id: string;
          code: string;
          name: string;
          group: {
            __typename?: "ProductOptionGroup";
            id: string;
            code: string;
            name: string;
          };
        }>;
      }>;
      collections: Array<{
        __typename?: "Collection";
        id: string;
        name: string;
        slug: string;
      }>;
      facetValues: Array<{
        __typename?: "FacetValue";
        id: string;
        name: string;
        code: string;
        facet: { __typename?: "Facet"; id: string; name: string; code: string };
      }>;
    }>;
  };
};

export type GetProductBySlugQueryVariables = Exact<{
  slug: Scalars["String"]["input"];
}>;

export type GetProductBySlugQuery = {
  __typename?: "Query";
  product?: {
    __typename?: "Product";
    id: string;
    name: string;
    slug: string;
    description: string;
    featuredAsset?: {
      __typename?: "Asset";
      id: string;
      preview: string;
      source: string;
      width: number;
      height: number;
      name: string;
    } | null;
    assets: Array<{
      __typename?: "Asset";
      id: string;
      preview: string;
      source: string;
      width: number;
      height: number;
      name: string;
    }>;
    variants: Array<{
      __typename?: "ProductVariant";
      id: string;
      name: string;
      sku: string;
      priceWithTax: number;
      currencyCode: CurrencyCode;
      stockLevel: string;
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
        source: string;
        width: number;
        height: number;
        name: string;
      } | null;
      options: Array<{
        __typename?: "ProductOption";
        id: string;
        code: string;
        name: string;
        group: {
          __typename?: "ProductOptionGroup";
          id: string;
          code: string;
          name: string;
        };
      }>;
    }>;
    collections: Array<{
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
    }>;
    facetValues: Array<{
      __typename?: "FacetValue";
      id: string;
      name: string;
      code: string;
      facet: { __typename?: "Facet"; id: string; name: string; code: string };
    }>;
  } | null;
};

export type GetProductByIdQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetProductByIdQuery = {
  __typename?: "Query";
  product?: {
    __typename?: "Product";
    id: string;
    name: string;
    slug: string;
    description: string;
    featuredAsset?: {
      __typename?: "Asset";
      id: string;
      preview: string;
      source: string;
      width: number;
      height: number;
      name: string;
    } | null;
    assets: Array<{
      __typename?: "Asset";
      id: string;
      preview: string;
      source: string;
      width: number;
      height: number;
      name: string;
    }>;
    variants: Array<{
      __typename?: "ProductVariant";
      id: string;
      name: string;
      sku: string;
      priceWithTax: number;
      currencyCode: CurrencyCode;
      stockLevel: string;
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
        source: string;
        width: number;
        height: number;
        name: string;
      } | null;
      options: Array<{
        __typename?: "ProductOption";
        id: string;
        code: string;
        name: string;
        group: {
          __typename?: "ProductOptionGroup";
          id: string;
          code: string;
          name: string;
        };
      }>;
    }>;
    collections: Array<{
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
    }>;
    facetValues: Array<{
      __typename?: "FacetValue";
      id: string;
      name: string;
      code: string;
      facet: { __typename?: "Facet"; id: string; name: string; code: string };
    }>;
  } | null;
};

export type SearchProductsQueryVariables = Exact<{
  input: SearchInput;
}>;

export type SearchProductsQuery = {
  __typename?: "Query";
  search: {
    __typename?: "SearchResponse";
    totalItems: number;
    items: Array<{
      __typename?: "SearchResult";
      productId: string;
      productName: string;
      slug: string;
      description: string;
      currencyCode: CurrencyCode;
      collectionIds: Array<string>;
      score: number;
      productAsset?: {
        __typename?: "SearchResultAsset";
        id: string;
        preview: string;
      } | null;
      priceWithTax:
        | { __typename?: "PriceRange"; min: number; max: number }
        | { __typename?: "SinglePrice"; value: number };
    }>;
    facetValues: Array<{
      __typename?: "FacetValueResult";
      count: number;
      facetValue: {
        __typename?: "FacetValue";
        id: string;
        name: string;
        code: string;
        facet: { __typename?: "Facet"; id: string; name: string; code: string };
      };
    }>;
  };
};

export type GetCollectionsQueryVariables = Exact<{
  options?: InputMaybe<CollectionListOptions>;
}>;

export type GetCollectionsQuery = {
  __typename?: "Query";
  collections: {
    __typename?: "CollectionList";
    totalItems: number;
    items: Array<{
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
      description: string;
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
        source: string;
        width: number;
        height: number;
        name: string;
      } | null;
      parent?: {
        __typename?: "Collection";
        id: string;
        name: string;
        slug: string;
      } | null;
      children?: Array<{
        __typename?: "Collection";
        id: string;
        name: string;
        slug: string;
      }> | null;
      breadcrumbs: Array<{
        __typename?: "CollectionBreadcrumb";
        id: string;
        name: string;
        slug: string;
      }>;
    }>;
  };
};

export type GetCollectionBySlugQueryVariables = Exact<{
  slug: Scalars["String"]["input"];
}>;

export type GetCollectionBySlugQuery = {
  __typename?: "Query";
  collection?: {
    __typename?: "Collection";
    id: string;
    name: string;
    slug: string;
    description: string;
    productVariants: {
      __typename?: "ProductVariantList";
      totalItems: number;
      items: Array<{
        __typename?: "ProductVariant";
        id: string;
        product: {
          __typename?: "Product";
          id: string;
          name: string;
          slug: string;
          description: string;
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
            source: string;
            width: number;
            height: number;
            name: string;
          } | null;
          assets: Array<{
            __typename?: "Asset";
            id: string;
            preview: string;
            source: string;
            width: number;
            height: number;
            name: string;
          }>;
          variants: Array<{
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            currencyCode: CurrencyCode;
            stockLevel: string;
            featuredAsset?: {
              __typename?: "Asset";
              id: string;
              preview: string;
              source: string;
              width: number;
              height: number;
              name: string;
            } | null;
            options: Array<{
              __typename?: "ProductOption";
              id: string;
              code: string;
              name: string;
              group: {
                __typename?: "ProductOptionGroup";
                id: string;
                code: string;
                name: string;
              };
            }>;
          }>;
          collections: Array<{
            __typename?: "Collection";
            id: string;
            name: string;
            slug: string;
          }>;
          facetValues: Array<{
            __typename?: "FacetValue";
            id: string;
            name: string;
            code: string;
            facet: {
              __typename?: "Facet";
              id: string;
              name: string;
              code: string;
            };
          }>;
        };
      }>;
    };
    featuredAsset?: {
      __typename?: "Asset";
      id: string;
      preview: string;
      source: string;
      width: number;
      height: number;
      name: string;
    } | null;
    parent?: {
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
    } | null;
    children?: Array<{
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
    }> | null;
    breadcrumbs: Array<{
      __typename?: "CollectionBreadcrumb";
      id: string;
      name: string;
      slug: string;
    }>;
  } | null;
};

export type GetCollectionByIdQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetCollectionByIdQuery = {
  __typename?: "Query";
  collection?: {
    __typename?: "Collection";
    id: string;
    name: string;
    slug: string;
    description: string;
    productVariants: {
      __typename?: "ProductVariantList";
      totalItems: number;
      items: Array<{
        __typename?: "ProductVariant";
        id: string;
        product: {
          __typename?: "Product";
          id: string;
          name: string;
          slug: string;
          description: string;
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
            source: string;
            width: number;
            height: number;
            name: string;
          } | null;
          assets: Array<{
            __typename?: "Asset";
            id: string;
            preview: string;
            source: string;
            width: number;
            height: number;
            name: string;
          }>;
          variants: Array<{
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            currencyCode: CurrencyCode;
            stockLevel: string;
            featuredAsset?: {
              __typename?: "Asset";
              id: string;
              preview: string;
              source: string;
              width: number;
              height: number;
              name: string;
            } | null;
            options: Array<{
              __typename?: "ProductOption";
              id: string;
              code: string;
              name: string;
              group: {
                __typename?: "ProductOptionGroup";
                id: string;
                code: string;
                name: string;
              };
            }>;
          }>;
          collections: Array<{
            __typename?: "Collection";
            id: string;
            name: string;
            slug: string;
          }>;
          facetValues: Array<{
            __typename?: "FacetValue";
            id: string;
            name: string;
            code: string;
            facet: {
              __typename?: "Facet";
              id: string;
              name: string;
              code: string;
            };
          }>;
        };
      }>;
    };
    featuredAsset?: {
      __typename?: "Asset";
      id: string;
      preview: string;
      source: string;
      width: number;
      height: number;
      name: string;
    } | null;
    parent?: {
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
    } | null;
    children?: Array<{
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
    }> | null;
    breadcrumbs: Array<{
      __typename?: "CollectionBreadcrumb";
      id: string;
      name: string;
      slug: string;
    }>;
  } | null;
};

export type GetFacetsQueryVariables = Exact<{ [key: string]: never }>;

export type GetFacetsQuery = {
  __typename?: "Query";
  facets: {
    __typename?: "FacetList";
    totalItems: number;
    items: Array<{
      __typename?: "Facet";
      id: string;
      name: string;
      code: string;
      values: Array<{
        __typename?: "FacetValue";
        id: string;
        name: string;
        code: string;
      }>;
    }>;
  };
};

export type GetFacetsWithDetailsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetFacetsWithDetailsQuery = {
  __typename?: "Query";
  facets: {
    __typename?: "FacetList";
    totalItems: number;
    items: Array<{
      __typename?: "Facet";
      id: string;
      name: string;
      code: string;
      values: Array<{
        __typename?: "FacetValue";
        id: string;
        name: string;
        code: string;
      }>;
    }>;
  };
};

export type SearchProductsWithFacetsQueryVariables = Exact<{
  input: SearchInput;
}>;

export type SearchProductsWithFacetsQuery = {
  __typename?: "Query";
  search: {
    __typename?: "SearchResponse";
    totalItems: number;
    items: Array<{
      __typename?: "SearchResult";
      productId: string;
      productName: string;
      slug: string;
      description: string;
      currencyCode: CurrencyCode;
      collectionIds: Array<string>;
      inStock: boolean;
      productAsset?: {
        __typename?: "SearchResultAsset";
        id: string;
        preview: string;
      } | null;
      priceWithTax:
        | { __typename?: "PriceRange"; min: number; max: number }
        | { __typename?: "SinglePrice"; value: number };
    }>;
    facetValues: Array<{
      __typename?: "FacetValueResult";
      count: number;
      facetValue: {
        __typename?: "FacetValue";
        id: string;
        name: string;
        code: string;
        facet: { __typename?: "Facet"; id: string; name: string; code: string };
      };
    }>;
  };
};

export type GetProductsByCollectionQueryVariables = Exact<{
  collectionSlug: Scalars["String"]["input"];
  options?: InputMaybe<ProductVariantListOptions>;
}>;

export type GetProductsByCollectionQuery = {
  __typename?: "Query";
  collection?: {
    __typename?: "Collection";
    id: string;
    name: string;
    slug: string;
    productVariants: {
      __typename?: "ProductVariantList";
      totalItems: number;
      items: Array<{
        __typename?: "ProductVariant";
        id: string;
        product: {
          __typename?: "Product";
          id: string;
          name: string;
          slug: string;
          description: string;
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
            source: string;
            width: number;
            height: number;
            name: string;
          } | null;
          assets: Array<{
            __typename?: "Asset";
            id: string;
            preview: string;
            source: string;
            width: number;
            height: number;
            name: string;
          }>;
          variants: Array<{
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            currencyCode: CurrencyCode;
            stockLevel: string;
            featuredAsset?: {
              __typename?: "Asset";
              id: string;
              preview: string;
              source: string;
              width: number;
              height: number;
              name: string;
            } | null;
            options: Array<{
              __typename?: "ProductOption";
              id: string;
              code: string;
              name: string;
              group: {
                __typename?: "ProductOptionGroup";
                id: string;
                code: string;
                name: string;
              };
            }>;
          }>;
          collections: Array<{
            __typename?: "Collection";
            id: string;
            name: string;
            slug: string;
          }>;
          facetValues: Array<{
            __typename?: "FacetValue";
            id: string;
            name: string;
            code: string;
            facet: {
              __typename?: "Facet";
              id: string;
              name: string;
              code: string;
            };
          }>;
        };
      }>;
    };
  } | null;
};

export type GetCollectionTreeQueryVariables = Exact<{ [key: string]: never }>;

export type GetCollectionTreeQuery = {
  __typename?: "Query";
  collections: {
    __typename?: "CollectionList";
    totalItems: number;
    items: Array<{
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
      description: string;
      parentId: string;
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
        source: string;
        width: number;
        height: number;
        name: string;
      } | null;
      parent?: {
        __typename?: "Collection";
        id: string;
        name: string;
        slug: string;
      } | null;
      children?: Array<{
        __typename?: "Collection";
        id: string;
        name: string;
        slug: string;
        featuredAsset?: {
          __typename?: "Asset";
          id: string;
          preview: string;
          source: string;
          width: number;
          height: number;
          name: string;
        } | null;
        children?: Array<{
          __typename?: "Collection";
          id: string;
          name: string;
          slug: string;
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
            source: string;
            width: number;
            height: number;
            name: string;
          } | null;
        }> | null;
      }> | null;
      breadcrumbs: Array<{
        __typename?: "CollectionBreadcrumb";
        id: string;
        name: string;
        slug: string;
      }>;
    }>;
  };
};

export type GetCollectionWithProductsQueryVariables = Exact<{
  slug: Scalars["String"]["input"];
  take?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetCollectionWithProductsQuery = {
  __typename?: "Query";
  collection?: {
    __typename?: "Collection";
    id: string;
    name: string;
    slug: string;
    description: string;
    featuredAsset?: {
      __typename?: "Asset";
      id: string;
      preview: string;
      source: string;
      width: number;
      height: number;
      name: string;
    } | null;
    parent?: {
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
    } | null;
    children?: Array<{
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
      description: string;
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
        source: string;
        width: number;
        height: number;
        name: string;
      } | null;
    }> | null;
    breadcrumbs: Array<{
      __typename?: "CollectionBreadcrumb";
      id: string;
      name: string;
      slug: string;
    }>;
    productVariants: {
      __typename?: "ProductVariantList";
      totalItems: number;
      items: Array<{
        __typename?: "ProductVariant";
        id: string;
        product: {
          __typename?: "Product";
          id: string;
          name: string;
          slug: string;
          description: string;
          featuredAsset?: {
            __typename?: "Asset";
            id: string;
            preview: string;
            source: string;
            width: number;
            height: number;
            name: string;
          } | null;
          assets: Array<{
            __typename?: "Asset";
            id: string;
            preview: string;
            source: string;
            width: number;
            height: number;
            name: string;
          }>;
          variants: Array<{
            __typename?: "ProductVariant";
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            currencyCode: CurrencyCode;
            stockLevel: string;
            featuredAsset?: {
              __typename?: "Asset";
              id: string;
              preview: string;
              source: string;
              width: number;
              height: number;
              name: string;
            } | null;
            options: Array<{
              __typename?: "ProductOption";
              id: string;
              code: string;
              name: string;
              group: {
                __typename?: "ProductOptionGroup";
                id: string;
                code: string;
                name: string;
              };
            }>;
          }>;
          collections: Array<{
            __typename?: "Collection";
            id: string;
            name: string;
            slug: string;
          }>;
          facetValues: Array<{
            __typename?: "FacetValue";
            id: string;
            name: string;
            code: string;
            facet: {
              __typename?: "Facet";
              id: string;
              name: string;
              code: string;
            };
          }>;
        };
      }>;
    };
  } | null;
};

export type GetRootCollectionsQueryVariables = Exact<{ [key: string]: never }>;

export type GetRootCollectionsQuery = {
  __typename?: "Query";
  collections: {
    __typename?: "CollectionList";
    totalItems: number;
    items: Array<{
      __typename?: "Collection";
      id: string;
      name: string;
      slug: string;
      description: string;
      featuredAsset?: {
        __typename?: "Asset";
        id: string;
        preview: string;
        source: string;
        width: number;
        height: number;
        name: string;
      } | null;
      children?: Array<{
        __typename?: "Collection";
        id: string;
        name: string;
        slug: string;
        featuredAsset?: {
          __typename?: "Asset";
          id: string;
          preview: string;
          source: string;
          width: number;
          height: number;
          name: string;
        } | null;
      }> | null;
    }>;
  };
};

export const CurrentUserFieldsFragmentDoc = gql`
  fragment CurrentUserFields on CurrentUser {
    id
    identifier
    channels {
      id
      code
      token
      permissions
    }
  }
`;
export const CustomerFieldsFragmentDoc = gql`
  fragment CustomerFields on Customer {
    id
    createdAt
    updatedAt
    firstName
    lastName
    emailAddress
    phoneNumber
    addresses {
      id
      fullName
      company
      streetLine1
      streetLine2
      city
      province
      postalCode
      country {
        code
        name
      }
      phoneNumber
      defaultShippingAddress
      defaultBillingAddress
    }
    customFields {
      wilaya
      city
    }
  }
`;
export const DiscountFieldsFragmentDoc = gql`
  fragment DiscountFields on Discount {
    adjustmentSource
    amount
    amountWithTax
    description
    type
  }
`;
export const OrderLineFieldsFragmentDoc = gql`
  fragment OrderLineFields on OrderLine {
    id
    quantity
    linePriceWithTax
    unitPriceWithTax
    productVariant {
      id
      name
      sku
      priceWithTax
      product {
        id
        name
        slug
        featuredAsset {
          id
          preview
        }
      }
    }
    featuredAsset {
      id
      preview
    }
  }
`;
export const OrderFieldsFragmentDoc = gql`
  fragment OrderFields on Order {
    id
    code
    state
    active
    createdAt
    updatedAt
    totalQuantity
    subTotalWithTax
    shippingWithTax
    totalWithTax
    currencyCode
    couponCodes
    discounts {
      ...DiscountFields
    }
    lines {
      ...OrderLineFields
    }
    shippingAddress {
      fullName
      streetLine1
      streetLine2
      city
      province
      postalCode
      country
      phoneNumber
    }
    billingAddress {
      fullName
      streetLine1
      streetLine2
      city
      province
      postalCode
      country
      phoneNumber
    }
    customer {
      id
      firstName
      lastName
      emailAddress
    }
    payments {
      id
      method
      amount
      state
      transactionId
      createdAt
      metadata
    }
    fulfillments {
      id
      state
      method
      trackingCode
      createdAt
      lines {
        orderLineId
        quantity
      }
    }
  }
  ${DiscountFieldsFragmentDoc}
  ${OrderLineFieldsFragmentDoc}
`;
export const CustomerOrderFieldsFragmentDoc = gql`
  fragment CustomerOrderFields on Order {
    id
    code
    state
    active
    createdAt
    updatedAt
    totalQuantity
    subTotalWithTax
    shippingWithTax
    totalWithTax
    currencyCode
    lines {
      id
      quantity
      linePriceWithTax
      unitPriceWithTax
      productVariant {
        id
        name
        sku
        product {
          id
          name
          slug
          featuredAsset {
            id
            preview
          }
        }
      }
      featuredAsset {
        id
        preview
      }
    }
    shippingAddress {
      fullName
      streetLine1
      streetLine2
      city
      province
      postalCode
      country
      phoneNumber
    }
    billingAddress {
      fullName
      streetLine1
      streetLine2
      city
      province
      postalCode
      country
      phoneNumber
    }
    shippingLines {
      shippingMethod {
        id
        name
        description
      }
      priceWithTax
    }
    payments {
      id
      method
      amount
      state
      transactionId
      createdAt
      metadata
    }
    fulfillments {
      id
      state
      method
      trackingCode
      createdAt
      lines {
        orderLineId
        quantity
      }
    }
  }
`;
export const AssetFieldsFragmentDoc = gql`
  fragment AssetFields on Asset {
    id
    preview
    source
    width
    height
    name
  }
`;
export const ProductVariantFieldsFragmentDoc = gql`
  fragment ProductVariantFields on ProductVariant {
    id
    name
    sku
    priceWithTax
    currencyCode
    stockLevel
    featuredAsset {
      ...AssetFields
    }
    options {
      id
      code
      name
      group {
        id
        code
        name
      }
    }
  }
  ${AssetFieldsFragmentDoc}
`;
export const ProductFieldsFragmentDoc = gql`
  fragment ProductFields on Product {
    id
    name
    slug
    description
    featuredAsset {
      ...AssetFields
    }
    assets {
      ...AssetFields
    }
    variants {
      ...ProductVariantFields
    }
    collections {
      id
      name
      slug
    }
    facetValues {
      id
      name
      code
      facet {
        id
        name
        code
      }
    }
  }
  ${AssetFieldsFragmentDoc}
  ${ProductVariantFieldsFragmentDoc}
`;
export const CollectionFieldsFragmentDoc = gql`
  fragment CollectionFields on Collection {
    id
    name
    slug
    description
    featuredAsset {
      ...AssetFields
    }
    parent {
      id
      name
      slug
    }
    children {
      id
      name
      slug
    }
    breadcrumbs {
      id
      name
      slug
    }
  }
  ${AssetFieldsFragmentDoc}
`;
export const ActiveCustomerDocument = gql`
  query ActiveCustomer {
    activeCustomer {
      ...CustomerFields
    }
  }
  ${CustomerFieldsFragmentDoc}
`;

/**
 * __useActiveCustomerQuery__
 *
 * To run a query within a React component, call `useActiveCustomerQuery` and pass it any options that fit your needs.
 * When your component renders, `useActiveCustomerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActiveCustomerQuery({
 *   variables: {
 *   },
 * });
 */
export function useActiveCustomerQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ActiveCustomerQuery,
    ActiveCustomerQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ActiveCustomerQuery, ActiveCustomerQueryVariables>(
    ActiveCustomerDocument,
    options,
  );
}
export function useActiveCustomerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ActiveCustomerQuery,
    ActiveCustomerQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ActiveCustomerQuery, ActiveCustomerQueryVariables>(
    ActiveCustomerDocument,
    options,
  );
}
// @ts-ignore
export function useActiveCustomerSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    ActiveCustomerQuery,
    ActiveCustomerQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  ActiveCustomerQuery,
  ActiveCustomerQueryVariables
>;
export function useActiveCustomerSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ActiveCustomerQuery,
        ActiveCustomerQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  ActiveCustomerQuery | undefined,
  ActiveCustomerQueryVariables
>;
export function useActiveCustomerSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ActiveCustomerQuery,
        ActiveCustomerQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    ActiveCustomerQuery,
    ActiveCustomerQueryVariables
  >(ActiveCustomerDocument, options);
}
export type ActiveCustomerQueryHookResult = ReturnType<
  typeof useActiveCustomerQuery
>;
export type ActiveCustomerLazyQueryHookResult = ReturnType<
  typeof useActiveCustomerLazyQuery
>;
export type ActiveCustomerSuspenseQueryHookResult = ReturnType<
  typeof useActiveCustomerSuspenseQuery
>;
export type ActiveCustomerQueryResult = Apollo.QueryResult<
  ActiveCustomerQuery,
  ActiveCustomerQueryVariables
>;
export const ShopLoginDocument = gql`
  mutation ShopLogin(
    $username: String!
    $password: String!
    $rememberMe: Boolean
  ) {
    login(username: $username, password: $password, rememberMe: $rememberMe) {
      ... on CurrentUser {
        ...CurrentUserFields
      }
      ... on InvalidCredentialsError {
        errorCode
        message
      }
      ... on NotVerifiedError {
        errorCode
        message
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
  ${CurrentUserFieldsFragmentDoc}
`;
export type ShopLoginMutationFn = Apollo.MutationFunction<
  ShopLoginMutation,
  ShopLoginMutationVariables
>;

/**
 * __useShopLoginMutation__
 *
 * To run a mutation, you first call `useShopLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useShopLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [shopLoginMutation, { data, loading, error }] = useShopLoginMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *      rememberMe: // value for 'rememberMe'
 *   },
 * });
 */
export function useShopLoginMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ShopLoginMutation,
    ShopLoginMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ShopLoginMutation, ShopLoginMutationVariables>(
    ShopLoginDocument,
    options,
  );
}
export type ShopLoginMutationHookResult = ReturnType<
  typeof useShopLoginMutation
>;
export type ShopLoginMutationResult = Apollo.MutationResult<ShopLoginMutation>;
export type ShopLoginMutationOptions = Apollo.BaseMutationOptions<
  ShopLoginMutation,
  ShopLoginMutationVariables
>;
export const ShopLogoutDocument = gql`
  mutation ShopLogout {
    logout {
      success
    }
  }
`;
export type ShopLogoutMutationFn = Apollo.MutationFunction<
  ShopLogoutMutation,
  ShopLogoutMutationVariables
>;

/**
 * __useShopLogoutMutation__
 *
 * To run a mutation, you first call `useShopLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useShopLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [shopLogoutMutation, { data, loading, error }] = useShopLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useShopLogoutMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ShopLogoutMutation,
    ShopLogoutMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ShopLogoutMutation, ShopLogoutMutationVariables>(
    ShopLogoutDocument,
    options,
  );
}
export type ShopLogoutMutationHookResult = ReturnType<
  typeof useShopLogoutMutation
>;
export type ShopLogoutMutationResult =
  Apollo.MutationResult<ShopLogoutMutation>;
export type ShopLogoutMutationOptions = Apollo.BaseMutationOptions<
  ShopLogoutMutation,
  ShopLogoutMutationVariables
>;
export const ShopRegisterDocument = gql`
  mutation ShopRegister($input: RegisterCustomerInput!) {
    registerCustomerAccount(input: $input) {
      ... on Success {
        success
      }
      ... on MissingPasswordError {
        errorCode
        message
      }
      ... on PasswordValidationError {
        errorCode
        message
        validationErrorMessage
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
`;
export type ShopRegisterMutationFn = Apollo.MutationFunction<
  ShopRegisterMutation,
  ShopRegisterMutationVariables
>;

/**
 * __useShopRegisterMutation__
 *
 * To run a mutation, you first call `useShopRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useShopRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [shopRegisterMutation, { data, loading, error }] = useShopRegisterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useShopRegisterMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ShopRegisterMutation,
    ShopRegisterMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ShopRegisterMutation,
    ShopRegisterMutationVariables
  >(ShopRegisterDocument, options);
}
export type ShopRegisterMutationHookResult = ReturnType<
  typeof useShopRegisterMutation
>;
export type ShopRegisterMutationResult =
  Apollo.MutationResult<ShopRegisterMutation>;
export type ShopRegisterMutationOptions = Apollo.BaseMutationOptions<
  ShopRegisterMutation,
  ShopRegisterMutationVariables
>;
export const VerifyCustomerAccountDocument = gql`
  mutation VerifyCustomerAccount($token: String!, $password: String) {
    verifyCustomerAccount(token: $token, password: $password) {
      ... on CurrentUser {
        ...CurrentUserFields
      }
      ... on VerificationTokenInvalidError {
        errorCode
        message
      }
      ... on VerificationTokenExpiredError {
        errorCode
        message
      }
      ... on MissingPasswordError {
        errorCode
        message
      }
      ... on PasswordValidationError {
        errorCode
        message
        validationErrorMessage
      }
      ... on PasswordAlreadySetError {
        errorCode
        message
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
  ${CurrentUserFieldsFragmentDoc}
`;
export type VerifyCustomerAccountMutationFn = Apollo.MutationFunction<
  VerifyCustomerAccountMutation,
  VerifyCustomerAccountMutationVariables
>;

/**
 * __useVerifyCustomerAccountMutation__
 *
 * To run a mutation, you first call `useVerifyCustomerAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyCustomerAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyCustomerAccountMutation, { data, loading, error }] = useVerifyCustomerAccountMutation({
 *   variables: {
 *      token: // value for 'token'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useVerifyCustomerAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    VerifyCustomerAccountMutation,
    VerifyCustomerAccountMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    VerifyCustomerAccountMutation,
    VerifyCustomerAccountMutationVariables
  >(VerifyCustomerAccountDocument, options);
}
export type VerifyCustomerAccountMutationHookResult = ReturnType<
  typeof useVerifyCustomerAccountMutation
>;
export type VerifyCustomerAccountMutationResult =
  Apollo.MutationResult<VerifyCustomerAccountMutation>;
export type VerifyCustomerAccountMutationOptions = Apollo.BaseMutationOptions<
  VerifyCustomerAccountMutation,
  VerifyCustomerAccountMutationVariables
>;
export const RefreshVerificationDocument = gql`
  mutation RefreshVerification($emailAddress: String!) {
    refreshCustomerVerification(emailAddress: $emailAddress) {
      ... on Success {
        success
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
`;
export type RefreshVerificationMutationFn = Apollo.MutationFunction<
  RefreshVerificationMutation,
  RefreshVerificationMutationVariables
>;

/**
 * __useRefreshVerificationMutation__
 *
 * To run a mutation, you first call `useRefreshVerificationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshVerificationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshVerificationMutation, { data, loading, error }] = useRefreshVerificationMutation({
 *   variables: {
 *      emailAddress: // value for 'emailAddress'
 *   },
 * });
 */
export function useRefreshVerificationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RefreshVerificationMutation,
    RefreshVerificationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RefreshVerificationMutation,
    RefreshVerificationMutationVariables
  >(RefreshVerificationDocument, options);
}
export type RefreshVerificationMutationHookResult = ReturnType<
  typeof useRefreshVerificationMutation
>;
export type RefreshVerificationMutationResult =
  Apollo.MutationResult<RefreshVerificationMutation>;
export type RefreshVerificationMutationOptions = Apollo.BaseMutationOptions<
  RefreshVerificationMutation,
  RefreshVerificationMutationVariables
>;
export const RequestPasswordResetDocument = gql`
  mutation RequestPasswordReset($emailAddress: String!) {
    requestPasswordReset(emailAddress: $emailAddress) {
      ... on Success {
        success
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
`;
export type RequestPasswordResetMutationFn = Apollo.MutationFunction<
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables
>;

/**
 * __useRequestPasswordResetMutation__
 *
 * To run a mutation, you first call `useRequestPasswordResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestPasswordResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestPasswordResetMutation, { data, loading, error }] = useRequestPasswordResetMutation({
 *   variables: {
 *      emailAddress: // value for 'emailAddress'
 *   },
 * });
 */
export function useRequestPasswordResetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RequestPasswordResetMutation,
    RequestPasswordResetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RequestPasswordResetMutation,
    RequestPasswordResetMutationVariables
  >(RequestPasswordResetDocument, options);
}
export type RequestPasswordResetMutationHookResult = ReturnType<
  typeof useRequestPasswordResetMutation
>;
export type RequestPasswordResetMutationResult =
  Apollo.MutationResult<RequestPasswordResetMutation>;
export type RequestPasswordResetMutationOptions = Apollo.BaseMutationOptions<
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables
>;
export const ResetPasswordDocument = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      ... on CurrentUser {
        ...CurrentUserFields
      }
      ... on PasswordResetTokenInvalidError {
        errorCode
        message
      }
      ... on PasswordResetTokenExpiredError {
        errorCode
        message
      }
      ... on PasswordValidationError {
        errorCode
        message
        validationErrorMessage
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
      ... on NotVerifiedError {
        errorCode
        message
      }
    }
  }
  ${CurrentUserFieldsFragmentDoc}
`;
export type ResetPasswordMutationFn = Apollo.MutationFunction<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      token: // value for 'token'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useResetPasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ResetPasswordMutation,
    ResetPasswordMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ResetPasswordMutation,
    ResetPasswordMutationVariables
  >(ResetPasswordDocument, options);
}
export type ResetPasswordMutationHookResult = ReturnType<
  typeof useResetPasswordMutation
>;
export type ResetPasswordMutationResult =
  Apollo.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = Apollo.BaseMutationOptions<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;
export const UpdateCustomerProfileDocument = gql`
  mutation UpdateCustomerProfile($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      ...CustomerFields
    }
  }
  ${CustomerFieldsFragmentDoc}
`;
export type UpdateCustomerProfileMutationFn = Apollo.MutationFunction<
  UpdateCustomerProfileMutation,
  UpdateCustomerProfileMutationVariables
>;

/**
 * __useUpdateCustomerProfileMutation__
 *
 * To run a mutation, you first call `useUpdateCustomerProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCustomerProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCustomerProfileMutation, { data, loading, error }] = useUpdateCustomerProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCustomerProfileMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCustomerProfileMutation,
    UpdateCustomerProfileMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateCustomerProfileMutation,
    UpdateCustomerProfileMutationVariables
  >(UpdateCustomerProfileDocument, options);
}
export type UpdateCustomerProfileMutationHookResult = ReturnType<
  typeof useUpdateCustomerProfileMutation
>;
export type UpdateCustomerProfileMutationResult =
  Apollo.MutationResult<UpdateCustomerProfileMutation>;
export type UpdateCustomerProfileMutationOptions = Apollo.BaseMutationOptions<
  UpdateCustomerProfileMutation,
  UpdateCustomerProfileMutationVariables
>;
export const UpdateCustomerPasswordDocument = gql`
  mutation UpdateCustomerPassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    updateCustomerPassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      ... on Success {
        success
      }
      ... on InvalidCredentialsError {
        errorCode
        message
      }
      ... on PasswordValidationError {
        errorCode
        message
        validationErrorMessage
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
`;
export type UpdateCustomerPasswordMutationFn = Apollo.MutationFunction<
  UpdateCustomerPasswordMutation,
  UpdateCustomerPasswordMutationVariables
>;

/**
 * __useUpdateCustomerPasswordMutation__
 *
 * To run a mutation, you first call `useUpdateCustomerPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCustomerPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCustomerPasswordMutation, { data, loading, error }] = useUpdateCustomerPasswordMutation({
 *   variables: {
 *      currentPassword: // value for 'currentPassword'
 *      newPassword: // value for 'newPassword'
 *   },
 * });
 */
export function useUpdateCustomerPasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCustomerPasswordMutation,
    UpdateCustomerPasswordMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateCustomerPasswordMutation,
    UpdateCustomerPasswordMutationVariables
  >(UpdateCustomerPasswordDocument, options);
}
export type UpdateCustomerPasswordMutationHookResult = ReturnType<
  typeof useUpdateCustomerPasswordMutation
>;
export type UpdateCustomerPasswordMutationResult =
  Apollo.MutationResult<UpdateCustomerPasswordMutation>;
export type UpdateCustomerPasswordMutationOptions = Apollo.BaseMutationOptions<
  UpdateCustomerPasswordMutation,
  UpdateCustomerPasswordMutationVariables
>;
export const CreateCustomerAddressDocument = gql`
  mutation CreateCustomerAddress($input: CreateAddressInput!) {
    createCustomerAddress(input: $input) {
      id
      fullName
      company
      streetLine1
      streetLine2
      city
      province
      postalCode
      country {
        code
        name
      }
      phoneNumber
      defaultShippingAddress
      defaultBillingAddress
    }
  }
`;
export type CreateCustomerAddressMutationFn = Apollo.MutationFunction<
  CreateCustomerAddressMutation,
  CreateCustomerAddressMutationVariables
>;

/**
 * __useCreateCustomerAddressMutation__
 *
 * To run a mutation, you first call `useCreateCustomerAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCustomerAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCustomerAddressMutation, { data, loading, error }] = useCreateCustomerAddressMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCustomerAddressMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateCustomerAddressMutation,
    CreateCustomerAddressMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateCustomerAddressMutation,
    CreateCustomerAddressMutationVariables
  >(CreateCustomerAddressDocument, options);
}
export type CreateCustomerAddressMutationHookResult = ReturnType<
  typeof useCreateCustomerAddressMutation
>;
export type CreateCustomerAddressMutationResult =
  Apollo.MutationResult<CreateCustomerAddressMutation>;
export type CreateCustomerAddressMutationOptions = Apollo.BaseMutationOptions<
  CreateCustomerAddressMutation,
  CreateCustomerAddressMutationVariables
>;
export const UpdateCustomerAddressDocument = gql`
  mutation UpdateCustomerAddress($input: UpdateAddressInput!) {
    updateCustomerAddress(input: $input) {
      id
      fullName
      company
      streetLine1
      streetLine2
      city
      province
      postalCode
      country {
        code
        name
      }
      phoneNumber
      defaultShippingAddress
      defaultBillingAddress
    }
  }
`;
export type UpdateCustomerAddressMutationFn = Apollo.MutationFunction<
  UpdateCustomerAddressMutation,
  UpdateCustomerAddressMutationVariables
>;

/**
 * __useUpdateCustomerAddressMutation__
 *
 * To run a mutation, you first call `useUpdateCustomerAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCustomerAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCustomerAddressMutation, { data, loading, error }] = useUpdateCustomerAddressMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCustomerAddressMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCustomerAddressMutation,
    UpdateCustomerAddressMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateCustomerAddressMutation,
    UpdateCustomerAddressMutationVariables
  >(UpdateCustomerAddressDocument, options);
}
export type UpdateCustomerAddressMutationHookResult = ReturnType<
  typeof useUpdateCustomerAddressMutation
>;
export type UpdateCustomerAddressMutationResult =
  Apollo.MutationResult<UpdateCustomerAddressMutation>;
export type UpdateCustomerAddressMutationOptions = Apollo.BaseMutationOptions<
  UpdateCustomerAddressMutation,
  UpdateCustomerAddressMutationVariables
>;
export const DeleteCustomerAddressDocument = gql`
  mutation DeleteCustomerAddress($id: ID!) {
    deleteCustomerAddress(id: $id) {
      success
    }
  }
`;
export type DeleteCustomerAddressMutationFn = Apollo.MutationFunction<
  DeleteCustomerAddressMutation,
  DeleteCustomerAddressMutationVariables
>;

/**
 * __useDeleteCustomerAddressMutation__
 *
 * To run a mutation, you first call `useDeleteCustomerAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCustomerAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCustomerAddressMutation, { data, loading, error }] = useDeleteCustomerAddressMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCustomerAddressMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCustomerAddressMutation,
    DeleteCustomerAddressMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCustomerAddressMutation,
    DeleteCustomerAddressMutationVariables
  >(DeleteCustomerAddressDocument, options);
}
export type DeleteCustomerAddressMutationHookResult = ReturnType<
  typeof useDeleteCustomerAddressMutation
>;
export type DeleteCustomerAddressMutationResult =
  Apollo.MutationResult<DeleteCustomerAddressMutation>;
export type DeleteCustomerAddressMutationOptions = Apollo.BaseMutationOptions<
  DeleteCustomerAddressMutation,
  DeleteCustomerAddressMutationVariables
>;
export const GetActiveOrderDocument = gql`
  query GetActiveOrder {
    activeOrder {
      ...OrderFields
    }
  }
  ${OrderFieldsFragmentDoc}
`;

/**
 * __useGetActiveOrderQuery__
 *
 * To run a query within a React component, call `useGetActiveOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveOrderQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveOrderQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetActiveOrderQuery,
    GetActiveOrderQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetActiveOrderQuery, GetActiveOrderQueryVariables>(
    GetActiveOrderDocument,
    options,
  );
}
export function useGetActiveOrderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActiveOrderQuery,
    GetActiveOrderQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetActiveOrderQuery, GetActiveOrderQueryVariables>(
    GetActiveOrderDocument,
    options,
  );
}
// @ts-ignore
export function useGetActiveOrderSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActiveOrderQuery,
    GetActiveOrderQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetActiveOrderQuery,
  GetActiveOrderQueryVariables
>;
export function useGetActiveOrderSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActiveOrderQuery,
        GetActiveOrderQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetActiveOrderQuery | undefined,
  GetActiveOrderQueryVariables
>;
export function useGetActiveOrderSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActiveOrderQuery,
        GetActiveOrderQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActiveOrderQuery,
    GetActiveOrderQueryVariables
  >(GetActiveOrderDocument, options);
}
export type GetActiveOrderQueryHookResult = ReturnType<
  typeof useGetActiveOrderQuery
>;
export type GetActiveOrderLazyQueryHookResult = ReturnType<
  typeof useGetActiveOrderLazyQuery
>;
export type GetActiveOrderSuspenseQueryHookResult = ReturnType<
  typeof useGetActiveOrderSuspenseQuery
>;
export type GetActiveOrderQueryResult = Apollo.QueryResult<
  GetActiveOrderQuery,
  GetActiveOrderQueryVariables
>;
export const AddItemToOrderDocument = gql`
  mutation AddItemToOrder($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      ... on Order {
        ...OrderFields
      }
      ... on OrderModificationError {
        errorCode
        message
      }
      ... on OrderLimitError {
        errorCode
        message
        maxItems
      }
      ... on NegativeQuantityError {
        errorCode
        message
      }
      ... on InsufficientStockError {
        errorCode
        message
        quantityAvailable
        order {
          ...OrderFields
        }
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type AddItemToOrderMutationFn = Apollo.MutationFunction<
  AddItemToOrderMutation,
  AddItemToOrderMutationVariables
>;

/**
 * __useAddItemToOrderMutation__
 *
 * To run a mutation, you first call `useAddItemToOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddItemToOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addItemToOrderMutation, { data, loading, error }] = useAddItemToOrderMutation({
 *   variables: {
 *      productVariantId: // value for 'productVariantId'
 *      quantity: // value for 'quantity'
 *   },
 * });
 */
export function useAddItemToOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddItemToOrderMutation,
    AddItemToOrderMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddItemToOrderMutation,
    AddItemToOrderMutationVariables
  >(AddItemToOrderDocument, options);
}
export type AddItemToOrderMutationHookResult = ReturnType<
  typeof useAddItemToOrderMutation
>;
export type AddItemToOrderMutationResult =
  Apollo.MutationResult<AddItemToOrderMutation>;
export type AddItemToOrderMutationOptions = Apollo.BaseMutationOptions<
  AddItemToOrderMutation,
  AddItemToOrderMutationVariables
>;
export const AdjustOrderLineDocument = gql`
  mutation AdjustOrderLine($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      ... on Order {
        ...OrderFields
      }
      ... on OrderModificationError {
        errorCode
        message
      }
      ... on OrderLimitError {
        errorCode
        message
        maxItems
      }
      ... on NegativeQuantityError {
        errorCode
        message
      }
      ... on InsufficientStockError {
        errorCode
        message
        quantityAvailable
        order {
          ...OrderFields
        }
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type AdjustOrderLineMutationFn = Apollo.MutationFunction<
  AdjustOrderLineMutation,
  AdjustOrderLineMutationVariables
>;

/**
 * __useAdjustOrderLineMutation__
 *
 * To run a mutation, you first call `useAdjustOrderLineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAdjustOrderLineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [adjustOrderLineMutation, { data, loading, error }] = useAdjustOrderLineMutation({
 *   variables: {
 *      orderLineId: // value for 'orderLineId'
 *      quantity: // value for 'quantity'
 *   },
 * });
 */
export function useAdjustOrderLineMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AdjustOrderLineMutation,
    AdjustOrderLineMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AdjustOrderLineMutation,
    AdjustOrderLineMutationVariables
  >(AdjustOrderLineDocument, options);
}
export type AdjustOrderLineMutationHookResult = ReturnType<
  typeof useAdjustOrderLineMutation
>;
export type AdjustOrderLineMutationResult =
  Apollo.MutationResult<AdjustOrderLineMutation>;
export type AdjustOrderLineMutationOptions = Apollo.BaseMutationOptions<
  AdjustOrderLineMutation,
  AdjustOrderLineMutationVariables
>;
export const RemoveOrderLineDocument = gql`
  mutation RemoveOrderLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      ... on Order {
        ...OrderFields
      }
      ... on OrderModificationError {
        errorCode
        message
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type RemoveOrderLineMutationFn = Apollo.MutationFunction<
  RemoveOrderLineMutation,
  RemoveOrderLineMutationVariables
>;

/**
 * __useRemoveOrderLineMutation__
 *
 * To run a mutation, you first call `useRemoveOrderLineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveOrderLineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeOrderLineMutation, { data, loading, error }] = useRemoveOrderLineMutation({
 *   variables: {
 *      orderLineId: // value for 'orderLineId'
 *   },
 * });
 */
export function useRemoveOrderLineMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RemoveOrderLineMutation,
    RemoveOrderLineMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RemoveOrderLineMutation,
    RemoveOrderLineMutationVariables
  >(RemoveOrderLineDocument, options);
}
export type RemoveOrderLineMutationHookResult = ReturnType<
  typeof useRemoveOrderLineMutation
>;
export type RemoveOrderLineMutationResult =
  Apollo.MutationResult<RemoveOrderLineMutation>;
export type RemoveOrderLineMutationOptions = Apollo.BaseMutationOptions<
  RemoveOrderLineMutation,
  RemoveOrderLineMutationVariables
>;
export const RemoveAllOrderLinesDocument = gql`
  mutation RemoveAllOrderLines {
    removeAllOrderLines {
      ... on Order {
        ...OrderFields
      }
      ... on OrderModificationError {
        errorCode
        message
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type RemoveAllOrderLinesMutationFn = Apollo.MutationFunction<
  RemoveAllOrderLinesMutation,
  RemoveAllOrderLinesMutationVariables
>;

/**
 * __useRemoveAllOrderLinesMutation__
 *
 * To run a mutation, you first call `useRemoveAllOrderLinesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveAllOrderLinesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeAllOrderLinesMutation, { data, loading, error }] = useRemoveAllOrderLinesMutation({
 *   variables: {
 *   },
 * });
 */
export function useRemoveAllOrderLinesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RemoveAllOrderLinesMutation,
    RemoveAllOrderLinesMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RemoveAllOrderLinesMutation,
    RemoveAllOrderLinesMutationVariables
  >(RemoveAllOrderLinesDocument, options);
}
export type RemoveAllOrderLinesMutationHookResult = ReturnType<
  typeof useRemoveAllOrderLinesMutation
>;
export type RemoveAllOrderLinesMutationResult =
  Apollo.MutationResult<RemoveAllOrderLinesMutation>;
export type RemoveAllOrderLinesMutationOptions = Apollo.BaseMutationOptions<
  RemoveAllOrderLinesMutation,
  RemoveAllOrderLinesMutationVariables
>;
export const SetCustomerForOrderDocument = gql`
  mutation SetCustomerForOrder($input: CreateCustomerInput!) {
    setCustomerForOrder(input: $input) {
      ... on Order {
        ...OrderFields
      }
      ... on AlreadyLoggedInError {
        errorCode
        message
      }
      ... on EmailAddressConflictError {
        errorCode
        message
      }
      ... on GuestCheckoutError {
        errorCode
        message
      }
      ... on NoActiveOrderError {
        errorCode
        message
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type SetCustomerForOrderMutationFn = Apollo.MutationFunction<
  SetCustomerForOrderMutation,
  SetCustomerForOrderMutationVariables
>;

/**
 * __useSetCustomerForOrderMutation__
 *
 * To run a mutation, you first call `useSetCustomerForOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetCustomerForOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setCustomerForOrderMutation, { data, loading, error }] = useSetCustomerForOrderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSetCustomerForOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetCustomerForOrderMutation,
    SetCustomerForOrderMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetCustomerForOrderMutation,
    SetCustomerForOrderMutationVariables
  >(SetCustomerForOrderDocument, options);
}
export type SetCustomerForOrderMutationHookResult = ReturnType<
  typeof useSetCustomerForOrderMutation
>;
export type SetCustomerForOrderMutationResult =
  Apollo.MutationResult<SetCustomerForOrderMutation>;
export type SetCustomerForOrderMutationOptions = Apollo.BaseMutationOptions<
  SetCustomerForOrderMutation,
  SetCustomerForOrderMutationVariables
>;
export const SetOrderShippingAddressDocument = gql`
  mutation SetOrderShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ... on Order {
        ...OrderFields
      }
      ... on NoActiveOrderError {
        errorCode
        message
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type SetOrderShippingAddressMutationFn = Apollo.MutationFunction<
  SetOrderShippingAddressMutation,
  SetOrderShippingAddressMutationVariables
>;

/**
 * __useSetOrderShippingAddressMutation__
 *
 * To run a mutation, you first call `useSetOrderShippingAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetOrderShippingAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setOrderShippingAddressMutation, { data, loading, error }] = useSetOrderShippingAddressMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSetOrderShippingAddressMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetOrderShippingAddressMutation,
    SetOrderShippingAddressMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetOrderShippingAddressMutation,
    SetOrderShippingAddressMutationVariables
  >(SetOrderShippingAddressDocument, options);
}
export type SetOrderShippingAddressMutationHookResult = ReturnType<
  typeof useSetOrderShippingAddressMutation
>;
export type SetOrderShippingAddressMutationResult =
  Apollo.MutationResult<SetOrderShippingAddressMutation>;
export type SetOrderShippingAddressMutationOptions = Apollo.BaseMutationOptions<
  SetOrderShippingAddressMutation,
  SetOrderShippingAddressMutationVariables
>;
export const SetOrderBillingAddressDocument = gql`
  mutation SetOrderBillingAddress($input: CreateAddressInput!) {
    setOrderBillingAddress(input: $input) {
      ... on Order {
        ...OrderFields
      }
      ... on NoActiveOrderError {
        errorCode
        message
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type SetOrderBillingAddressMutationFn = Apollo.MutationFunction<
  SetOrderBillingAddressMutation,
  SetOrderBillingAddressMutationVariables
>;

/**
 * __useSetOrderBillingAddressMutation__
 *
 * To run a mutation, you first call `useSetOrderBillingAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetOrderBillingAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setOrderBillingAddressMutation, { data, loading, error }] = useSetOrderBillingAddressMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSetOrderBillingAddressMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetOrderBillingAddressMutation,
    SetOrderBillingAddressMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetOrderBillingAddressMutation,
    SetOrderBillingAddressMutationVariables
  >(SetOrderBillingAddressDocument, options);
}
export type SetOrderBillingAddressMutationHookResult = ReturnType<
  typeof useSetOrderBillingAddressMutation
>;
export type SetOrderBillingAddressMutationResult =
  Apollo.MutationResult<SetOrderBillingAddressMutation>;
export type SetOrderBillingAddressMutationOptions = Apollo.BaseMutationOptions<
  SetOrderBillingAddressMutation,
  SetOrderBillingAddressMutationVariables
>;
export const GetEligibleShippingMethodsDocument = gql`
  query GetEligibleShippingMethods {
    eligibleShippingMethods {
      id
      name
      description
      price
      priceWithTax
      metadata
    }
  }
`;

/**
 * __useGetEligibleShippingMethodsQuery__
 *
 * To run a query within a React component, call `useGetEligibleShippingMethodsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEligibleShippingMethodsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEligibleShippingMethodsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetEligibleShippingMethodsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetEligibleShippingMethodsQuery,
    GetEligibleShippingMethodsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetEligibleShippingMethodsQuery,
    GetEligibleShippingMethodsQueryVariables
  >(GetEligibleShippingMethodsDocument, options);
}
export function useGetEligibleShippingMethodsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEligibleShippingMethodsQuery,
    GetEligibleShippingMethodsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetEligibleShippingMethodsQuery,
    GetEligibleShippingMethodsQueryVariables
  >(GetEligibleShippingMethodsDocument, options);
}
// @ts-ignore
export function useGetEligibleShippingMethodsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetEligibleShippingMethodsQuery,
    GetEligibleShippingMethodsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetEligibleShippingMethodsQuery,
  GetEligibleShippingMethodsQueryVariables
>;
export function useGetEligibleShippingMethodsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEligibleShippingMethodsQuery,
        GetEligibleShippingMethodsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetEligibleShippingMethodsQuery | undefined,
  GetEligibleShippingMethodsQueryVariables
>;
export function useGetEligibleShippingMethodsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEligibleShippingMethodsQuery,
        GetEligibleShippingMethodsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetEligibleShippingMethodsQuery,
    GetEligibleShippingMethodsQueryVariables
  >(GetEligibleShippingMethodsDocument, options);
}
export type GetEligibleShippingMethodsQueryHookResult = ReturnType<
  typeof useGetEligibleShippingMethodsQuery
>;
export type GetEligibleShippingMethodsLazyQueryHookResult = ReturnType<
  typeof useGetEligibleShippingMethodsLazyQuery
>;
export type GetEligibleShippingMethodsSuspenseQueryHookResult = ReturnType<
  typeof useGetEligibleShippingMethodsSuspenseQuery
>;
export type GetEligibleShippingMethodsQueryResult = Apollo.QueryResult<
  GetEligibleShippingMethodsQuery,
  GetEligibleShippingMethodsQueryVariables
>;
export const SetOrderShippingMethodDocument = gql`
  mutation SetOrderShippingMethod($shippingMethodId: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      ... on Order {
        ...OrderFields
        shippingLines {
          shippingMethod {
            id
            name
          }
          priceWithTax
        }
      }
      ... on OrderModificationError {
        errorCode
        message
      }
      ... on IneligibleShippingMethodError {
        errorCode
        message
      }
      ... on NoActiveOrderError {
        errorCode
        message
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type SetOrderShippingMethodMutationFn = Apollo.MutationFunction<
  SetOrderShippingMethodMutation,
  SetOrderShippingMethodMutationVariables
>;

/**
 * __useSetOrderShippingMethodMutation__
 *
 * To run a mutation, you first call `useSetOrderShippingMethodMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetOrderShippingMethodMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setOrderShippingMethodMutation, { data, loading, error }] = useSetOrderShippingMethodMutation({
 *   variables: {
 *      shippingMethodId: // value for 'shippingMethodId'
 *   },
 * });
 */
export function useSetOrderShippingMethodMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetOrderShippingMethodMutation,
    SetOrderShippingMethodMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetOrderShippingMethodMutation,
    SetOrderShippingMethodMutationVariables
  >(SetOrderShippingMethodDocument, options);
}
export type SetOrderShippingMethodMutationHookResult = ReturnType<
  typeof useSetOrderShippingMethodMutation
>;
export type SetOrderShippingMethodMutationResult =
  Apollo.MutationResult<SetOrderShippingMethodMutation>;
export type SetOrderShippingMethodMutationOptions = Apollo.BaseMutationOptions<
  SetOrderShippingMethodMutation,
  SetOrderShippingMethodMutationVariables
>;
export const GetEligiblePaymentMethodsDocument = gql`
  query GetEligiblePaymentMethods {
    eligiblePaymentMethods {
      id
      name
      code
      description
      isEligible
      eligibilityMessage
    }
  }
`;

/**
 * __useGetEligiblePaymentMethodsQuery__
 *
 * To run a query within a React component, call `useGetEligiblePaymentMethodsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEligiblePaymentMethodsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEligiblePaymentMethodsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetEligiblePaymentMethodsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetEligiblePaymentMethodsQuery,
    GetEligiblePaymentMethodsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetEligiblePaymentMethodsQuery,
    GetEligiblePaymentMethodsQueryVariables
  >(GetEligiblePaymentMethodsDocument, options);
}
export function useGetEligiblePaymentMethodsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEligiblePaymentMethodsQuery,
    GetEligiblePaymentMethodsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetEligiblePaymentMethodsQuery,
    GetEligiblePaymentMethodsQueryVariables
  >(GetEligiblePaymentMethodsDocument, options);
}
// @ts-ignore
export function useGetEligiblePaymentMethodsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetEligiblePaymentMethodsQuery,
    GetEligiblePaymentMethodsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetEligiblePaymentMethodsQuery,
  GetEligiblePaymentMethodsQueryVariables
>;
export function useGetEligiblePaymentMethodsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEligiblePaymentMethodsQuery,
        GetEligiblePaymentMethodsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetEligiblePaymentMethodsQuery | undefined,
  GetEligiblePaymentMethodsQueryVariables
>;
export function useGetEligiblePaymentMethodsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEligiblePaymentMethodsQuery,
        GetEligiblePaymentMethodsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetEligiblePaymentMethodsQuery,
    GetEligiblePaymentMethodsQueryVariables
  >(GetEligiblePaymentMethodsDocument, options);
}
export type GetEligiblePaymentMethodsQueryHookResult = ReturnType<
  typeof useGetEligiblePaymentMethodsQuery
>;
export type GetEligiblePaymentMethodsLazyQueryHookResult = ReturnType<
  typeof useGetEligiblePaymentMethodsLazyQuery
>;
export type GetEligiblePaymentMethodsSuspenseQueryHookResult = ReturnType<
  typeof useGetEligiblePaymentMethodsSuspenseQuery
>;
export type GetEligiblePaymentMethodsQueryResult = Apollo.QueryResult<
  GetEligiblePaymentMethodsQuery,
  GetEligiblePaymentMethodsQueryVariables
>;
export const TransitionOrderToStateDocument = gql`
  mutation TransitionOrderToState($state: String!) {
    transitionOrderToState(state: $state) {
      ... on Order {
        ...OrderFields
      }
      ... on OrderStateTransitionError {
        errorCode
        message
        transitionError
        fromState
        toState
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type TransitionOrderToStateMutationFn = Apollo.MutationFunction<
  TransitionOrderToStateMutation,
  TransitionOrderToStateMutationVariables
>;

/**
 * __useTransitionOrderToStateMutation__
 *
 * To run a mutation, you first call `useTransitionOrderToStateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTransitionOrderToStateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [transitionOrderToStateMutation, { data, loading, error }] = useTransitionOrderToStateMutation({
 *   variables: {
 *      state: // value for 'state'
 *   },
 * });
 */
export function useTransitionOrderToStateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    TransitionOrderToStateMutation,
    TransitionOrderToStateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    TransitionOrderToStateMutation,
    TransitionOrderToStateMutationVariables
  >(TransitionOrderToStateDocument, options);
}
export type TransitionOrderToStateMutationHookResult = ReturnType<
  typeof useTransitionOrderToStateMutation
>;
export type TransitionOrderToStateMutationResult =
  Apollo.MutationResult<TransitionOrderToStateMutation>;
export type TransitionOrderToStateMutationOptions = Apollo.BaseMutationOptions<
  TransitionOrderToStateMutation,
  TransitionOrderToStateMutationVariables
>;
export const AddPaymentToOrderDocument = gql`
  mutation AddPaymentToOrder($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ... on Order {
        ...OrderFields
      }
      ... on OrderPaymentStateError {
        errorCode
        message
      }
      ... on IneligiblePaymentMethodError {
        errorCode
        message
      }
      ... on PaymentFailedError {
        errorCode
        message
        paymentErrorMessage
      }
      ... on PaymentDeclinedError {
        errorCode
        message
        paymentErrorMessage
      }
      ... on OrderStateTransitionError {
        errorCode
        message
        transitionError
        fromState
        toState
      }
      ... on NoActiveOrderError {
        errorCode
        message
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type AddPaymentToOrderMutationFn = Apollo.MutationFunction<
  AddPaymentToOrderMutation,
  AddPaymentToOrderMutationVariables
>;

/**
 * __useAddPaymentToOrderMutation__
 *
 * To run a mutation, you first call `useAddPaymentToOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPaymentToOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPaymentToOrderMutation, { data, loading, error }] = useAddPaymentToOrderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddPaymentToOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddPaymentToOrderMutation,
    AddPaymentToOrderMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddPaymentToOrderMutation,
    AddPaymentToOrderMutationVariables
  >(AddPaymentToOrderDocument, options);
}
export type AddPaymentToOrderMutationHookResult = ReturnType<
  typeof useAddPaymentToOrderMutation
>;
export type AddPaymentToOrderMutationResult =
  Apollo.MutationResult<AddPaymentToOrderMutation>;
export type AddPaymentToOrderMutationOptions = Apollo.BaseMutationOptions<
  AddPaymentToOrderMutation,
  AddPaymentToOrderMutationVariables
>;
export const GetOrderByCodeDocument = gql`
  query GetOrderByCode($code: String!) {
    orderByCode(code: $code) {
      ...OrderFields
    }
  }
  ${OrderFieldsFragmentDoc}
`;

/**
 * __useGetOrderByCodeQuery__
 *
 * To run a query within a React component, call `useGetOrderByCodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrderByCodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrderByCodeQuery({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useGetOrderByCodeQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOrderByCodeQuery,
    GetOrderByCodeQueryVariables
  > &
    (
      | { variables: GetOrderByCodeQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetOrderByCodeQuery, GetOrderByCodeQueryVariables>(
    GetOrderByCodeDocument,
    options,
  );
}
export function useGetOrderByCodeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrderByCodeQuery,
    GetOrderByCodeQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetOrderByCodeQuery, GetOrderByCodeQueryVariables>(
    GetOrderByCodeDocument,
    options,
  );
}
// @ts-ignore
export function useGetOrderByCodeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrderByCodeQuery,
    GetOrderByCodeQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetOrderByCodeQuery,
  GetOrderByCodeQueryVariables
>;
export function useGetOrderByCodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrderByCodeQuery,
        GetOrderByCodeQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetOrderByCodeQuery | undefined,
  GetOrderByCodeQueryVariables
>;
export function useGetOrderByCodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrderByCodeQuery,
        GetOrderByCodeQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetOrderByCodeQuery,
    GetOrderByCodeQueryVariables
  >(GetOrderByCodeDocument, options);
}
export type GetOrderByCodeQueryHookResult = ReturnType<
  typeof useGetOrderByCodeQuery
>;
export type GetOrderByCodeLazyQueryHookResult = ReturnType<
  typeof useGetOrderByCodeLazyQuery
>;
export type GetOrderByCodeSuspenseQueryHookResult = ReturnType<
  typeof useGetOrderByCodeSuspenseQuery
>;
export type GetOrderByCodeQueryResult = Apollo.QueryResult<
  GetOrderByCodeQuery,
  GetOrderByCodeQueryVariables
>;
export const GetCustomerOrdersDocument = gql`
  query GetCustomerOrders($options: OrderListOptions) {
    activeCustomer {
      orders(options: $options) {
        items {
          id
          code
          state
          totalWithTax
          createdAt
          lines {
            id
            quantity
            productVariant {
              name
            }
            featuredAsset {
              preview
            }
          }
        }
        totalItems
      }
    }
  }
`;

/**
 * __useGetCustomerOrdersQuery__
 *
 * To run a query within a React component, call `useGetCustomerOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCustomerOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCustomerOrdersQuery({
 *   variables: {
 *      options: // value for 'options'
 *   },
 * });
 */
export function useGetCustomerOrdersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCustomerOrdersQuery,
    GetCustomerOrdersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCustomerOrdersQuery,
    GetCustomerOrdersQueryVariables
  >(GetCustomerOrdersDocument, options);
}
export function useGetCustomerOrdersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCustomerOrdersQuery,
    GetCustomerOrdersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCustomerOrdersQuery,
    GetCustomerOrdersQueryVariables
  >(GetCustomerOrdersDocument, options);
}
// @ts-ignore
export function useGetCustomerOrdersSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCustomerOrdersQuery,
    GetCustomerOrdersQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetCustomerOrdersQuery,
  GetCustomerOrdersQueryVariables
>;
export function useGetCustomerOrdersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCustomerOrdersQuery,
        GetCustomerOrdersQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetCustomerOrdersQuery | undefined,
  GetCustomerOrdersQueryVariables
>;
export function useGetCustomerOrdersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCustomerOrdersQuery,
        GetCustomerOrdersQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCustomerOrdersQuery,
    GetCustomerOrdersQueryVariables
  >(GetCustomerOrdersDocument, options);
}
export type GetCustomerOrdersQueryHookResult = ReturnType<
  typeof useGetCustomerOrdersQuery
>;
export type GetCustomerOrdersLazyQueryHookResult = ReturnType<
  typeof useGetCustomerOrdersLazyQuery
>;
export type GetCustomerOrdersSuspenseQueryHookResult = ReturnType<
  typeof useGetCustomerOrdersSuspenseQuery
>;
export type GetCustomerOrdersQueryResult = Apollo.QueryResult<
  GetCustomerOrdersQuery,
  GetCustomerOrdersQueryVariables
>;
export const ApplyCouponCodeDocument = gql`
  mutation ApplyCouponCode($couponCode: String!) {
    applyCouponCode(couponCode: $couponCode) {
      ... on Order {
        ...OrderFields
      }
      ... on CouponCodeExpiredError {
        errorCode
        message
        couponCode
      }
      ... on CouponCodeInvalidError {
        errorCode
        message
        couponCode
      }
      ... on CouponCodeLimitError {
        errorCode
        message
        couponCode
        limit
      }
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type ApplyCouponCodeMutationFn = Apollo.MutationFunction<
  ApplyCouponCodeMutation,
  ApplyCouponCodeMutationVariables
>;

/**
 * __useApplyCouponCodeMutation__
 *
 * To run a mutation, you first call `useApplyCouponCodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApplyCouponCodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [applyCouponCodeMutation, { data, loading, error }] = useApplyCouponCodeMutation({
 *   variables: {
 *      couponCode: // value for 'couponCode'
 *   },
 * });
 */
export function useApplyCouponCodeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ApplyCouponCodeMutation,
    ApplyCouponCodeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ApplyCouponCodeMutation,
    ApplyCouponCodeMutationVariables
  >(ApplyCouponCodeDocument, options);
}
export type ApplyCouponCodeMutationHookResult = ReturnType<
  typeof useApplyCouponCodeMutation
>;
export type ApplyCouponCodeMutationResult =
  Apollo.MutationResult<ApplyCouponCodeMutation>;
export type ApplyCouponCodeMutationOptions = Apollo.BaseMutationOptions<
  ApplyCouponCodeMutation,
  ApplyCouponCodeMutationVariables
>;
export const RemoveCouponCodeDocument = gql`
  mutation RemoveCouponCode($couponCode: String!) {
    removeCouponCode(couponCode: $couponCode) {
      ...OrderFields
    }
  }
  ${OrderFieldsFragmentDoc}
`;
export type RemoveCouponCodeMutationFn = Apollo.MutationFunction<
  RemoveCouponCodeMutation,
  RemoveCouponCodeMutationVariables
>;

/**
 * __useRemoveCouponCodeMutation__
 *
 * To run a mutation, you first call `useRemoveCouponCodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCouponCodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCouponCodeMutation, { data, loading, error }] = useRemoveCouponCodeMutation({
 *   variables: {
 *      couponCode: // value for 'couponCode'
 *   },
 * });
 */
export function useRemoveCouponCodeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RemoveCouponCodeMutation,
    RemoveCouponCodeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RemoveCouponCodeMutation,
    RemoveCouponCodeMutationVariables
  >(RemoveCouponCodeDocument, options);
}
export type RemoveCouponCodeMutationHookResult = ReturnType<
  typeof useRemoveCouponCodeMutation
>;
export type RemoveCouponCodeMutationResult =
  Apollo.MutationResult<RemoveCouponCodeMutation>;
export type RemoveCouponCodeMutationOptions = Apollo.BaseMutationOptions<
  RemoveCouponCodeMutation,
  RemoveCouponCodeMutationVariables
>;
export const GetMyOrdersDocument = gql`
  query GetMyOrders($options: OrderListOptions) {
    activeCustomer {
      orders(options: $options) {
        items {
          id
          code
          state
          createdAt
          totalWithTax
          currencyCode
          totalQuantity
          lines {
            id
            quantity
            productVariant {
              name
              product {
                name
                featuredAsset {
                  preview
                }
              }
            }
            featuredAsset {
              preview
            }
          }
        }
        totalItems
      }
    }
  }
`;

/**
 * __useGetMyOrdersQuery__
 *
 * To run a query within a React component, call `useGetMyOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMyOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMyOrdersQuery({
 *   variables: {
 *      options: // value for 'options'
 *   },
 * });
 */
export function useGetMyOrdersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetMyOrdersQuery,
    GetMyOrdersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetMyOrdersQuery, GetMyOrdersQueryVariables>(
    GetMyOrdersDocument,
    options,
  );
}
export function useGetMyOrdersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMyOrdersQuery,
    GetMyOrdersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetMyOrdersQuery, GetMyOrdersQueryVariables>(
    GetMyOrdersDocument,
    options,
  );
}
// @ts-ignore
export function useGetMyOrdersSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMyOrdersQuery,
    GetMyOrdersQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<GetMyOrdersQuery, GetMyOrdersQueryVariables>;
export function useGetMyOrdersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMyOrdersQuery,
        GetMyOrdersQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetMyOrdersQuery | undefined,
  GetMyOrdersQueryVariables
>;
export function useGetMyOrdersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMyOrdersQuery,
        GetMyOrdersQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetMyOrdersQuery, GetMyOrdersQueryVariables>(
    GetMyOrdersDocument,
    options,
  );
}
export type GetMyOrdersQueryHookResult = ReturnType<typeof useGetMyOrdersQuery>;
export type GetMyOrdersLazyQueryHookResult = ReturnType<
  typeof useGetMyOrdersLazyQuery
>;
export type GetMyOrdersSuspenseQueryHookResult = ReturnType<
  typeof useGetMyOrdersSuspenseQuery
>;
export type GetMyOrdersQueryResult = Apollo.QueryResult<
  GetMyOrdersQuery,
  GetMyOrdersQueryVariables
>;
export const GetOrderDocument = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      ...CustomerOrderFields
    }
  }
  ${CustomerOrderFieldsFragmentDoc}
`;

/**
 * __useGetOrderQuery__
 *
 * To run a query within a React component, call `useGetOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetOrderQuery(
  baseOptions: Apollo.QueryHookOptions<GetOrderQuery, GetOrderQueryVariables> &
    ({ variables: GetOrderQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetOrderQuery, GetOrderQueryVariables>(
    GetOrderDocument,
    options,
  );
}
export function useGetOrderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrderQuery,
    GetOrderQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetOrderQuery, GetOrderQueryVariables>(
    GetOrderDocument,
    options,
  );
}
// @ts-ignore
export function useGetOrderSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrderQuery,
    GetOrderQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<GetOrderQuery, GetOrderQueryVariables>;
export function useGetOrderSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetOrderQuery, GetOrderQueryVariables>,
): Apollo.UseSuspenseQueryResult<
  GetOrderQuery | undefined,
  GetOrderQueryVariables
>;
export function useGetOrderSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetOrderQuery, GetOrderQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetOrderQuery, GetOrderQueryVariables>(
    GetOrderDocument,
    options,
  );
}
export type GetOrderQueryHookResult = ReturnType<typeof useGetOrderQuery>;
export type GetOrderLazyQueryHookResult = ReturnType<
  typeof useGetOrderLazyQuery
>;
export type GetOrderSuspenseQueryHookResult = ReturnType<
  typeof useGetOrderSuspenseQuery
>;
export type GetOrderQueryResult = Apollo.QueryResult<
  GetOrderQuery,
  GetOrderQueryVariables
>;
export const GetNextOrderStatesDocument = gql`
  query GetNextOrderStates {
    nextOrderStates
  }
`;

/**
 * __useGetNextOrderStatesQuery__
 *
 * To run a query within a React component, call `useGetNextOrderStatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNextOrderStatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNextOrderStatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetNextOrderStatesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetNextOrderStatesQuery,
    GetNextOrderStatesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetNextOrderStatesQuery,
    GetNextOrderStatesQueryVariables
  >(GetNextOrderStatesDocument, options);
}
export function useGetNextOrderStatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetNextOrderStatesQuery,
    GetNextOrderStatesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetNextOrderStatesQuery,
    GetNextOrderStatesQueryVariables
  >(GetNextOrderStatesDocument, options);
}
// @ts-ignore
export function useGetNextOrderStatesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetNextOrderStatesQuery,
    GetNextOrderStatesQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetNextOrderStatesQuery,
  GetNextOrderStatesQueryVariables
>;
export function useGetNextOrderStatesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetNextOrderStatesQuery,
        GetNextOrderStatesQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetNextOrderStatesQuery | undefined,
  GetNextOrderStatesQueryVariables
>;
export function useGetNextOrderStatesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetNextOrderStatesQuery,
        GetNextOrderStatesQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetNextOrderStatesQuery,
    GetNextOrderStatesQueryVariables
  >(GetNextOrderStatesDocument, options);
}
export type GetNextOrderStatesQueryHookResult = ReturnType<
  typeof useGetNextOrderStatesQuery
>;
export type GetNextOrderStatesLazyQueryHookResult = ReturnType<
  typeof useGetNextOrderStatesLazyQuery
>;
export type GetNextOrderStatesSuspenseQueryHookResult = ReturnType<
  typeof useGetNextOrderStatesSuspenseQuery
>;
export type GetNextOrderStatesQueryResult = Apollo.QueryResult<
  GetNextOrderStatesQuery,
  GetNextOrderStatesQueryVariables
>;
export const GetProductsDocument = gql`
  query GetProducts($options: ProductListOptions) {
    products(options: $options) {
      items {
        ...ProductFields
      }
      totalItems
    }
  }
  ${ProductFieldsFragmentDoc}
`;

/**
 * __useGetProductsQuery__
 *
 * To run a query within a React component, call `useGetProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductsQuery({
 *   variables: {
 *      options: // value for 'options'
 *   },
 * });
 */
export function useGetProductsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetProductsQuery,
    GetProductsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProductsQuery, GetProductsQueryVariables>(
    GetProductsDocument,
    options,
  );
}
export function useGetProductsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetProductsQuery,
    GetProductsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetProductsQuery, GetProductsQueryVariables>(
    GetProductsDocument,
    options,
  );
}
// @ts-ignore
export function useGetProductsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetProductsQuery,
    GetProductsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<GetProductsQuery, GetProductsQueryVariables>;
export function useGetProductsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductsQuery,
        GetProductsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetProductsQuery | undefined,
  GetProductsQueryVariables
>;
export function useGetProductsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductsQuery,
        GetProductsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetProductsQuery, GetProductsQueryVariables>(
    GetProductsDocument,
    options,
  );
}
export type GetProductsQueryHookResult = ReturnType<typeof useGetProductsQuery>;
export type GetProductsLazyQueryHookResult = ReturnType<
  typeof useGetProductsLazyQuery
>;
export type GetProductsSuspenseQueryHookResult = ReturnType<
  typeof useGetProductsSuspenseQuery
>;
export type GetProductsQueryResult = Apollo.QueryResult<
  GetProductsQuery,
  GetProductsQueryVariables
>;
export const GetProductBySlugDocument = gql`
  query GetProductBySlug($slug: String!) {
    product(slug: $slug) {
      ...ProductFields
    }
  }
  ${ProductFieldsFragmentDoc}
`;

/**
 * __useGetProductBySlugQuery__
 *
 * To run a query within a React component, call `useGetProductBySlugQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductBySlugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductBySlugQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetProductBySlugQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetProductBySlugQuery,
    GetProductBySlugQueryVariables
  > &
    (
      | { variables: GetProductBySlugQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProductBySlugQuery, GetProductBySlugQueryVariables>(
    GetProductBySlugDocument,
    options,
  );
}
export function useGetProductBySlugLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetProductBySlugQuery,
    GetProductBySlugQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetProductBySlugQuery,
    GetProductBySlugQueryVariables
  >(GetProductBySlugDocument, options);
}
// @ts-ignore
export function useGetProductBySlugSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetProductBySlugQuery,
    GetProductBySlugQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetProductBySlugQuery,
  GetProductBySlugQueryVariables
>;
export function useGetProductBySlugSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductBySlugQuery,
        GetProductBySlugQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetProductBySlugQuery | undefined,
  GetProductBySlugQueryVariables
>;
export function useGetProductBySlugSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductBySlugQuery,
        GetProductBySlugQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetProductBySlugQuery,
    GetProductBySlugQueryVariables
  >(GetProductBySlugDocument, options);
}
export type GetProductBySlugQueryHookResult = ReturnType<
  typeof useGetProductBySlugQuery
>;
export type GetProductBySlugLazyQueryHookResult = ReturnType<
  typeof useGetProductBySlugLazyQuery
>;
export type GetProductBySlugSuspenseQueryHookResult = ReturnType<
  typeof useGetProductBySlugSuspenseQuery
>;
export type GetProductBySlugQueryResult = Apollo.QueryResult<
  GetProductBySlugQuery,
  GetProductBySlugQueryVariables
>;
export const GetProductByIdDocument = gql`
  query GetProductById($id: ID!) {
    product(id: $id) {
      ...ProductFields
    }
  }
  ${ProductFieldsFragmentDoc}
`;

/**
 * __useGetProductByIdQuery__
 *
 * To run a query within a React component, call `useGetProductByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetProductByIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetProductByIdQuery,
    GetProductByIdQueryVariables
  > &
    (
      | { variables: GetProductByIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProductByIdQuery, GetProductByIdQueryVariables>(
    GetProductByIdDocument,
    options,
  );
}
export function useGetProductByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetProductByIdQuery,
    GetProductByIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetProductByIdQuery, GetProductByIdQueryVariables>(
    GetProductByIdDocument,
    options,
  );
}
// @ts-ignore
export function useGetProductByIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetProductByIdQuery,
    GetProductByIdQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetProductByIdQuery,
  GetProductByIdQueryVariables
>;
export function useGetProductByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductByIdQuery,
        GetProductByIdQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetProductByIdQuery | undefined,
  GetProductByIdQueryVariables
>;
export function useGetProductByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductByIdQuery,
        GetProductByIdQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetProductByIdQuery,
    GetProductByIdQueryVariables
  >(GetProductByIdDocument, options);
}
export type GetProductByIdQueryHookResult = ReturnType<
  typeof useGetProductByIdQuery
>;
export type GetProductByIdLazyQueryHookResult = ReturnType<
  typeof useGetProductByIdLazyQuery
>;
export type GetProductByIdSuspenseQueryHookResult = ReturnType<
  typeof useGetProductByIdSuspenseQuery
>;
export type GetProductByIdQueryResult = Apollo.QueryResult<
  GetProductByIdQuery,
  GetProductByIdQueryVariables
>;
export const SearchProductsDocument = gql`
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      items {
        productId
        productName
        slug
        description
        productAsset {
          id
          preview
        }
        priceWithTax {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
        currencyCode
        collectionIds
        score
      }
      totalItems
      facetValues {
        facetValue {
          id
          name
          code
          facet {
            id
            name
            code
          }
        }
        count
      }
    }
  }
`;

/**
 * __useSearchProductsQuery__
 *
 * To run a query within a React component, call `useSearchProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchProductsQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSearchProductsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SearchProductsQuery,
    SearchProductsQueryVariables
  > &
    (
      | { variables: SearchProductsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SearchProductsQuery, SearchProductsQueryVariables>(
    SearchProductsDocument,
    options,
  );
}
export function useSearchProductsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SearchProductsQuery,
    SearchProductsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SearchProductsQuery, SearchProductsQueryVariables>(
    SearchProductsDocument,
    options,
  );
}
// @ts-ignore
export function useSearchProductsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SearchProductsQuery,
    SearchProductsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  SearchProductsQuery,
  SearchProductsQueryVariables
>;
export function useSearchProductsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SearchProductsQuery,
        SearchProductsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  SearchProductsQuery | undefined,
  SearchProductsQueryVariables
>;
export function useSearchProductsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SearchProductsQuery,
        SearchProductsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SearchProductsQuery,
    SearchProductsQueryVariables
  >(SearchProductsDocument, options);
}
export type SearchProductsQueryHookResult = ReturnType<
  typeof useSearchProductsQuery
>;
export type SearchProductsLazyQueryHookResult = ReturnType<
  typeof useSearchProductsLazyQuery
>;
export type SearchProductsSuspenseQueryHookResult = ReturnType<
  typeof useSearchProductsSuspenseQuery
>;
export type SearchProductsQueryResult = Apollo.QueryResult<
  SearchProductsQuery,
  SearchProductsQueryVariables
>;
export const GetCollectionsDocument = gql`
  query GetCollections($options: CollectionListOptions) {
    collections(options: $options) {
      items {
        ...CollectionFields
      }
      totalItems
    }
  }
  ${CollectionFieldsFragmentDoc}
`;

/**
 * __useGetCollectionsQuery__
 *
 * To run a query within a React component, call `useGetCollectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCollectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCollectionsQuery({
 *   variables: {
 *      options: // value for 'options'
 *   },
 * });
 */
export function useGetCollectionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCollectionsQuery,
    GetCollectionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCollectionsQuery, GetCollectionsQueryVariables>(
    GetCollectionsDocument,
    options,
  );
}
export function useGetCollectionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCollectionsQuery,
    GetCollectionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCollectionsQuery, GetCollectionsQueryVariables>(
    GetCollectionsDocument,
    options,
  );
}
// @ts-ignore
export function useGetCollectionsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCollectionsQuery,
    GetCollectionsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetCollectionsQuery,
  GetCollectionsQueryVariables
>;
export function useGetCollectionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCollectionsQuery,
        GetCollectionsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetCollectionsQuery | undefined,
  GetCollectionsQueryVariables
>;
export function useGetCollectionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCollectionsQuery,
        GetCollectionsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCollectionsQuery,
    GetCollectionsQueryVariables
  >(GetCollectionsDocument, options);
}
export type GetCollectionsQueryHookResult = ReturnType<
  typeof useGetCollectionsQuery
>;
export type GetCollectionsLazyQueryHookResult = ReturnType<
  typeof useGetCollectionsLazyQuery
>;
export type GetCollectionsSuspenseQueryHookResult = ReturnType<
  typeof useGetCollectionsSuspenseQuery
>;
export type GetCollectionsQueryResult = Apollo.QueryResult<
  GetCollectionsQuery,
  GetCollectionsQueryVariables
>;
export const GetCollectionBySlugDocument = gql`
  query GetCollectionBySlug($slug: String!) {
    collection(slug: $slug) {
      ...CollectionFields
      productVariants {
        items {
          id
          product {
            ...ProductFields
          }
        }
        totalItems
      }
    }
  }
  ${CollectionFieldsFragmentDoc}
  ${ProductFieldsFragmentDoc}
`;

/**
 * __useGetCollectionBySlugQuery__
 *
 * To run a query within a React component, call `useGetCollectionBySlugQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCollectionBySlugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCollectionBySlugQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetCollectionBySlugQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCollectionBySlugQuery,
    GetCollectionBySlugQueryVariables
  > &
    (
      | { variables: GetCollectionBySlugQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCollectionBySlugQuery,
    GetCollectionBySlugQueryVariables
  >(GetCollectionBySlugDocument, options);
}
export function useGetCollectionBySlugLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCollectionBySlugQuery,
    GetCollectionBySlugQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCollectionBySlugQuery,
    GetCollectionBySlugQueryVariables
  >(GetCollectionBySlugDocument, options);
}
// @ts-ignore
export function useGetCollectionBySlugSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCollectionBySlugQuery,
    GetCollectionBySlugQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetCollectionBySlugQuery,
  GetCollectionBySlugQueryVariables
>;
export function useGetCollectionBySlugSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCollectionBySlugQuery,
        GetCollectionBySlugQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetCollectionBySlugQuery | undefined,
  GetCollectionBySlugQueryVariables
>;
export function useGetCollectionBySlugSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCollectionBySlugQuery,
        GetCollectionBySlugQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCollectionBySlugQuery,
    GetCollectionBySlugQueryVariables
  >(GetCollectionBySlugDocument, options);
}
export type GetCollectionBySlugQueryHookResult = ReturnType<
  typeof useGetCollectionBySlugQuery
>;
export type GetCollectionBySlugLazyQueryHookResult = ReturnType<
  typeof useGetCollectionBySlugLazyQuery
>;
export type GetCollectionBySlugSuspenseQueryHookResult = ReturnType<
  typeof useGetCollectionBySlugSuspenseQuery
>;
export type GetCollectionBySlugQueryResult = Apollo.QueryResult<
  GetCollectionBySlugQuery,
  GetCollectionBySlugQueryVariables
>;
export const GetCollectionByIdDocument = gql`
  query GetCollectionById($id: ID!) {
    collection(id: $id) {
      ...CollectionFields
      productVariants {
        items {
          id
          product {
            ...ProductFields
          }
        }
        totalItems
      }
    }
  }
  ${CollectionFieldsFragmentDoc}
  ${ProductFieldsFragmentDoc}
`;

/**
 * __useGetCollectionByIdQuery__
 *
 * To run a query within a React component, call `useGetCollectionByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCollectionByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCollectionByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCollectionByIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCollectionByIdQuery,
    GetCollectionByIdQueryVariables
  > &
    (
      | { variables: GetCollectionByIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCollectionByIdQuery,
    GetCollectionByIdQueryVariables
  >(GetCollectionByIdDocument, options);
}
export function useGetCollectionByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCollectionByIdQuery,
    GetCollectionByIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCollectionByIdQuery,
    GetCollectionByIdQueryVariables
  >(GetCollectionByIdDocument, options);
}
// @ts-ignore
export function useGetCollectionByIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCollectionByIdQuery,
    GetCollectionByIdQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetCollectionByIdQuery,
  GetCollectionByIdQueryVariables
>;
export function useGetCollectionByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCollectionByIdQuery,
        GetCollectionByIdQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetCollectionByIdQuery | undefined,
  GetCollectionByIdQueryVariables
>;
export function useGetCollectionByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCollectionByIdQuery,
        GetCollectionByIdQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCollectionByIdQuery,
    GetCollectionByIdQueryVariables
  >(GetCollectionByIdDocument, options);
}
export type GetCollectionByIdQueryHookResult = ReturnType<
  typeof useGetCollectionByIdQuery
>;
export type GetCollectionByIdLazyQueryHookResult = ReturnType<
  typeof useGetCollectionByIdLazyQuery
>;
export type GetCollectionByIdSuspenseQueryHookResult = ReturnType<
  typeof useGetCollectionByIdSuspenseQuery
>;
export type GetCollectionByIdQueryResult = Apollo.QueryResult<
  GetCollectionByIdQuery,
  GetCollectionByIdQueryVariables
>;
export const GetFacetsDocument = gql`
  query GetFacets {
    facets {
      items {
        id
        name
        code
        values {
          id
          name
          code
        }
      }
      totalItems
    }
  }
`;

/**
 * __useGetFacetsQuery__
 *
 * To run a query within a React component, call `useGetFacetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacetsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFacetsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFacetsQuery,
    GetFacetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFacetsQuery, GetFacetsQueryVariables>(
    GetFacetsDocument,
    options,
  );
}
export function useGetFacetsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacetsQuery,
    GetFacetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFacetsQuery, GetFacetsQueryVariables>(
    GetFacetsDocument,
    options,
  );
}
// @ts-ignore
export function useGetFacetsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetFacetsQuery,
    GetFacetsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<GetFacetsQuery, GetFacetsQueryVariables>;
export function useGetFacetsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetFacetsQuery, GetFacetsQueryVariables>,
): Apollo.UseSuspenseQueryResult<
  GetFacetsQuery | undefined,
  GetFacetsQueryVariables
>;
export function useGetFacetsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetFacetsQuery, GetFacetsQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetFacetsQuery, GetFacetsQueryVariables>(
    GetFacetsDocument,
    options,
  );
}
export type GetFacetsQueryHookResult = ReturnType<typeof useGetFacetsQuery>;
export type GetFacetsLazyQueryHookResult = ReturnType<
  typeof useGetFacetsLazyQuery
>;
export type GetFacetsSuspenseQueryHookResult = ReturnType<
  typeof useGetFacetsSuspenseQuery
>;
export type GetFacetsQueryResult = Apollo.QueryResult<
  GetFacetsQuery,
  GetFacetsQueryVariables
>;
export const GetFacetsWithDetailsDocument = gql`
  query GetFacetsWithDetails {
    facets {
      items {
        id
        name
        code
        values {
          id
          name
          code
        }
      }
      totalItems
    }
  }
`;

/**
 * __useGetFacetsWithDetailsQuery__
 *
 * To run a query within a React component, call `useGetFacetsWithDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacetsWithDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacetsWithDetailsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFacetsWithDetailsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFacetsWithDetailsQuery,
    GetFacetsWithDetailsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFacetsWithDetailsQuery,
    GetFacetsWithDetailsQueryVariables
  >(GetFacetsWithDetailsDocument, options);
}
export function useGetFacetsWithDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFacetsWithDetailsQuery,
    GetFacetsWithDetailsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFacetsWithDetailsQuery,
    GetFacetsWithDetailsQueryVariables
  >(GetFacetsWithDetailsDocument, options);
}
// @ts-ignore
export function useGetFacetsWithDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetFacetsWithDetailsQuery,
    GetFacetsWithDetailsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetFacetsWithDetailsQuery,
  GetFacetsWithDetailsQueryVariables
>;
export function useGetFacetsWithDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFacetsWithDetailsQuery,
        GetFacetsWithDetailsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetFacetsWithDetailsQuery | undefined,
  GetFacetsWithDetailsQueryVariables
>;
export function useGetFacetsWithDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFacetsWithDetailsQuery,
        GetFacetsWithDetailsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFacetsWithDetailsQuery,
    GetFacetsWithDetailsQueryVariables
  >(GetFacetsWithDetailsDocument, options);
}
export type GetFacetsWithDetailsQueryHookResult = ReturnType<
  typeof useGetFacetsWithDetailsQuery
>;
export type GetFacetsWithDetailsLazyQueryHookResult = ReturnType<
  typeof useGetFacetsWithDetailsLazyQuery
>;
export type GetFacetsWithDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetFacetsWithDetailsSuspenseQuery
>;
export type GetFacetsWithDetailsQueryResult = Apollo.QueryResult<
  GetFacetsWithDetailsQuery,
  GetFacetsWithDetailsQueryVariables
>;
export const SearchProductsWithFacetsDocument = gql`
  query SearchProductsWithFacets($input: SearchInput!) {
    search(input: $input) {
      items {
        productId
        productName
        slug
        description
        productAsset {
          id
          preview
        }
        priceWithTax {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
        currencyCode
        collectionIds
        inStock
      }
      totalItems
      facetValues {
        facetValue {
          id
          name
          code
          facet {
            id
            name
            code
          }
        }
        count
      }
    }
  }
`;

/**
 * __useSearchProductsWithFacetsQuery__
 *
 * To run a query within a React component, call `useSearchProductsWithFacetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchProductsWithFacetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchProductsWithFacetsQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSearchProductsWithFacetsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SearchProductsWithFacetsQuery,
    SearchProductsWithFacetsQueryVariables
  > &
    (
      | { variables: SearchProductsWithFacetsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SearchProductsWithFacetsQuery,
    SearchProductsWithFacetsQueryVariables
  >(SearchProductsWithFacetsDocument, options);
}
export function useSearchProductsWithFacetsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SearchProductsWithFacetsQuery,
    SearchProductsWithFacetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SearchProductsWithFacetsQuery,
    SearchProductsWithFacetsQueryVariables
  >(SearchProductsWithFacetsDocument, options);
}
// @ts-ignore
export function useSearchProductsWithFacetsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SearchProductsWithFacetsQuery,
    SearchProductsWithFacetsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  SearchProductsWithFacetsQuery,
  SearchProductsWithFacetsQueryVariables
>;
export function useSearchProductsWithFacetsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SearchProductsWithFacetsQuery,
        SearchProductsWithFacetsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  SearchProductsWithFacetsQuery | undefined,
  SearchProductsWithFacetsQueryVariables
>;
export function useSearchProductsWithFacetsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        SearchProductsWithFacetsQuery,
        SearchProductsWithFacetsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SearchProductsWithFacetsQuery,
    SearchProductsWithFacetsQueryVariables
  >(SearchProductsWithFacetsDocument, options);
}
export type SearchProductsWithFacetsQueryHookResult = ReturnType<
  typeof useSearchProductsWithFacetsQuery
>;
export type SearchProductsWithFacetsLazyQueryHookResult = ReturnType<
  typeof useSearchProductsWithFacetsLazyQuery
>;
export type SearchProductsWithFacetsSuspenseQueryHookResult = ReturnType<
  typeof useSearchProductsWithFacetsSuspenseQuery
>;
export type SearchProductsWithFacetsQueryResult = Apollo.QueryResult<
  SearchProductsWithFacetsQuery,
  SearchProductsWithFacetsQueryVariables
>;
export const GetProductsByCollectionDocument = gql`
  query GetProductsByCollection(
    $collectionSlug: String!
    $options: ProductVariantListOptions
  ) {
    collection(slug: $collectionSlug) {
      id
      name
      slug
      productVariants(options: $options) {
        items {
          id
          product {
            ...ProductFields
          }
        }
        totalItems
      }
    }
  }
  ${ProductFieldsFragmentDoc}
`;

/**
 * __useGetProductsByCollectionQuery__
 *
 * To run a query within a React component, call `useGetProductsByCollectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductsByCollectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductsByCollectionQuery({
 *   variables: {
 *      collectionSlug: // value for 'collectionSlug'
 *      options: // value for 'options'
 *   },
 * });
 */
export function useGetProductsByCollectionQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetProductsByCollectionQuery,
    GetProductsByCollectionQueryVariables
  > &
    (
      | { variables: GetProductsByCollectionQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetProductsByCollectionQuery,
    GetProductsByCollectionQueryVariables
  >(GetProductsByCollectionDocument, options);
}
export function useGetProductsByCollectionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetProductsByCollectionQuery,
    GetProductsByCollectionQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetProductsByCollectionQuery,
    GetProductsByCollectionQueryVariables
  >(GetProductsByCollectionDocument, options);
}
// @ts-ignore
export function useGetProductsByCollectionSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetProductsByCollectionQuery,
    GetProductsByCollectionQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetProductsByCollectionQuery,
  GetProductsByCollectionQueryVariables
>;
export function useGetProductsByCollectionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductsByCollectionQuery,
        GetProductsByCollectionQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetProductsByCollectionQuery | undefined,
  GetProductsByCollectionQueryVariables
>;
export function useGetProductsByCollectionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductsByCollectionQuery,
        GetProductsByCollectionQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetProductsByCollectionQuery,
    GetProductsByCollectionQueryVariables
  >(GetProductsByCollectionDocument, options);
}
export type GetProductsByCollectionQueryHookResult = ReturnType<
  typeof useGetProductsByCollectionQuery
>;
export type GetProductsByCollectionLazyQueryHookResult = ReturnType<
  typeof useGetProductsByCollectionLazyQuery
>;
export type GetProductsByCollectionSuspenseQueryHookResult = ReturnType<
  typeof useGetProductsByCollectionSuspenseQuery
>;
export type GetProductsByCollectionQueryResult = Apollo.QueryResult<
  GetProductsByCollectionQuery,
  GetProductsByCollectionQueryVariables
>;
export const GetCollectionTreeDocument = gql`
  query GetCollectionTree {
    collections(options: { take: 100 }) {
      items {
        id
        name
        slug
        description
        parentId
        featuredAsset {
          ...AssetFields
        }
        parent {
          id
          name
          slug
        }
        children {
          id
          name
          slug
          featuredAsset {
            ...AssetFields
          }
          children {
            id
            name
            slug
            featuredAsset {
              ...AssetFields
            }
          }
        }
        breadcrumbs {
          id
          name
          slug
        }
      }
      totalItems
    }
  }
  ${AssetFieldsFragmentDoc}
`;

/**
 * __useGetCollectionTreeQuery__
 *
 * To run a query within a React component, call `useGetCollectionTreeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCollectionTreeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCollectionTreeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCollectionTreeQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCollectionTreeQuery,
    GetCollectionTreeQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCollectionTreeQuery,
    GetCollectionTreeQueryVariables
  >(GetCollectionTreeDocument, options);
}
export function useGetCollectionTreeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCollectionTreeQuery,
    GetCollectionTreeQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCollectionTreeQuery,
    GetCollectionTreeQueryVariables
  >(GetCollectionTreeDocument, options);
}
// @ts-ignore
export function useGetCollectionTreeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCollectionTreeQuery,
    GetCollectionTreeQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetCollectionTreeQuery,
  GetCollectionTreeQueryVariables
>;
export function useGetCollectionTreeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCollectionTreeQuery,
        GetCollectionTreeQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetCollectionTreeQuery | undefined,
  GetCollectionTreeQueryVariables
>;
export function useGetCollectionTreeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCollectionTreeQuery,
        GetCollectionTreeQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCollectionTreeQuery,
    GetCollectionTreeQueryVariables
  >(GetCollectionTreeDocument, options);
}
export type GetCollectionTreeQueryHookResult = ReturnType<
  typeof useGetCollectionTreeQuery
>;
export type GetCollectionTreeLazyQueryHookResult = ReturnType<
  typeof useGetCollectionTreeLazyQuery
>;
export type GetCollectionTreeSuspenseQueryHookResult = ReturnType<
  typeof useGetCollectionTreeSuspenseQuery
>;
export type GetCollectionTreeQueryResult = Apollo.QueryResult<
  GetCollectionTreeQuery,
  GetCollectionTreeQueryVariables
>;
export const GetCollectionWithProductsDocument = gql`
  query GetCollectionWithProducts($slug: String!, $take: Int, $skip: Int) {
    collection(slug: $slug) {
      id
      name
      slug
      description
      featuredAsset {
        ...AssetFields
      }
      parent {
        id
        name
        slug
      }
      children {
        id
        name
        slug
        description
        featuredAsset {
          ...AssetFields
        }
      }
      breadcrumbs {
        id
        name
        slug
      }
      productVariants(options: { take: $take, skip: $skip }) {
        items {
          id
          product {
            ...ProductFields
          }
        }
        totalItems
      }
    }
  }
  ${AssetFieldsFragmentDoc}
  ${ProductFieldsFragmentDoc}
`;

/**
 * __useGetCollectionWithProductsQuery__
 *
 * To run a query within a React component, call `useGetCollectionWithProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCollectionWithProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCollectionWithProductsQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *      take: // value for 'take'
 *      skip: // value for 'skip'
 *   },
 * });
 */
export function useGetCollectionWithProductsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCollectionWithProductsQuery,
    GetCollectionWithProductsQueryVariables
  > &
    (
      | { variables: GetCollectionWithProductsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCollectionWithProductsQuery,
    GetCollectionWithProductsQueryVariables
  >(GetCollectionWithProductsDocument, options);
}
export function useGetCollectionWithProductsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCollectionWithProductsQuery,
    GetCollectionWithProductsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCollectionWithProductsQuery,
    GetCollectionWithProductsQueryVariables
  >(GetCollectionWithProductsDocument, options);
}
// @ts-ignore
export function useGetCollectionWithProductsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCollectionWithProductsQuery,
    GetCollectionWithProductsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetCollectionWithProductsQuery,
  GetCollectionWithProductsQueryVariables
>;
export function useGetCollectionWithProductsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCollectionWithProductsQuery,
        GetCollectionWithProductsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetCollectionWithProductsQuery | undefined,
  GetCollectionWithProductsQueryVariables
>;
export function useGetCollectionWithProductsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCollectionWithProductsQuery,
        GetCollectionWithProductsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCollectionWithProductsQuery,
    GetCollectionWithProductsQueryVariables
  >(GetCollectionWithProductsDocument, options);
}
export type GetCollectionWithProductsQueryHookResult = ReturnType<
  typeof useGetCollectionWithProductsQuery
>;
export type GetCollectionWithProductsLazyQueryHookResult = ReturnType<
  typeof useGetCollectionWithProductsLazyQuery
>;
export type GetCollectionWithProductsSuspenseQueryHookResult = ReturnType<
  typeof useGetCollectionWithProductsSuspenseQuery
>;
export type GetCollectionWithProductsQueryResult = Apollo.QueryResult<
  GetCollectionWithProductsQuery,
  GetCollectionWithProductsQueryVariables
>;
export const GetRootCollectionsDocument = gql`
  query GetRootCollections {
    collections(options: { topLevelOnly: true, take: 50 }) {
      items {
        id
        name
        slug
        description
        featuredAsset {
          ...AssetFields
        }
        children {
          id
          name
          slug
          featuredAsset {
            ...AssetFields
          }
        }
      }
      totalItems
    }
  }
  ${AssetFieldsFragmentDoc}
`;

/**
 * __useGetRootCollectionsQuery__
 *
 * To run a query within a React component, call `useGetRootCollectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRootCollectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRootCollectionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRootCollectionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetRootCollectionsQuery,
    GetRootCollectionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetRootCollectionsQuery,
    GetRootCollectionsQueryVariables
  >(GetRootCollectionsDocument, options);
}
export function useGetRootCollectionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetRootCollectionsQuery,
    GetRootCollectionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetRootCollectionsQuery,
    GetRootCollectionsQueryVariables
  >(GetRootCollectionsDocument, options);
}
// @ts-ignore
export function useGetRootCollectionsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetRootCollectionsQuery,
    GetRootCollectionsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetRootCollectionsQuery,
  GetRootCollectionsQueryVariables
>;
export function useGetRootCollectionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRootCollectionsQuery,
        GetRootCollectionsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetRootCollectionsQuery | undefined,
  GetRootCollectionsQueryVariables
>;
export function useGetRootCollectionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRootCollectionsQuery,
        GetRootCollectionsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetRootCollectionsQuery,
    GetRootCollectionsQueryVariables
  >(GetRootCollectionsDocument, options);
}
export type GetRootCollectionsQueryHookResult = ReturnType<
  typeof useGetRootCollectionsQuery
>;
export type GetRootCollectionsLazyQueryHookResult = ReturnType<
  typeof useGetRootCollectionsLazyQuery
>;
export type GetRootCollectionsSuspenseQueryHookResult = ReturnType<
  typeof useGetRootCollectionsSuspenseQuery
>;
export type GetRootCollectionsQueryResult = Apollo.QueryResult<
  GetRootCollectionsQuery,
  GetRootCollectionsQueryVariables
>;
