// Generated TypeScript types (no runtime validation)
export type ShipmentService = {
    /** The date for shipment pickup. Constraints: Could be today or a future date. */
    pickupDate?: string;
    /** To find first available date for pickup starting from pickupDate according to pickup schedule for services */
    autoAdjustPickupDate?: boolean;
    /** Service to be used for the shipment. Constraints: Service id (code) should be valid for the destination. */
    serviceId: number;
    /** Defines sub-services (like COD, Declared value, etc.) associated with the shipment. Constraints: Sub-services may be allowed or forbidden for selected service and/or destination. */
    additionalServices?: ShipmentSubServices;
    /** This parameter allows users to specify by how many (business) days they would like to postpone the shipment delivery from the standard term. Constraints: Allowed values are 0, 1 and 2. */
    deferredDays?: number;
    /** This parameter may adjust delivery date to the first business day, if the standard calculated delivery day is a half-working day. If not specified, system will determine this flag based on configured delivery customer working schedule. */
    saturdayDelivery?: boolean;
};
export type ShipmentSubServices = {
    /** Defines shipment COD sub-service. Constraints: Seller could be required to have a valid contract and annex for COD for the destination. */
    cod?: ShipmentCODAdditionalService;
    /** Defines shipment options before payment details. */
    obpd?: ShipmentOBPD;
    /** Defines shipment declared value (extended liability) sub-service. */
    declaredValue?: ShipmentDeclaredValueAdditionalService;
    /** This option fixes the time of delivery on the delivery date. 1130 - means 11:30, 920 - means 09:20 Constraints: This option is checked against the configured allowed time frame for the service. */
    fixedTimeDelivery?: number;
    /** Defines a return sub-services. Constraints: Return shipments are verified for a return destination. */
    returns?: ShipmentReturnAdditionalServices;
    /** Specifies special delivery identifier for the shipments. Identifiers are determined in a special delivery annex. Constraints: Requires an annex for special delivery. */
    specialDeliveryId?: number;
    /** Specifies the floor number in the building where to deliver the shipment. Constraints: This sub-service requires an annex. */
    deliveryToFloor?: number;
};
export type ShipmentCODAdditionalService = {
    /** Defines shipment COD base amount. Constraints: Validated against the maximum allowed amounts for the destination. */
    amount: number;
    /** Defines shipment COD currency code. Constraints: Validated against the allowed currency code for destination country. */
    currencyCode?: string;
    /** Defines COD processing type. Constraints: Appropriate contract and annexes may be required. */
    processingType?: ("CASH" | "POSTAL_MONEY_TRANSFER");
    /** If this flag is set, the COD is paid to third party (not to the sender). Constraints: Requires a third party to be the payer of the courier service. */
    payoutToThirdParty?: boolean;
    /** If this flag is set, the COD is paid to the logged client. */
    payoutToLoggedClient?: boolean;
    /** Flag indicating whether the shipping price should be included in the COD. */
    includeShippingPrice?: boolean;
    /** Flag indicating that COD/PMT card payment is forbidden. */
    cardPaymentForbidden?: boolean;
    /** List of items to issue fiscal receipt on behalf of client	If shipment has fiscal receipt items, the COD amount is the total amount with VAT of all fiscal receipt items. */
    fiscalReceiptItems?: (ShipmentCODFiscalReceiptItem)[];
};
export type ShipmentCODFiscalReceiptItem = {
    /** Fiscal receipt item description Constraints: Max 50 characters */
    description: string;
    /** VAT group Constraints: Must match one of available VAT groups (for example "А" - 0% VAT, "Б" - 20% VAT, "Г" - 9% VAT). */
    vatGroup: string;
    /** Item amount before VAT. Constraints: Must be positive value */
    amount: number;
    /** Item amount with VAT included Constraints: Must not be lower that amount before VAT */
    amountWithVat: number;
};
export type ShipmentDeclaredValueAdditionalService = {
    /** Defines shipment Declared Value base amount. Declared value amount is always in local system currency. Constraints: Validated against the maximum allowed amounts. */
    amount: number;
    /** Defines fragile flag for shipment content. Constraints: Fragile shipments require a declared value sub service. */
    fragile?: boolean;
    /** Flag to ignore declared value additional service in case it is not applicable for shipment on calculation Constraints: E-shops usually configure declared value (extended liability) by default for their shipments, However there are some certain internal rules when this option is not available. The flag is used in calculation service to provide price to end clients without repeating the calculation request with removed additional service */
    ignoreIfNotApplicable?: boolean;
};
export type ShipmentReturnAdditionalServices = {
    /** Defines Return Of Documents (ROD) sub-service. Constraints: The reverse shipment is validated for service and destination. */
    rod?: ShipmentRODAdditionalService;
    /** Defines Return Receipt sub-service. Cannot be specified if electronicReturnReceipt is provided Constraints: The reverse shipment is validated for service and destination. */
    returnReceipt?: ShipmentReturnReceiptAdditionalService;
    /** Defines electronic Return Receipt sub-service (return receipt by email). Cannot be specified if returnReceipt is provided. Constraints: Electronic return receipt requires email. */
    electronicReturnReceipt?: ShipmentElectronicReturnReceiptAdditionalService;
    /** Defines SWAP sub-service. Constraints: The reverse shipment is validated for service and destination. */
    swap?: ShipmentSWAPAdditionalService;
    /** Defines Return Of Pallets (ROP) sub-service. Constraints: The reverse shipment is validated for service and destination. */
    rop?: ShipmentROPAdditionalService;
    /** Defines Return Voucher associated with the shipment. Constraints: The reverse shipment is validated for service and destination. */
    returnVoucher?: ShipmentReturnVoucherSubService;
    /** Client id to specify send back address in case of a shipment return. Used in shipment returns after Check/Test or in case recipient is not found. If not specified  the shipment is returned to the primary shipment sender. Constraints: Should be a customer address (object) in the same contract as the sender of the shipment. */
    sendBackClientId?: number;
};
export type ShipmentRODAdditionalService = {
    /** Enabled flag */
    enabled: boolean;
    /** Return documents comment. Constraints: Max size 512 */
    comment?: string;
    /** Defines the recipient for the ROD shipment. If not specified and returnToOfficeId is not specified also, the reverse shipment is returned to the primary shipment sender. Constraints: Cannot be specified together with returnToOfficeId. The same value should be set for ROD and Return Receipt, if the sub-service presents. Cannot be specified if SWAP presents */
    returnToClientId?: number;
    /** Defines delivery pickup depot for the ROD shipment. If not specified and returnToClientId is not specified also, the reverse shipment is returned to the primary shipment sender. Constraints: Cannot be specified together with returnToClientId. The same value should be set for ROD, Return Receipt and SWAP, if the sub-service presents. */
    returnToOfficeId?: number;
    /** Defines a third party payer for the ROD shipment. Otherwise the payer is the primary shipment sender. Constraints: Requires a third party payer of the primary shipment. The same value should be set for ROD, Return Receipt, ROP and SWAP, if the sub-service presents. */
    thirdPartyPayer?: boolean;
};
export type ShipmentReturnReceiptAdditionalService = {
    /** Enabled flag */
    enabled: boolean;
    /** Defines the recipient for the Return Receipt shipment. If not specified and returnToOfficeId is not specified also, the reverse shipment is returned to the primary shipment sender. Constraints: Cannot be specified together with returnToOfficeId. The same values should be set for ROD and Return Receipt, if the sub service presents. Cannot be specified if SWAP presents */
    returnToClientId?: number;
    /** Defines delivery pickup depot for the Return Receipt shipment. If not specified and returnToClientId is not specified also, the reverse shipment is returned to the primary shipment sender. Constraints: Cannot be specified together with returnToClientId. The same values should be set for ROD, Return Receipt and SWAP, if the sub service presents. */
    returnToOfficeId?: number;
    /** Defines a third party payer for the Return Receipt. Otherwise the payer is the primary shipment sender. Constraints: Requires a third party payer of the primary shipment. The same values should be set for ROD, Return Receipt / Electronic Return Receipt, ROP and SWAP, if the sub service presents. */
    thirdPartyPayer?: boolean;
};
export type ShipmentSWAPAdditionalService = {
    /** Service to be used in return. Constraints: Validated for allowance and destination. */
    serviceId: number;
    /** Number of parcels to return. Constraints: Validated against maximum allowed parcels. */
    parcelsCount: number;
    /** Declared value (extended liability) for the reverse shipment. Constraints: Validated for allowance and maximum amount. */
    declaredValue?: number;
    /** Fragile content flag for the reverse shipment. Constraints: Fragile shipments require declared value. */
    fragile?: boolean;
    /** Defines delivery pickup depot for the SWAP  shipment. If not specified, the reverse shipment is returned to the primary shipment sender. Constraints: The same values should be set for ROD, Return Receipt and SWAP, if the sub-service presents. */
    returnToOfficeId?: number;
    /** Defines a third party payer for the SWAP shipment. Otherwise the payer is the primary shipment recipient. Constraints: Requires a third party payer of the primary shipment. The same value should be set for ROD, Return Receipt, ROP and SWAP, if the sub-service presents. */
    thirdPartyPayer?: boolean;
};
export type ShipmentROPAdditionalService = {
    /** Defines pallets to return grouped by service id. Constraints: Total number of returned pallets should not exceed the parcel count of the primary shipment. */
    pallets: (ShipmentROPAdditionalServiceLine)[];
    /** Defines a third party payer for the returned pallets. Otherwise the payer is the primary shipment sender. Constraints: Requires a third party payer of the primary shipment. The same values should be set for ROD, Return Receipt / Electronic Return Receipt, ROP and SWAP, if the sub service presents. */
    thirdPartyPayer?: boolean;
};
export type ShipmentROPAdditionalServiceLine = {
    /** ROP service to be used. Constraints: Validated against destination. */
    serviceId: number;
    /** Number of parcels to return. */
    parcelsCount: number;
};
export type ShipmentReturnVoucherSubService = {
    /** Service id of the return shipment. */
    serviceId: number;
    /** Defines a return voucher payer. Constraints: Allowed payers are validated against the service configuration and destination. */
    payer: ("SENDER" | "RECIPIENT" | "THIRD_PARTY");
    /** Return voucher validity period in days. The annex return voucher period is used by default in case caller client has such in his contract and value is omitted Constraints: Verified to not exceed the configured internal maximum in the system */
    validityPeriod?: number;
};
export type ShipmentElectronicReturnReceiptAdditionalService = {
    /** List of electronic return receipt recipient emails */
    recipientEmails: (string)[];
    /** Defines a third party payer for the Electronic Return Receipt. Otherwise the payer is the primary shipment sender. Constraints: Requires a third party payer of the primary shipment. The same values should be set for ROD, Return Receipt / Electronic Return Receipt, ROP and SWAP, if the sub service presents. */
    thirdPartyPayer?: boolean;
};
export type ShipmentOBPD = {
    /** Defines the option to be used. Open parcels on payment or open and test parcels before payment. */
    option: ("OPEN" | "TEST");
    /** Defines service id to be used on return. */
    returnShipmentServiceId: number;
    /** Defines who pays the return shipment. */
    returnShipmentPayer: ("SENDER" | "RECIPIENT" | "THIRD_PARTY");
};
export type ShipmentContent = {
    /** Total shipment parcels count. Ignored, if parcels list is not empty. The parcels count is the number of parcels in the lits in that case. Constraints: Validated against the minimum and maximum allowed for the service. */
    parcelsCount?: number;
    /** Total weight declared for the shipment. Ignored, if parcels list is not empty. The total weight is the sum of all parcels declaredWeight in that case. Constraints: Validated against the minimum and maximum allowed for the service. */
    totalWeight?: number;
    /** Shipment content’s description. Constraints: 100 */
    contents: string;
    /** Shipment package. Constraints: 50 */
    package: string;
    /** Documents flag of the shipment. */
    documents?: boolean;
    /** Palletized flag of the shipment. */
    palletized?: boolean;
    /** Parcels. If omitted a single default (first) parcel will be created for non-pallet and non-postal services. Constraints: Validated against the service configuration and pickup and delivery capacity of the depots and couriers. */
    parcels?: (ShipmentParcel)[];
    /** If this flag is true, the shipment is created in pending parcels state.
                    Shipments in pending parcels state allows adding parcels with addParcel method.
                    Pending parcels state is closed with finalizePendingShipment method. */
    pendingParcels?: boolean;
    /** Flag shipment contains excise goods. */
    exciseGoods?: boolean;
    /** Flag shipment contains dangerous goods in limited quantities. */
    lq?: boolean;
    /** Defines shipment goods value amount. Constraints: Validated against maximum allowed amount. */
    goodsValue?: number;
    /** Defines shipment goods value currency code. Constraints: Requires a valid currency code. */
    goodsValueCurrencyCode?: string;
    /** Shipment UIT code. Constraints: Requires a valid UIT code. */
    uitCode?: string;
    /** An instruction for printing an additional barcode on A6 labels for all parcels. These parameters are used for each generated parcel, unless other instruction provided in the detiled pacel description (shipmentParcel). */
    printAdditionalBarcode?: number;
};
export type ShipmentParcel = {
    /** Parcel identifier - barcode (if it is known). */
    id?: string;
    /** Parcel sequence number in the shipment. Constraints: Should be unique for the shipment. */
    seqNo?: number;
    /** Package number associated with parcel. */
    packageUniqueNumber?: number;
    /** Parcel size (width, height, depth) in cm. Constraints: Validated against the capacity of the couriers and depots. Used to calculate the volume weight, if applicable. */
    size?: ShipmentParcelSize;
    /** Parcel weight in kg. Constraints: Validated against the capacity of the couriers and depots and service configuration. */
    weight: number;
    /** Reference number or text. Constraints: 20 */
    ref1?: string;
    /** Reference number or text. Constraints: 20 */
    ref2?: string;
    /** External carrier parcel id for pickup */
    pickupExternalCarrierParcelNumber?: ExternalCarrierParcelNumber;
    /** External carrier parcel id for delivery */
    deliveryExternalCarrierParcelNumber?: ExternalCarrierParcelNumber;
    /** For parcels due to customs control. For more information, contact your company representative. */
    goods?: (ShipmentParcelGoods)[];
    /** A custom barcode can be added on A6 labels. This instruction overrides the one provded in the "printAdditionalBarcode" property in the ShipmentContent structure. */
    printAdditionalBarcode?: number;
};
export type ShipmentParcelSize = {
    /** Parcel width in cm. */
    width: number;
    /** Parcel depth in cm. */
    depth: number;
    /** Parcel height in cm. */
    height: number;
};
export type ExternalCarrierParcelNumber = {
    /** External carrier reference name */
    externalCarrier: ("ACS");
    /** External carrier parcel number */
    parcelNumber: string;
};
export type ShipmentParcelGoods = {
    /** Goods description. Constraints: 50 */
    description: string;
    /** Harmoneous System (HS) Code. Constraints: 50 */
    hsCode: string;
    /** Quantity of goods. */
    quantity: number;
    /** Price per item in goods currency. */
    valuePerItem: number;
    /** Weight per item. */
    weightPerItem: number;
    /** 2 characters country code of goods origin. Constraints: 2 */
    originCountryCode: string;
};
export type ShipmentPayment = {
    /** Courier service payer. Constraints: Validated against the service, destination, contracts and annexes. */
    courierServicePayer: ("SENDER" | "RECIPIENT" | "THIRD_PARTY");
    /** Declared value (extended liability) payer. If not provided, the courier service payer is assumed. Constraints: Validated against the service, destination, contracts and annexes. */
    declaredValuePayer?: ("SENDER" | "RECIPIENT" | "THIRD_PARTY");
    /** Package payer. If not provided, the courier service payer is assumed. Constraints: Validated against the service, destination, contracts and annexes. */
    packagePayer?: ("SENDER" | "RECIPIENT" | "THIRD_PARTY");
    /** Defines shipment third party - used as a payer of any of shipment payable components. Constraints: Third party customer should be a registered customer with valid contract and annex for delayed payment at pickup date. The third party customer should be a customer (object) in the same contract as the logged user. */
    thirdPartyClientId?: number;
    /** Discount card to be used for discount calculation. Constraints: Validated against a referred contract. */
    discountCardId?: ShipmentDiscountCardId;
    /** Sender COD payout account information. Constraints: Valid IBAN should be present if bank account is provided. */
    senderBankAccount?: BankAccount;
    /** Flag to apply administrative fee on price calculations Constraints: Usage of administrative fee is enabled and configured in client contract. Ignored if not applicable for user */
    administrativeFee?: boolean;
};
export type ShipmentDiscountCardId = {
    /** Fixed discount card contract id. Constraints: Validated against the accessible contract. */
    contractId: number;
    /** Fixed discount card id. Constraints: Validated against the fixed discount card register. */
    cardId: number;
};
export type BankAccount = {
    /** IBAN. Constraints: Validated according to IBAN standards. */
    iban: string;
    /** Bank account holder. */
    accountHolder: string;
};
export type ShipmentSender = {
    /** Client id to refer a sender. Constraints: Validate for existence. */
    clientId?: number;
    /** Sender phone number (for example: +40799123456, 0040799123456, +359999123456 - international format numbers or 0799123456, 0999123456 - local numbers). Constraints: Max size is 20 chars. Phone numbers must contain digits only. The "+" sign is also permitted as a leading symbol. Only spaces are allowed as separators. Only phone numbers starting with "0" (zero) or "+" sign are allowed. */
    phone1: ShipmentPhoneNumber;
    /** Sender phone number 2. Constraints: Validate for valid phone number, if presents. */
    phone2?: ShipmentPhoneNumber;
    /** Sender phone number 3. Constraints: Validate for valid phone number, if presents. */
    phone3?: ShipmentPhoneNumber;
    /** Sender customer name. Constraints: Validate for valid name (minimum 3 symbols, maximum 60). */
    clientName?: string;
    /** Sender contact name. Constraints: Maximum 60 */
    contactName?: string;
    /** Sender email. Constraints: Maximum 255 */
    email?: string;
    /** Sender  private person flag. */
    privatePerson?: boolean;
    /** Sender address. Constraints: Validated for valid values. */
    address?: ShipmentAddress;
    /** Drop off office id. Constraints: Should refer to a valid accessible office. */
    dropoffOfficeId?: number;
    /** DPD drop off office PUDO id Constraints: Should refer to a valid accessible DPD office. */
    dropoffGeoPUDOId?: string;
};
export type ShipmentRecipient = {
    /** Client id to refer recipient. Constraints: Validate for existence. */
    clientId?: number;
    /** Recipient phone number (for example: +40799123456, 0040799123456, +359999123456 - international format numbers or 0799123456, 0999123456 - local numbers). Constraints: Max size is 20 chars. Phone numbers must contain digits only. The "+" sign is also permitted as a leading symbol. Only spaces are allowed as separators. Only phone numbers starting with "0" (zero) or "+" sign are allowed. */
    phone1?: ShipmentPhoneNumber;
    /** Recipient phone number 2. Constraints: Validate for valid phone number, if presents. */
    phone2?: ShipmentPhoneNumber;
    /** Recipient phone number 3. Constraints: Validate for valid phone number, if presents. */
    phone3?: ShipmentPhoneNumber;
    /** Recipient customer name. Constraints: Validate for valid name (minimum 3 symbols, maximum 60). */
    clientName?: string;
    /** Recipient  customer object. Constraints: Validate for valid name (maximum 60 symbols). */
    objectName?: string;
    /** Recipient  contact name. Constraints: Maximum 60 */
    contactName?: string;
    /** Recipient email Constraints: Maximum  255. Mandatory for international shipments */
    email?: string;
    /** Recipient  private person flag. */
    privatePerson?: boolean;
    /** Recipient address. Constraints: Validated for valid values. */
    address?: ShipmentAddress;
    /** Pickup office id. Constraints: Should refer to a valid accessible office. */
    pickupOfficeId?: number;
    /** DPD pickup office PUDO id Constraints: Should refer to a valid accessible DPD office. */
    pickupGeoPUDOId?: string;
    /** Not supported for every destination country Constraints: Must be supported for destination country */
    autoSelectNearestOffice?: boolean;
    /** Defines policy for nearest office auto selection. By default the system tries to find nearest office and if office cannot be determined the shipment is delivered to client address Constraints: Applicable if autoSelectNearestOffice is true */
    autoSelectNearestOfficePolicy?: AutoSelectNearestOfficePolicy;
};
export type ShipmentAddress = {
    /** Country ISO code. If not provided, local country is assumed. Used for all address types. Constraints: Validate for valid country code. */
    countryId?: number;
    /** Country state. Used for addresses of type 2 (foreign address). Constraints: Validate for valid country state. */
    stateId?: string;
    /** Site id. Used for all address types. Constraints: Validate for valid site and value is required. */
    siteId?: number;
    /** Site type can be used in conjunction with countryId and siteName to find unique site. Used for addresses of type 1 (local address). Constraints: Max 20 */
    siteType?: string;
    /** Site type can be used in conjunction with countryId and siteName to find unique site. Used for all address types. Constraints: Max 50 */
    siteName?: string;
    /** Can be used in conjunction with countryId to find unique site. Used for all address types. Constraints: Validated for valid postcode in site and country. Max 10 */
    postCode?: string;
    /** Street identifier. If not provided, but street type and street name are provided - the system will try to find unique match by them in site.
                    Used for addresses of type 1 (local address). Constraints: Validate for valid street. */
    streetId?: number;
    /** Street type. Used for addresses of type 1 (local address). Constraints: Max 15 */
    streetType?: string;
    /** Street name. Used for addresses of type 1 (local address). Constraints: Max 50 */
    streetName?: string;
    /** Street number. Used for addresses of type 1 (local address). Constraints: Max 10 */
    streetNo?: string;
    /** Complex identifier. If not provided, but complex type and complex name are provided - the system will try to find unique match by them in site.
                    Used for addresses of type 1 (local address). Constraints: Validate for valid complex. */
    complexId?: number;
    /** Complex type. Used for addresses of type 1 (local address). Constraints: Max 15 */
    complexType?: string;
    /** Complex name. Used for addresses of type 1 (local address). Constraints: Max 50 */
    complexName?: string;
    /** Block No. Used for addresses of type 1 (local address). Constraints: Max 32 */
    blockNo?: string;
    /** Entrance. Used for addresses of type 1 (local address). Constraints: Max 10 */
    entranceNo?: string;
    /** Floor. Used for addresses of type 1 (local address). Constraints: Max 10 */
    floorNo?: string;
    /** Apartment. Used for addresses of type 1 (local address). Constraints: Max 10 */
    apartmentNo?: string;
    /** Point of interest identifier. Used for addresses of type 1 (local address). Constraints: Validate for valid point of interest. */
    poiId?: number;
    /** Address note. Used for addresses of type 1 (local address). Constraints: 200 */
    addressNote?: string;
    /** Address line 1. Used for addresses of type 2 (foreign address). Constraints: Max 35 */
    addressLine1?: string;
    /** Address line 2. Used for addresses of type 2 (foreign address). Constraints: Max 35 */
    addressLine2?: string;
    /** GIS coordinates - X .Used for all address types. */
    x?: number;
    /** GIS coordinates - Y. Used for all address types. */
    y?: number;
};
export type Address = ShipmentAddress & {
    /** Full address in a single text field */
    fullAddressString: string;
    /** The address site description in a single text */
    siteAddressString: string;
    /** The address within the site in a single text */
    localAddressString: string;
};
export type ShipmentPhoneNumber = {
    /** Phone number. Constraints: Validate for valid phone number. */
    number: string;
    /** Extension. Constraints: Validate for valid extension, if presents. */
    extension?: string;
};
export type AutoSelectNearestOfficePolicy = {
    /** The action to take if nearest office is unavailable. Values can be:"DELIVERY_TO_ADDRESS" - do not change recipient location and deliver to client address			"CANCEL_WITH_ERROR" - cancel shipment and return error in response */
    unavailableNearestOfficeAction?: ("DELIVERY_TO_ADDRESS" | "CANCEL_WITH_ERROR");
    /** Office type filter. Values can be:
                 
                       "OFFICE" - select nearest office
                    "APT" - select nearest locker (APT)
                 
                 No office filter selection is applied if value is not specified Constraints: Not supported for every destination country */
    officeType?: ("OFFICE" | "APT");
};
export type CreatedShipmentParcel = {
    /** Sequence number within the shipment. */
    seqNo: number;
    /** Generated parcel id. */
    id: string;
    /** External carrier id in case this parcel is mapped to an external carrier system */
    externalCarrierId?: number;
    /** External carrier parcel number in case this parcel is mapped to an external carrier system */
    externalCarrierParcelNumber?: string;
};
export type ShipmentParcelRef = {
    /** Parcel id */
    id?: string;
    /** External carrier parcel number used to create parcels. */
    externalCarrierParcelNumber?: string;
    /** No If id or externalCarrierParcelNumber is not provided, it is mandatory. */
    fullBarcode?: string;
};
export type ParcelHandover = ShipmentParcelRef & {
    /** Datetime for handover operation */
    dateTime: string;
};
export type TrackShipmentParcelRef = ShipmentParcelRef & {
    /** Reference to parcel or shipment.
                    The reference is searched in ref1 and ref2 fields in parcels
                    or in ref1 and ref2 fields in shipment. A parcel is included in tracking if reference is found in parcel references.
                    Otherwise, only first shipment parcel (this one with the same number as shipment id) is included in tracking
                    in case reference is found in shipment references. Constraints: If externalCarrierParcelNumber or parcelId is provided, it is ignored.
                    Since the reference is not unique, the maximum barcodes to include for tracking is limited to 10 per reference in request. */
    ref?: string;
};
export type MidwayCarrierParcelHandover = {
    /** Parcel id */
    id: string;
    /** Country ISO id */
    countryId: number;
    /** Datetime for handover operation */
    dateTime: string;
    /** Site name */
    siteName?: string;
};
export type ShipmentPrice = {
    /** Total amount (before VAT) in customer’s currency. */
    amount: number;
    /** VAT amount in customer’s currency. */
    vat: number;
    /** Total amount (amount + vat) in customer’s currency. */
    total: number;
    /** Customer currency code. */
    currency: string;
    /** Amounts that form totals in customer’s currency (including net, discounts, surcharges). Keys in the map are the titles of the items included in the receipt. */
    details: string;
    /** Total amount before VAT in local system currency. */
    amountLocal: number;
    /** VAT in local system currency. */
    vatLocal: number;
    /** Total amount in local system currency (amountLocal + vatLocal). */
    totalLocal: number;
    /** Local system currency code. */
    currencyLocal: string;
    /** Amounts that form totals in local system currency (including net, discounts, surcharges). Keys in the map are the titles of the items included in the receipt. */
    detailsLocal: string;
    /** Currency exchange rate unit for customer currency (1 unit of local system currency is equal to exchangeRateUnit / exchangeRate). */
    currencyExchangeRateUnit: number;
    /** Currency exchange rate used for customer currency conversion. */
    currencyExchangeRate: number;
    /** Shipment returns amounts due */
    returnAmounts?: ReturnAmounts;
};
export type ShipmentPriceAmount = {
    /** Shipment price amount. Discounts are negative. Surcharges and net amount are positive. */
    amount: number;
    /** Percent field is returned, if there is a percent associated with the amount. Fixed price amounts do not have a percent value. 20% is returned as 0.2. */
    percent?: number;
    /** VAT percent applicable to the amount. Amounts without VAT have 0.0 value in that field. Amounts with 20% VAT have 0.2 value in that field. */
    vatPercent: number;
};
export type ReturnAmounts = {
    /** Shipment money transfer premium. */
    moneyTransfer?: MoneyTransferPremium;
};
export type MoneyTransferPremium = {
    /** Amount due in client currency */
    amount?: number;
    /** Amount due in local currency */
    amountLocal?: number;
    /** The payer of money transfer premium */
    payer?: ("SENDER" | "RECIPIENT" | "THIRD_PARTY");
};
export type Error = {
    /** Message context, if associated. This refers to an item that is wrong and should be corrected. */
    context?: string;
    /** Error message in language specified in the request. */
    message: string;
    /** System generated unique error id to be used as this error reference. */
    id: string;
    /** Error code. See Appendix 3 - Error Codes for more details. */
    code: number;
    /** The request component, if applicable, relevant to this error in JSONPath format with dot notation.
                    
                    (For example $.sender.address.siteId refers to siteId property in sender address.) */
    component?: string;
};
export type ParcelToPrint = {
    /** Parcel reference. */
    parcel: ShipmentParcelRef;
    /** Additional barcode to be added in the label. Constraints: Available for A6 paper size only. Otherwise, ignored. */
    additionalBarcode?: number;
};
export type ParcelToPrintAdditionalBarcode = {
    /** Barcode value. Constraints: For barcode formats other than 'CODE128' it must contain digits only. */
    value?: string;
    /** It is printed just below the barcode image. Constraints: For barcode formats other than 'CODE128' label must be equal to the value. */
    label?: string;
    /** Additional barcode format. */
    format?: ("CODE128" | "EAN13" | "EAN8" | "UPCA" | "UPCE");
    /** Values can be:
                    
                          "PROVIDED" - The default value. Uses the values in the "value" and "label" properties.
                       "PARCEL_ID" - Prints the parceId.The "value" and "label" properties have to be empty. The "format" property is required with value "CODE128". */
    valueType?: ("PROVIDED" | "PARCEL_ID");
};
export type LabelInfo = {
    /** Parcel id. */
    parcelId: string;
    /** Delivery Hub id. */
    hubId?: number;
    /** Delivery Office id. */
    officeId?: number;
    /** Delivery Office name. */
    officeName?: string;
    /** Delivery deadline day of month. */
    deadlineDay?: number;
    /** Delivery deadline month . */
    deadlineMonth?: number;
    /** Tour Id. */
    tourId?: number;
    /** Barcode containing the parcel number and important routing information. */
    fullBarcode: string;
    /** Export priority */
    exportPriority: number;
};
export type TrackedParcel = {
    /** Parcel id. */
    parcelId: string;
    /** The list of all external carrier parcel numbers associated with the parcel. */
    externalCarrierParcelNumbers?: (string)[];
    /** The list of operations (scans). */
    operations: (TrackedParcelOperation)[];
    /** Map of external carrier parcel details. Keys in the map are external carrier parcel numbers. */
    externalCarrierParcelNumbersDetails?: string;
    /** Error for this parcel. */
    error?: Error;
};
export type TrackedParcelOperation = {
    /** Operation date time. */
    dateTime: string;
    /** Operation code. See Appendix1 for reference. */
    operationCode: number;
    /** Place of operation. */
    place?: string;
    /** Operation description. */
    description: string;
    /** Operation comment. */
    comment?: string;
    /** List of exception codes for this operation. See Appendix2 for references. */
    exceptionCodes?: (string)[];
    /** If operation leads to return - the return shipment id is in this field. */
    returnShipmentId?: string;
    /** If operation leads to redirect - the redirected shipment id is in this field. */
    redirectShipmentId?: string;
    /** If operation leads to delivery - the recipient name is in this field. */
    consignee?: string;
    /** If operation leads to pod capture - the pod image URL is in this field. */
    podImageURL?: string;
    /** Additional information for operation */
    additionalInfo?: TrackedParcelOperationAdditionalInfo;
};
export type TrackedParcelOperationAdditionalInfo = {
    /** Pickup office URL (applicable for operation 134) */
    officeURL?: string;
    /** Pickup office PUDO id in case pickup office is a DPD office (applicable for operation 134) */
    geoPUDOId?: string;
    /** Predict details */
    predict?: TrackedParcelOperationAdditionalInfoPredict;
};
export type TrackedParcelOperationAdditionalInfoPredict = {
    /** Start of expected time window for delivery */
    predictedVisitDateTimeFrom: string;
    /** End of expected time window for delivery */
    predictedVisitDateTimeTo: string;
    /** Expected delivery time delay in minutes (if any). The expected time window for delivery is adjusted with this delay */
    includedDelayInMinutes?: number;
    /** The value is true in case the predict is cancelled */
    canceled: boolean;
};
export type ExternalCarrierParcelNumberDetails = {
    /** Id of the external carrier */
    externalCarrierId: number;
    /** Name of the external carrier */
    externalCarrierName: string;
    /** Track and trace URL of the external carrier */
    trackAndTraceUrl?: string;
};
export type PickupOrder = {
    /** Order id. */
    id: number;
    /** The list of all shipments associated with the order. */
    shipmentIds: (string)[];
    /** Estimated period start for courier pickup visit */
    pickupPeriodFrom?: string;
    /** Estimated period end for courier pickup visit */
    pickupPeriodTo?: string;
};
export type Country = {
    /** Country ISO */
    id?: number;
    /** Country name in requested language */
    name?: string;
    /** Country name in English */
    nameEn?: string;
    /** Country ISO alpha 2 code */
    isoAlpha2?: string;
    /** Country ISO alpha 3 code */
    isoAlpha3?: string;
    /** Allowed postcode format patterns.
                    If empty string presents in allowed patterns this means - postcode format is not restricted and post code validation is not applied on addresses in this country.  For non-empty patterns, the following characters are placeholders for:  
                       N - digit
                       A - letter
                       ? - digit or letter
                       B - letter
                       O - digit */
    postCodeFormats?: (string)[];
    /** Require state flag */
    requireState?: string;
    /** Address type for this country (1 or 2 - see ShipmentAddress) */
    addressType?: number;
    /** Currency code used for COD in this country */
    currencyCode?: string;
    /** Default office id */
    defaultOfficeId?: number;
    /** Valid street types for country (applicable if addressType is equal to 1) */
    streetTypes?: (AddressNomenclatureType)[];
    /** Valid complex types for country (applicable if addressType is equal to 1) */
    complexTypes?: (AddressNomenclatureType)[];
    /** Specifies site nomenclature (sites) for this country. Values can be:
                               
                                   0 - No site nomenclature for this country.
                                   1 - Full site nomenclature for this country.
                                   2 - Partial site nomenclature for this country. */
    siteNomen?: number;
};
export type AddressNomenclatureType = {
    /** Address nomenclature type name in requested language */
    name?: string;
    /** Address nomenclature type name in English */
    nameEn?: string;
};
export type State = {
    /** State id */
    id?: string;
    /** State name in requested language */
    name?: string;
    /** State name in English */
    nameEn?: string;
    /** State ISO alpha code */
    stateAlpha?: string;
    /** State country id */
    countryId?: number;
};
export type Site = {
    /** Site id */
    id?: number;
    /** Site country id */
    countryId?: number;
    /** Here we have reference to main site if this site is a "satellite" one.
                    A satellite site is considered equal (to their main site) in context of "same city" service allowance */
    mainSiteId?: number;
    /** Site type in requested language */
    type?: string;
    /** Site type in English */
    typeEn?: string;
    /** Site name in requested language */
    name?: string;
    /** Site name in English */
    nameEn?: string;
    /** Municipality name in requested language */
    municipality?: string;
    /** Municipality name in English */
    municipalityEn?: string;
    /** Region name in requested language */
    region?: string;
    /** Region name in English */
    regionEn?: string;
    /** Default post code for this site (if any) */
    postCode?: string;
    /** Code for address nomenclature (streets, complexes, blocks, poi) support.
                            
                       0 - no address nomenclature 
                       1 - full address nomenclature
                       2 - partial address nomenclature */
    addressNomenclature?: number;
    /** Site center GPS X (longitude) coordinate */
    x?: number;
    /** Site center GPS Y (latitude) coordinate */
    y?: number;
    /** Serving days for this site.
                    Format: 7 serial digits (0 or 1) where each digit corresponds to a day in week (the first digit corresponds to Monday, the second to Tuesday and so on).
                    Value of '0' (zero) means that the site is not served on this day while '1' (one) means that it is served.
                    (Example: the text "0100100" means that the site is served on Tuesday and Friday only) */
    servingDays?: string;
    /** Site's serving office */
    servingOfficeId?: number;
    /** The hub office ID to which serving office is connected */
    servingHubOfficeId?: number;
};
export type Street = {
    /** Street id */
    id?: number;
    /** Street site id */
    siteId?: number;
    /** Street type in requested language */
    type?: string;
    /** Street type in English */
    typeEn?: string;
    /** Street name in requested language */
    name?: string;
    /** Street name in English */
    nameEn?: string;
    /** Actual street id (if this street is old and renamed) */
    actualId?: number;
    /** Actual street type in requested language (if this street is old and renamed) */
    actualType?: string;
    /** Actual street type in English (if this street is old and renamed) */
    actualTypeEn?: string;
    /** Actual street name in local language */
    actualName?: string;
    /** Actual street name in English */
    actualNameEn?: string;
};
export type Complex = {
    /** Complex id */
    id?: number;
    /** Complex site id */
    siteId?: number;
    /** Complex type in requested language */
    type?: string;
    /** Complex type in English */
    typeEn?: string;
    /** Complex name in requested language */
    name?: string;
    /** Complex name in English */
    nameEn?: string;
    /** Actual complex id (if this complex is old and renamed) */
    actualId?: number;
    /** Actual complex type in requested language (if this complex is old and renamed) */
    actualType?: string;
    /** Actual complex type in English (if this complex is old and renamed) */
    actualTypeEn?: string;
    /** Actual complex name in requested language (if this complex is old and renamed) */
    actualName?: string;
    /** Actual complex name in English (if this complex is old and renamed) */
    actualNameEn?: string;
};
export type Block = {
    /** Block site id */
    siteId?: number;
    /** Block name in requested language */
    name?: string;
    /** Block name in English */
    nameEn?: string;
};
export type PointOfInterest = {
    /** POI id */
    id?: number;
    /** POI site id */
    siteId?: number;
    /** POI name in requested language */
    name?: string;
    /** POI name in English */
    nameEn?: string;
    /** POI type in requested language */
    type?: string;
    /** POI type in English */
    typeEn?: string;
    /** POI address in requested language */
    address?: string;
    /** POI address in English */
    addressEn?: string;
    /** POI GPS X (longitude) coordinate */
    x?: number;
    /** POI GPS Y (latitude) coordinate */
    y?: number;
};
export type Office = {
    /** Office id */
    id?: number;
    /** Office name in requested language */
    name?: string;
    /** Office name in English */
    nameEn?: string;
    /** Office site id */
    siteId?: number;
    /** Office address in requested language */
    address?: Address;
    /** Office work time start for days with standard (FULL) working schedule */
    workingTimeFrom?: string;
    /** Office work time end for days with standard (FULL) working schedule */
    workingTimeTo?: string;
    /** Office work time start for days with saturday (HALF) working schedule */
    workingTimeHalfFrom?: string;
    /** Office work time end for days with saturday (HALF) working schedule */
    workingTimeHalfTo?: string;
    /** Office work time start for non-working days (DAY OFF) */
    workingTimeDayOffFrom?: string;
    /** Office work time end for non-working days (DAY OFF) */
    workingTimeDayOffTo?: string;
    /** Office same day departure cutoff for days with standard (FULL) working schedule (departure of parcels delivered to office after the cutoff time is next working day) */
    sameDayDepartureCutoff?: string;
    /** Office same day departure cutoff for days with saturday (HALF) working schedule (departure of parcels delivered to office after the cutoff time is next working day) */
    sameDayDepartureCutoffHalf?: string;
    /** Office same day departure cutoff for non-working days (DAY OFF) working schedule (departure of parcels delivered to office after the cutoff time is next working day) */
    sameDayDepartureCutoffDayOff?: string;
    /** Max parcels dimensions for this office */
    maxParcelDimensions?: ShipmentParcelSize;
    /** Max parcel weight */
    maxParcelWeight?: number;
    /** Office type */
    type?: ("OFFICE" | "APT");
    /** Nearby office id */
    nearbyOfficeId?: number;
    /** Office work time schedule for next days */
    workingTimeSchedule?: (OfficeWorkingTimeSchedule)[];
    /** Pallet office flag */
    palletOffice?: boolean;
    /** Flag, indicating this office allows card payments */
    cardPaymentAllowed?: boolean;
    /** Flag, indicating this office allows cash payments */
    cashPaymentAllowed?: boolean;
    /** Valid from date */
    validFrom?: string;
    /** Valid to date */
    validTo?: string;
    /** Allowed cargo types */
    cargoTypesAllowed?: ("PARCEL" | "PALLET" | "TYRE")[];
    /** Flag, indicating whether parcels can be picked up from office */
    pickUpAllowed?: boolean;
    /** Flag, indicating whether parcels can be dropped-off in office */
    dropOffAllowed?: boolean;
};
export type OfficeWorkingTimeSchedule = {
    /** Date this schedule is applicable for */
    date?: string;
    /** Office working time start for this date */
    workingTimeFrom?: string;
    /** Office working time end for this date */
    workingTimeTo?: string;
    /** Office same day departure cutoff for this day (departure of parcels delivered to office after the cutoff time is next working day) */
    sameDayDepartureCutoff?: string;
    /** If true - it is from standard schedule, otherwise office working time is overridden for this specific day */
    standardSchedule?: boolean;
};
export type CalculationService = {
    /** The date for shipment pickup. Constraints: Could be today or a future date */
    pickupDate?: string;
    /** To find first available date for pickup starting from pickupDate according to pickup schedule for services */
    autoAdjustPickupDate?: boolean;
    /** Services for which calculation is requested Constraints: Each service id (code) should be valid for the destination. */
    serviceIds: (number)[];
    /** Defines sub-services (like COD, Declared value, etc.) associated with the shipment. Constraints: Sub-services may be allowed or forbidden for selected service and/or destination. */
    additionalServices?: ShipmentSubServices;
    /** This parameter allows users to specify by how many (business) days they would like to postpone the shipment delivery from the standard term. Constraints: Allowed values are 0, 1 and 2 */
    deferredDays?: number;
    /** This parameter may adjust delivery date to the first business day, if the standard calculated delivery day is a half-working day. If not specified, system will determine this flag based on configured delivery customer working schedule */
    saturdayDelivery?: boolean;
};
export type CalculationSender = {
    /** Client id to refer serving client Constraints: Validate for existence. */
    clientId?: number;
    /** Private person flag. */
    privatePerson?: boolean;
    /** Address location, implies pickup at client address */
    addressLocation?: CalculationAddressLocation;
    /** Drop-off office id Constraints: Validated for valid office. */
    dropoffOfficeId?: number;
    /** DPD drop off office PUDO id Constraints: Should refer to a valid accessible DPD office. */
    dropoffGeoPUDOId?: string;
};
export type CalculationRecipient = {
    /** Client id to refer serving client Constraints: Validate for existence. */
    clientId?: number;
    /** Private person flag. */
    privatePerson?: boolean;
    /** Address location, implies delivery at client address */
    addressLocation?: CalculationAddressLocation;
    /** Pickup office id Constraints: Validated for valid office. */
    pickupOfficeId?: number;
    /** DPD pickup office PUDO id Constraints: Should refer to a valid accessible DPD office. */
    pickupGeoPUDOId?: string;
};
export type CalculationAddressLocation = {
    /** Country ISO code. If not provided, local country is assumed. Used for all address types. Constraints: Validated for valid country code. */
    countryId?: number;
    /** Country state. Used for addresses of type 2 (foreign address). Constraints: Validated for valid country state. */
    stateId?: string;
    /** Site id. Used for all address types. Constraints: Validated for valid site */
    siteId?: number;
    /** Site type can be used in conjunction with countryId and siteName to find unique site. Used for addresses of type 1 (local address). Constraints: Max 20 characters */
    siteType?: string;
    /** Site type can be used in conjunction with countryId and siteName to find unique site. Used for all address types. Constraints: Max 50 characters */
    siteName?: string;
    /** Can be used in conjunction with countryId to find unique site. Used for all address types. Constraints: Validated for valid postcode in site and country. Max 10 characters */
    postCode?: string;
};
export type CalculationContent = {
    /** Total shipment parcels count. Ignored, if parcels list is not empty. Constraints: Validated against the minimum and maximum allowed for the service. */
    parcelsCount?: number;
    /** Total weight declared for the shipment. Ignored, if parcels list is not empty. The total weight is the sum of all parcels declaredWeight in that case. Constraints: Validated against the minimum and maximum allowed for the service. */
    totalWeight?: number;
    /** Documents flag of the shipment */
    documents?: boolean;
    /** Palletized flag of the shipment. */
    palletized?: boolean;
    /** List of parcels Constraints: Validated against the service configuration and pickup and delivery capacity of the depots and couriers. */
    parcels?: (ShipmentParcel)[];
};
export type CalculationResult = {
    /** Service id */
    serviceId?: number;
    /** Additional services included in calculation */
    additionalServices?: ShipmentSubServices;
    /** Returned, if customer has access to view the amounts of the shipment. */
    price?: ShipmentPrice;
    /** Pickup date. */
    pickupDate?: string;
    /** Deadline for delivery. Returned, if available */
    deliveryDeadline?: string;
    /** Response error. */
    error?: Error;
};
export type Client = {
    /** Client id */
    clientId?: number;
    /** Client name */
    clientName?: string;
    /** Object name */
    objectName?: string;
    /** Contact name */
    contactName?: string;
    /** Client address */
    address?: Address;
    /** Client email */
    email?: string;
    /** Private person flag. */
    privatePerson?: boolean;
};
export type Shipment = {
    /** Shipment id */
    id?: string;
    /** Shipment sender. */
    sender?: Sender;
    /** Shipment recipient. */
    recipient?: Recipient;
    /** Shipment service level agreement. */
    service?: ShipmentService;
    /** Shipment content. */
    content?: Content;
    /** Shipment payment. */
    payment?: Payment;
    /** Customer’s note associated with the shipment. */
    shipmentNote?: string;
    /** Reference number or text. */
    ref1?: string;
    /** Reference number or text. */
    ref2?: string;
    /** Shipment payment. */
    price?: ShipmentPrice;
    /** Shipment delivery. */
    delivery?: ShipmentDelivery;
    /** Primary shipment. */
    primaryShipment?: PrimaryShipment;
    /** Return shipment id (in case this shipment is returned to sender) */
    returnShipmentId?: string;
    /** Redirect shipment id (in case this shipment is redirected to new delivery location) */
    redirectShipmentId?: string;
    /** If this flag is true, the shipment is created in pending shipment state.
                    Shipments in pending shipment state can have incomplete data that defines logistics (without complete addresses, only sites)
                    Pending shipment state is closed with updateShipment method that makes shipments complete. */
    pendingShipment?: boolean;
};
export type Sender = Client & {
    /** Drop-off office id */
    dropoffOfficeId?: number;
    /** DPD PUDO Id */
    dropoffGeoPUDOId?: string;
};
export type Recipient = Client & {
    /** Pickup office id */
    pickupOfficeId?: number;
    /** DPD PUDO Id */
    pickupGeoPUDOId?: string;
};
export type Content = {
    /** Total shipment parcels count. */
    parcelsCount?: number;
    /** Shipment declared weight */
    declaredWeight?: number;
    /** Shipment measured weight */
    measuredWeight?: number;
    /** Shipment calculation weight */
    calculationWeight?: number;
    /** Shipment content’s description. */
    contents?: string;
    /** Shipment package. */
    package?: string;
    /** Documents flag of the shipment (shipment content is documents) */
    documents?: boolean;
    /** Palletized flag of the shipment. */
    palletized?: boolean;
    /** Shipment parcels */
    parcels?: (Parcel)[];
    /** If this flag is true, the shipment is created in pending parcels state.
                    Shipments in pending parcels state allows adding parcels with addParcel method.
                    Pending parcels state is closed with finalizePendingShipment method. */
    pendingParcels?: boolean;
};
export type Parcel = {
    /** Parcel id */
    id?: string;
    /** Parcel sequence number within the shipment */
    seqNo?: number;
    /** Package number associated with parcel. */
    packageUniqueNumber?: number;
    /** Parcel declared size */
    declaredSize?: ShipmentParcelSize;
    /** Parcel measured size */
    measuredSize?: ShipmentParcelSize;
    /** Parcel calculation size */
    calculationSize?: ShipmentParcelSize;
    /** Parcel declared weight */
    declaredWeight?: number;
    /** Parcel measured weight */
    measuredWeight?: number;
    /** Parcel calculation weight */
    calculationWeight?: number;
    /** External carrier parcel numbers associated with this parcel */
    externalCarrierParcelNumbers?: (string)[];
    /** Base type name */
    baseType?: string;
    /** Size name */
    size?: string;
};
export type Payment = {
    /** Courier service payer. */
    courierServicePayer?: ("SENDER" | "RECIPIENT" | "THIRD_PARTY");
    /** Declared value payer */
    declaredValuePayer?: ("SENDER" | "RECIPIENT" | "THIRD_PARTY");
    /** Package payer */
    packagePayer?: ("SENDER" | "RECIPIENT" | "THIRD_PARTY");
    /** Third party payer client id in case one of the payers is THIRD_PARTY */
    thirdPartyClientId?: number;
    /** Discount card used in calculation. */
    discountCardId?: ShipmentDiscountCardId;
    /** COD Payment details */
    codPayment?: CODPayment;
};
export type CODPayment = {
    /** Pay out date */
    date?: string;
    /** Total paid out COD amount */
    totalPayedOutAmount?: number;
};
export type ShipmentDelivery = {
    /** Deadline for this shipment */
    deadline?: string;
    /** Datetime of actual delivery (if shipment is delivered) */
    deliveryDateTime?: string;
    /** Shipment consignee (if shipment is delivered) */
    consignee?: string;
    /** Shipment delivery note (if shipment is delivered) */
    deliveryNote?: string;
};
export type PrimaryShipment = {
    /** Primary shipment id */
    id?: string;
    /** Primary shipment type - how this secondary shipment is related to primary one
                    
                          RETURN_SHIPMENT - if this shipment is one of return of documents (rod) / returnReceipt / swap / return of pallets (rop) for a primary one
                          STORAGE_PAYMENT - if this shipment is for warehouse charges for a primary one
                          REDIRECT - if this shipment redirects primary one 
                          SEND_BACK - if this shipment returns primary one to sender
                          MONEY_TRANSFER - if this shipment is a money transfer for a primary one
                          TRANSPORT_DAMAGED - if this shipment is for damaged primary shipment transport
                          VOUCHER_RETURN - if this shipment is a voucher return for a primary one */
    type?: ("RETURN_SHIPMENT" | "STORAGE_PAYMENT" | "REDIRECT" | "SEND_BACK" | "MONEY_TRANSFER" | "TRANSPORT_DAMAGED" | "RETURN_VOUCHER");
};
export type SecondaryShipment = {
    /** Secondary shipment id */
    id?: string;
    /** Primary shipment type - how this secondary shipment is realted to primary one
                     RETURN_SHIPMENT - if this shipment is one of return of documents (rod) / returnReceipt / swap / return of pallets (rop) for a primary one STORAGE_PAYMENT - if this shipment is for warehouse charges for a primary one REDIRECT - if this shipment redirects primary one  SEND_BACK - if this shipment returns primary one to sender MONEY_TRANSFER - if this shipment is a money transfer for a primary one TRANSPORT_DAMAGED - if this shipment is for damaged primary shipment transport VOUCHER_RETURN - if this shipment is a voucher return for a primary one */
    type?: ("RETURN_SHIPMENT" | "STORAGE_PAYMENT" | "REDIRECT" | "SEND_BACK" | "MONEY_TRANSFER" | "TRANSPORT_DAMAGED" | "RETURN_VOUCHER");
    /** Shipment parcels */
    parcels?: (ShipmentParcelNumber)[];
    /** Secondary shipment pickup date */
    pickupDate?: string;
    /** Secondary shipment service id */
    serviceId?: number;
    /** Flag that shows whether the secondary shipment is scanned */
    hasScans?: boolean;
};
export type ShipmentParcelNumber = {
    /** Parcel id */
    id?: string;
    /** Parcel sequence number in the shipment. */
    seqNo?: number;
};
export type CourierService = {
    /** Courier service id */
    id?: number;
    /** Courier service name in local language */
    name?: string;
    /** Courier service name in English */
    nameEn?: string;
    /** Additional services options */
    additionalServices?: AdditionalCourierServices;
    /** Cargo type */
    cargoType?: ("PARCEL" | "PALLET" | "TYRE");
    /** Require weight for each parcel on create shipment */
    requireParcelWeight?: boolean;
    /** Require size for each parcel on create shipment */
    requireParcelSize?: boolean;
};
export type AdditionalCourierServices = {
    /** COD configuration */
    cod?: AdditionalCourierService;
    /** Options Before Payment or Delivery configuration */
    obpd?: AdditionalCourierService;
    /** Declared value configuration */
    declaredValue?: AdditionalCourierService;
    /** Fixed time configuration */
    fixedTimeDelivery?: AdditionalCourierService;
    /** Special delivery configuration */
    specialDelivery?: AdditionalCourierService;
    /** Delivery to floor configuration */
    deliveryToFloor?: AdditionalCourierService;
    /** Return of documents configuration */
    rod?: AdditionalCourierService;
    /** Return receipt configuration */
    returnReceipt?: AdditionalCourierService;
    /** SWAP configuration */
    swap?: AdditionalCourierService;
    /** Return of pallets configuration */
    rop?: AdditionalCourierService;
    /** Return voucher configuration */
    returnVoucher?: AdditionalCourierService;
};
export type AdditionalCourierService = {
    /** Allowance value  Forbidden - this additional service is not allowed for courier service Allowed - this additional service is allowed for usage for courier service. It  could be either used or skipped on create shipment	  Required - this additional service is mandatory to be used with courier service on create shipment */
    allowance?: ("FORBIDDEN" | "ALLOWED" | "REQUIRED");
};
export type ExtendedCourierService = CourierService & {
    /** Deadline for delivery */
    deadline?: string;
};
export type BulkTrackingDataFile = {
    /** File id */
    id?: number;
    /** File url */
    url?: string;
};
export type Payout = {
    /** Payout date */
    date?: string;
    /** Payout document id */
    docId?: number;
    /** Payout document type */
    docType?: ("CASH" | "POSTAL_MONEY_TRANSFER");
    /** Payout payment type */
    paymentType?: ("CASH" | "BANK");
    /** Payee */
    payee?: string;
    /** Payout currency */
    currency?: string;
    /** Payout amount */
    amount?: number;
    /** List of payout details */
    details?: (PayoutDetails)[];
};
export type PayoutDetails = {
    /** Payout line number */
    lineNo?: number;
    /** Payout shipment id */
    shipmentId?: string;
    /** Date of shipment pickup */
    pickupDate?: string;
    /** Date of primary shipment pickup in case this shipment is a secondary one */
    primaryShipmentPickupDate?: string;
    /** Shipment delivery date */
    deliveryDate?: string;
    /** Shipment sender */
    sender?: string;
    /** Shipment recipient */
    recipient?: string;
    /** Shipment note */
    note?: string;
    /** Shipment ref1 (reference) */
    ref1?: string;
    /** Shipment ref2 (reference) */
    ref2?: string;
    /** Payout currency */
    currency?: string;
    /** Order id */
    order?: number;
    /** Payout amount */
    amount?: number;
};
export type SpecialDeliveryRequirements = {
    /** Indicates whether special delivery requirements are mandatory for each shipment */
    requiredForAllShipments?: boolean;
    /** List of requirements */
    requirements?: (Requirement)[];
};
export type Requirement = {
    /** Special delivery requirement id */
    id?: number;
    /** Requirement text */
    text?: string;
};
export type OfficeResult = Office & {
    /** Distance from searched location */
    distance?: number;
};
export type CODAdditionalServiceContractInfo = {
    /** COD as money transfer allowed flag */
    moneyTransferAllowed?: boolean;
    /** Issuing COD fiscal receipt on behalf of client allowed flag */
    codFiscalReceiptAllowed?: boolean;
    /** Logged client has COD annex flag */
    hasCODAnnex?: boolean;
    /** List of international COD annex contract info */
    internationalCODAnnexes?: (number)[];
};
export type CODInternationalAnnexContractInfo = {
    /** International annex country id */
    countryId?: number;
    /** International annex country name */
    countryName?: string;
};
