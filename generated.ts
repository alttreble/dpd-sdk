import { z } from "zod";


export const ShipmentService = z.object({
  pickupDate: z.string().datetime(),
  autoAdjustPickupDate: z.boolean(),
  serviceId: z.number().int(),
  additionalServices: ShipmentSubServices,
  deferredDays: z.number().int(),
  saturdayDelivery: z.boolean(),
});

export const ShipmentSubServices = z.object({
  cod: ShipmentCODAdditionalService,
  obpd: ShipmentOBPD,
  declaredValue: ShipmentDeclaredValueAdditionalService,
  fixedTimeDelivery: z.number().int(),
  returns: ShipmentReturnAdditionalServices,
  specialDeliveryId: z.number().int(),
  deliveryToFloor: z.number().int(),
});

export const ShipmentCODAdditionalService = z.object({
  amount: z.number(),
  currencyCode: z.string(),
  processingType: z.enum(["CASH", "POSTAL_MONEY_TRANSFER"]),
  payoutToThirdParty: z.boolean(),
  payoutToLoggedClient: z.boolean(),
  includeShippingPrice: z.boolean(),
  cardPaymentForbidden: z.boolean(),
  fiscalReceiptItems: z.array(ShipmentCODFiscalReceiptItem),
});

export const ShipmentCODFiscalReceiptItem = z.object({
  description: z.string(),
  vatGroup: z.string(),
  amount: z.number(),
  amountWithVat: z.number(),
});

export const ShipmentDeclaredValueAdditionalService = z.object({
  amount: z.number(),
  fragile: z.boolean(),
  ignoreIfNotApplicable: z.boolean(),
});

export const ShipmentReturnAdditionalServices = z.object({
  rod: ShipmentRODAdditionalService,
  returnReceipt: ShipmentReturnReceiptAdditionalService,
  electronicReturnReceipt: ShipmentElectronicReturnReceiptAdditionalService,
  swap: ShipmentSWAPAdditionalService,
  rop: ShipmentROPAdditionalService,
  returnVoucher: ShipmentReturnVoucherSubService,
  sendBackClientId: z.number().int(),
});

export const ShipmentRODAdditionalService = z.object({
  enabled: z.boolean(),
  comment: z.string(),
  returnToClientId: z.number().int(),
  returnToOfficeId: z.number().int(),
  thirdPartyPayer: z.boolean(),
});

export const ShipmentReturnReceiptAdditionalService = z.object({
  enabled: z.boolean(),
  returnToClientId: z.number().int(),
  returnToOfficeId: z.number().int(),
  thirdPartyPayer: z.boolean(),
});

export const ShipmentSWAPAdditionalService = z.object({
  serviceId: z.number().int(),
  parcelsCount: z.number().int(),
  declaredValue: z.number(),
  fragile: z.boolean(),
  returnToOfficeId: z.number().int(),
  thirdPartyPayer: z.boolean(),
});

export const ShipmentROPAdditionalService = z.object({
  pallets: z.array(ShipmentROPAdditionalServiceLine),
  thirdPartyPayer: z.boolean(),
});

export const ShipmentROPAdditionalServiceLine = z.object({
  serviceId: z.number().int(),
  parcelsCount: z.number().int(),
});

export const ShipmentReturnVoucherSubService = z.object({
  serviceId: z.number().int(),
  payer: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"]),
  validityPeriod: z.number().int(),
});

export const ShipmentElectronicReturnReceiptAdditionalService = z.object({
  recipientEmails: z.array(z.string()),
  thirdPartyPayer: z.boolean(),
});

export const ShipmentOBPD = z.object({
  option: z.enum(["OPEN", "TEST"]),
  returnShipmentServiceId: z.number().int(),
  returnShipmentPayer: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"]),
});

export const ShipmentContent = z.object({
  parcelsCount: z.number().int(),
  totalWeight: z.number(),
  contents: z.string(),
  package: z.string(),
  documents: z.boolean(),
  palletized: z.boolean(),
  parcels: z.array(ShipmentParcel),
  pendingParcels: z.boolean(),
  exciseGoods: z.boolean(),
  lq: z.boolean(),
  goodsValue: z.number(),
  goodsValueCurrencyCode: z.string(),
  uitCode: z.string(),
});

export const ShipmentParcel = z.object({
  id: z.string(),
  seqNo: z.number().int(),
  packageUniqueNumber: z.number().int(),
  size: ShipmentParcelSize,
  weight: z.number(),
  ref1: z.string(),
  ref2: z.string(),
  pickupExternalCarrierParcelNumber: ExternalCarrierParcelNumber,
  deliveryExternalCarrierParcelNumber: ExternalCarrierParcelNumber,
  goods: z.array(ShipmentParcelGoods),
});

export const ShipmentParcelSize = z.object({
  width: z.number().int(),
  depth: z.number().int(),
  height: z.number().int(),
});

export const ExternalCarrierParcelNumber = z.object({
  externalCarrier: z.enum(["ACS"]),
  parcelNumber: z.string(),
});

export const ShipmentParcelGoods = z.object({
  description: z.string(),
  hsCode: z.string(),
  quantity: z.number().int(),
  valuePerItem: z.number(),
  weightPerItem: z.number(),
  originCountryCode: z.string(),
});

export const ShipmentPayment = z.object({
  courierServicePayer: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"]),
  declaredValuePayer: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"]),
  packagePayer: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"]),
  thirdPartyClientId: z.number().int(),
  discountCardId: ShipmentDiscountCardId,
  senderBankAccount: BankAccount,
  administrativeFee: z.boolean(),
});

export const ShipmentDiscountCardId = z.object({
  contractId: z.number().int(),
  cardId: z.number().int(),
});

export const BankAccount = z.object({
  iban: z.string(),
  accountHolder: z.string(),
});

export const ShipmentSender = z.object({
  clientId: z.number().int(),
  phone1: ShipmentPhoneNumber,
  phone2: ShipmentPhoneNumber,
  phone3: ShipmentPhoneNumber,
  clientName: z.string(),
  contactName: z.string(),
  email: z.string(),
  privatePerson: z.boolean(),
  address: ShipmentAddress,
  dropoffOfficeId: z.number().int(),
  dropoffGeoPUDOId: z.string(),
});

export const ShipmentRecipient = z.object({
  clientId: z.number().int(),
  phone1: ShipmentPhoneNumber,
  phone2: ShipmentPhoneNumber,
  phone3: ShipmentPhoneNumber,
  clientName: z.string(),
  objectName: z.string(),
  contactName: z.string(),
  email: z.string(),
  privatePerson: z.boolean(),
  address: ShipmentAddress,
  pickupOfficeId: z.number().int(),
  pickupGeoPUDOId: z.string(),
  autoSelectNearestOffice: z.boolean(),
  autoSelectNearestOfficePolicy: AutoSelectNearestOfficePolicy,
});

export const ShipmentAddress = z.object({
  countryId: z.number().int(),
  stateId: z.string(),
  siteId: z.number().int(),
  siteType: z.string(),
  siteName: z.string(),
  postCode: z.string(),
  streetId: z.number().int(),
  streetType: z.string(),
  streetName: z.string(),
  streetNo: z.string(),
  complexId: z.number().int(),
  complexType: z.string(),
  complexName: z.string(),
  blockNo: z.string(),
  entranceNo: z.string(),
  floorNo: z.string(),
  apartmentNo: z.string(),
  poiId: z.number().int(),
  addressNote: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  x: z.number(),
  y: z.number(),
});

export const Address = z.object({
  ...ShipmentAddress.shape,
  fullAddressString: z.string(),
  siteAddressString: z.string(),
  localAddressString: z.string(),
});

export const ShipmentPhoneNumber = z.object({
  number: z.string(),
  extension: z.string(),
});

export const AutoSelectNearestOfficePolicy = z.object({
  unavailableNearestOfficeAction: z.enum(["DELIVERY_TO_ADDRESS", "CANCEL_WITH_ERROR"]),
  officeType: z.enum(["OFFICE", "APT"]),
});

export const CreatedShipmentParcel = z.object({
  seqNo: z.number().int(),
  id: z.string(),
  externalCarrierId: z.number().int(),
  externalCarrierParcelNumber: z.string(),
});

export const ShipmentParcelRef = z.object({
  id: z.string(),
  externalCarrierParcelNumber: z.string(),
  fullBarcode: z.string(),
});

export const ParcelHandover = z.object({
  dateTime: z.string().datetime(),
  ...ShipmentParcelRef.shape,
});

export const TrackShipmentParcelRef = z.object({
  ref: z.string(),
  ...ShipmentParcelRef.shape,
});

export const MidwayCarrierParcelHandover = z.object({
  id: z.string(),
  countryId: z.number().int(),
  dateTime: z.string().datetime(),
  siteName: z.string(),
});

export const ShipmentPrice = z.object({
  amount: z.number(),
  vat: z.number(),
  total: z.number(),
  currency: z.string(),
  details: z.string(),
  amountLocal: z.number(),
  vatLocal: z.number(),
  totalLocal: z.number(),
  currencyLocal: z.string(),
  detailsLocal: z.string(),
  currencyExchangeRateUnit: z.number().int(),
  currencyExchangeRate: z.number(),
  returnAmounts: ReturnAmounts,
});

export const ShipmentPriceAmount = z.object({
  amount: z.number(),
  percent: z.number(),
  vatPercent: z.number(),
});

export const ReturnAmounts = z.object({
  moneyTransfer: MoneyTransferPremium,
});

export const MoneyTransferPremium = z.object({
  amount: z.number(),
  amountLocal: z.number(),
  payer: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"]),
});

export const Error = z.object({
  context: z.string(),
  message: z.string(),
  id: z.string(),
  code: z.number().int(),
  component: z.string(),
});

export const ParcelToPrint = z.object({
  parcel: ShipmentParcelRef,
  additionalBarcode: z.number().int(),
});

export const ParcelToPrintAdditionalBarcode = z.object({
  value: z.string(),
  label: z.string(),
  format: z.enum(["CODE128", "EAN13", "EAN8", "UPCA", "UPCE"]),
});

export const LabelInfo = z.object({
  parcelId: z.string(),
  hubId: z.number().int(),
  officeId: z.number().int(),
  officeName: z.string(),
  deadlineDay: z.number().int(),
  deadlineMonth: z.number().int(),
  tourId: z.number().int(),
  fullBarcode: z.string(),
  exportPriority: z.number().int(),
});

export const TrackedParcel = z.object({
  parcelId: z.string(),
  externalCarrierParcelNumbers: z.array(z.string()),
  operations: z.array(TrackedParcelOperation),
  externalCarrierParcelNumbersDetails: z.string(),
  error: Error,
});

export const TrackedParcelOperation = z.object({
  dateTime: z.string().datetime(),
  operationCode: z.number().int(),
  place: z.string(),
  description: z.string(),
  comment: z.string(),
  exceptionCodes: z.array(z.string()),
  returnShipmentId: z.string(),
  redirectShipmentId: z.string(),
  consignee: z.string(),
  podImageURL: z.string(),
  additionalInfo: TrackedParcelOperationAdditionalInfo,
});

export const TrackedParcelOperationAdditionalInfo = z.object({
  officeURL: z.string(),
  geoPUDOId: z.string(),
  predict: TrackedParcelOperationAdditionalInfoPredict,
});

export const TrackedParcelOperationAdditionalInfoPredict = z.object({
  predictedVisitDateTimeFrom: z.string().datetime(),
  predictedVisitDateTimeTo: z.string().datetime(),
  includedDelayInMinutes: z.number().int(),
  canceled: z.boolean(),
});

export const ExternalCarrierParcelNumberDetails = z.object({
  externalCarrierId: z.number().int(),
  externalCarrierName: z.string(),
  trackAndTraceUrl: z.string(),
});

export const PickupOrder = z.object({
  id: z.number().int(),
  shipmentIds: z.array(z.string()),
  pickupPeriodFrom: z.string().datetime(),
  pickupPeriodTo: z.string().datetime(),
});

export const Country = z.object({
  id: z.number().int(),
  name: z.string(),
  nameEn: z.string(),
  isoAlpha2: z.string(),
  isoAlpha3: z.string(),
  postCodeFormats: z.array(z.string()),
  requireState: z.string(),
  addressType: z.number().int(),
  currencyCode: z.string(),
  defaultOfficeId: z.number().int(),
  streetTypes: z.array(AddressNomenclatureType),
  complexTypes: z.array(AddressNomenclatureType),
  siteNomen: z.number().int(),
});

export const AddressNomenclatureType = z.object({
  name: z.string(),
  nameEn: z.string(),
});

export const State = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string(),
  stateAlpha: z.string(),
  countryId: z.number().int(),
});

export const Site = z.object({
  id: z.number().int(),
  countryId: z.number().int(),
  mainSiteId: z.number().int(),
  type: z.string(),
  typeEn: z.string(),
  name: z.string(),
  nameEn: z.string(),
  municipality: z.string(),
  municipalityEn: z.string(),
  region: z.string(),
  regionEn: z.string(),
  postCode: z.string(),
  addressNomenclature: z.number().int(),
  x: z.number(),
  y: z.number(),
  servingDays: z.string(),
  servingOfficeId: z.number().int(),
  servingHubOfficeId: z.number().int(),
});

export const Street = z.object({
  id: z.number().int(),
  siteId: z.number().int(),
  type: z.string(),
  typeEn: z.string(),
  name: z.string(),
  nameEn: z.string(),
  actualId: z.number().int(),
  actualType: z.string(),
  actualTypeEn: z.string(),
  actualName: z.string(),
  actualNameEn: z.string(),
});

export const Complex = z.object({
  id: z.number().int(),
  siteId: z.number().int(),
  type: z.string(),
  typeEn: z.string(),
  name: z.string(),
  nameEn: z.string(),
  actualId: z.number().int(),
  actualType: z.string(),
  actualTypeEn: z.string(),
  actualName: z.string(),
  actualNameEn: z.string(),
});

export const Block = z.object({
  siteId: z.number().int(),
  name: z.string(),
  nameEn: z.string(),
});

export const PointOfInterest = z.object({
  id: z.number().int(),
  siteId: z.number().int(),
  name: z.string(),
  nameEn: z.string(),
  type: z.string(),
  typeEn: z.string(),
  address: z.string(),
  addressEn: z.string(),
  x: z.number(),
  y: z.number(),
});

export const Office = z.object({
  id: z.number().int(),
  name: z.string(),
  nameEn: z.string(),
  siteId: z.number().int(),
  address: Address,
  workingTimeFrom: z.string(),
  workingTimeTo: z.string(),
  workingTimeHalfFrom: z.string(),
  workingTimeHalfTo: z.string(),
  workingTimeDayOffFrom: z.string(),
  workingTimeDayOffTo: z.string(),
  sameDayDepartureCutoff: z.string(),
  sameDayDepartureCutoffHalf: z.string(),
  sameDayDepartureCutoffDayOff: z.string(),
  maxParcelDimensions: ShipmentParcelSize,
  maxParcelWeight: z.number(),
  type: z.enum(["OFFICE", "APT"]),
  nearbyOfficeId: z.number().int(),
  workingTimeSchedule: z.array(OfficeWorkingTimeSchedule),
  palletOffice: z.boolean(),
  cardPaymentAllowed: z.boolean(),
  cashPaymentAllowed: z.boolean(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  cargoTypesAllowed: z.array(z.enum(["PARCEL", "PALLET", "TYRE"])),
  pickUpAllowed: z.boolean(),
  dropOffAllowed: z.boolean(),
});

export const OfficeWorkingTimeSchedule = z.object({
  date: z.string().datetime(),
  workingTimeFrom: z.string(),
  workingTimeTo: z.string(),
  sameDayDepartureCutoff: z.string(),
  standardSchedule: z.boolean(),
});

export const CalculationService = z.object({
  pickupDate: z.string().datetime(),
  autoAdjustPickupDate: z.boolean(),
  serviceIds: z.array(z.number().int()),
  additionalServices: ShipmentSubServices,
  deferredDays: z.number().int(),
  saturdayDelivery: z.boolean(),
});

export const CalculationSender = z.object({
  clientId: z.number().int(),
  privatePerson: z.boolean(),
  addressLocation: CalculationAddressLocation,
  dropoffOfficeId: z.number().int(),
  dropoffGeoPUDOId: z.string(),
});

export const CalculationRecipient = z.object({
  clientId: z.number().int(),
  privatePerson: z.boolean(),
  addressLocation: CalculationAddressLocation,
  pickupOfficeId: z.number().int(),
  pickupGeoPUDOId: z.string(),
});

export const CalculationAddressLocation = z.object({
  countryId: z.number().int(),
  stateId: z.string(),
  siteId: z.number().int(),
  siteType: z.string(),
  siteName: z.string(),
  postCode: z.string(),
});

export const CalculationContent = z.object({
  parcelsCount: z.number().int(),
  totalWeight: z.number(),
  documents: z.boolean(),
  palletized: z.boolean(),
  parcels: z.array(ShipmentParcel),
});

export const CalculationResult = z.object({
  serviceId: z.number().int(),
  additionalServices: ShipmentSubServices,
  price: ShipmentPrice,
  pickupDate: z.string().datetime(),
  deliveryDeadline: z.string().datetime(),
  error: Error,
});

export const Client = z.object({
  clientId: z.number().int(),
  clientName: z.string(),
  objectName: z.string(),
  contactName: z.string(),
  address: Address,
  email: z.string(),
  privatePerson: z.boolean(),
});

export const Shipment = z.object({
  id: z.string(),
  sender: Sender,
  recipient: Recipient,
  service: ShipmentService,
  content: Content,
  payment: Payment,
  shipmentNote: z.string(),
  ref1: z.string(),
  ref2: z.string(),
  price: ShipmentPrice,
  delivery: ShipmentDelivery,
  primaryShipment: PrimaryShipment,
  returnShipmentId: z.string(),
  redirectShipmentId: z.string(),
  pendingShipment: z.boolean(),
});

export const Sender = z.object({
  ...Client.shape,
  dropoffOfficeId: z.number().int(),
  dropoffGeoPUDOId: z.string(),
});

export const Recipient = z.object({
  ...Client.shape,
  pickupOfficeId: z.number().int(),
  pickupGeoPUDOId: z.string(),
});

export const Content = z.object({
  parcelsCount: z.number().int(),
  declaredWeight: z.number(),
  measuredWeight: z.number(),
  calculationWeight: z.number(),
  contents: z.string(),
  package: z.string(),
  documents: z.boolean(),
  palletized: z.boolean(),
  parcels: z.array(Parcel),
  pendingParcels: z.boolean(),
});

export const Parcel = z.object({
  id: z.string(),
  seqNo: z.number().int(),
  packageUniqueNumber: z.number().int(),
  declaredSize: ShipmentParcelSize,
  measuredSize: ShipmentParcelSize,
  calculationSize: ShipmentParcelSize,
  declaredWeight: z.number(),
  measuredWeight: z.number(),
  calculationWeight: z.number(),
  externalCarrierParcelNumbers: z.array(z.string()),
  baseType: z.string(),
  size: z.string(),
});

export const Payment = z.object({
  courierServicePayer: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"]),
  declaredValuePayer: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"]),
  packagePayer: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"]),
  thirdPartyClientId: z.number().int(),
  discountCardId: ShipmentDiscountCardId,
  codPayment: CODPayment,
});

export const CODPayment = z.object({
  date: z.string().datetime(),
  totalPayedOutAmount: z.number(),
});

export const ShipmentDelivery = z.object({
  deadline: z.string().datetime(),
  deliveryDateTime: z.string().datetime(),
  consignee: z.string(),
  deliveryNote: z.string(),
});

export const PrimaryShipment = z.object({
  id: z.string(),
  type: z.enum(["RETURN_SHIPMENT", "STORAGE_PAYMENT", "REDIRECT", "SEND_BACK", "MONEY_TRANSFER", "TRANSPORT_DAMAGED", "RETURN_VOUCHER"]),
});

export const SecondaryShipment = z.object({
  id: z.string(),
  type: z.enum(["RETURN_SHIPMENT", "STORAGE_PAYMENT", "REDIRECT", "SEND_BACK", "MONEY_TRANSFER", "TRANSPORT_DAMAGED", "RETURN_VOUCHER"]),
  parcels: z.array(ShipmentParcelNumber),
  pickupDate: z.string().datetime(),
  serviceId: z.number().int(),
  hasScans: z.boolean(),
});

export const ShipmentParcelNumber = z.object({
  id: z.string(),
  seqNo: z.number().int(),
});

export const CourierService = z.object({
  id: z.number().int(),
  name: z.string(),
  nameEn: z.string(),
  additionalServices: AdditionalCourierServices,
  cargoType: z.enum(["PARCEL", "PALLET", "TYRE"]),
  requireParcelWeight: z.boolean(),
  requireParcelSize: z.boolean(),
});

export const AdditionalCourierServices = z.object({
  cod: AdditionalCourierService,
  obpd: AdditionalCourierService,
  declaredValue: AdditionalCourierService,
  fixedTimeDelivery: AdditionalCourierService,
  specialDelivery: AdditionalCourierService,
  deliveryToFloor: AdditionalCourierService,
  rod: AdditionalCourierService,
  returnReceipt: AdditionalCourierService,
  swap: AdditionalCourierService,
  rop: AdditionalCourierService,
  returnVoucher: AdditionalCourierService,
});

export const AdditionalCourierService = z.object({
  allowance: z.enum(["FORBIDDEN", "ALLOWED", "REQUIRED"]),
});

export const ExtendedCourierService = z.object({
  ...CourierService.shape,
  deadline: z.string().datetime(),
});

export const BulkTrackingDataFile = z.object({
  id: z.number().int(),
  url: z.string(),
});

export const Payout = z.object({
  date: z.string().datetime(),
  docId: z.number().int(),
  docType: z.enum(["CASH", "POSTAL_MONEY_TRANSFER"]),
  paymentType: z.enum(["CASH", "BANK"]),
  payee: z.string(),
  currency: z.string(),
  amount: z.number(),
  details: z.array(PayoutDetails),
});

export const PayoutDetails = z.object({
  lineNo: z.number().int(),
  shipmentId: z.string(),
  pickupDate: z.string().datetime(),
  primaryShipmentPickupDate: z.string().datetime(),
  deliveryDate: z.string().datetime(),
  sender: z.string(),
  recipient: z.string(),
  note: z.string(),
  ref1: z.string(),
  ref2: z.string(),
  currency: z.string(),
  order: z.number().int(),
  amount: z.number(),
});

export const SpecialDeliveryRequirements = z.object({
  requiredForAllShipments: z.boolean(),
  requirements: z.array(Requirement),
});

export const Requirement = z.object({
  id: z.number().int(),
  text: z.string(),
});

export const OfficeResult = z.object({
  distance: z.number().int(),
  ...Office.shape,
});

export const CODAdditionalServiceContractInfo = z.object({
  moneyTransferAllowed: z.boolean(),
  codFiscalReceiptAllowed: z.boolean(),
  hasCODAnnex: z.boolean(),
  internationalCODAnnexes: z.array(z.number().int()),
});

export const CODInternationalAnnexContractInfo = z.object({
  countryId: z.number().int(),
  countryName: z.string(),
});
