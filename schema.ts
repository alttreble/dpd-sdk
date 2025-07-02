import { z } from "zod";

export const CreateShipmentRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  id: z.string(),
  sender: ShipmentSender,
  recipient: ShipmentRecipient,
  service: ShipmentService,
  content: ShipmentContent,
  payment: ShipmentPayment,
  shipmentNote: z.string(),
  ref1: z.string(),
  ref2: z.string(),
  consolidationRef: z.string(),
  requireUnsuccessfulDeliveryStickerImage: z.boolean(),
});

export const CreateShipmentResponse = z.object({
  id: z.string(),
  parcels: z.array(CreatedShipmentParcel),
  price: ShipmentPrice,
  pickupDate: z.string().datetime(),
  deliveryDeadline: z.string().datetime(),
  error: Error,
});

export const CancelShipmentRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  shipmentId: z.string(),
  comment: z.string(),
});

export const CancelShipmentResponse = z.object({
  parcel: CreatedShipmentParcel,
  error: Error,
});

export const AddParcelRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  shipmentId: z.string(),
  parcel: ShipmentParcel,
  codAmount: z.number(),
  codFiscalReceiptItems: z.array(ShipmentCODFiscalReceiptItem),
  declaredValueAmount: z.number(),
});

export const FinalizePendingShipmentRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  shipmentId: z.string(),
});

export const ShipmentInformationRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  shipmentIds: z.array(z.string()),
});

export const ShipmentInformationResponse = z.object({
  shipments: z.array(Shipment),
  error: Error,
});

export const SecondaryShipmentsRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  types: z.array(z.enum(["RETURN_SHIPMENT", "STORAGE_PAYMENT", "REDIRECT", "SEND_BACK", "MONEY_TRANSFER", "TRANSPORT_DAMAGED", "RETURN_VOUCHER"])),
});

export const SecondaryShipmentsResponse = z.object({
  shipments: z.array(SecondaryShipment),
  error: Error,
});

export const UpdateShipmentRequest = z.object({
  ...CreateShipmentRequest.shape,
  id: z.string(),
});

export const UpdateShipmentResponse = z.object({
  ...CreateShipmentResponse.shape,
});

export const UpdateShipmentPropertiesRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  id: z.string(),
  properties: z.string(),
});

export const UpdateShipmentPropertiesResponse = z.object({
  ...UpdateShipmentResponse.shape,
});

export const FindParcelsByRefRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  ref: z.string(),
  searchInRef: z.number().int(),
  shipmentsOnly: z.boolean(),
  includeReturns: z.boolean(),
  fromDateTime: z.string(),
  toDateTime: z.string(),
});

export const FindParcelsByRefResponse = z.object({
  barcodes: z.array(z.string()),
  error: Error,
});

export const HandoverToCourierRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  parcels: z.array(ParcelHandover),
});

export const HandoverToCourierResponse = z.object({
  error: Error,
});

export const HandoverToMidwayCarrierRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  parcels: z.array(MidwayCarrierParcelHandover),
});

export const HandoverToMidwayCarrierResponse = z.object({
  error: Error,
});

export const BarcodeInformationRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  parcel: ShipmentParcelRef,
});

export const BarcodeInformationResponse = z.object({
  labelInfo: LabelInfo,
  primaryShipment: PrimaryShipment,
  primaryParcelId: z.string(),
  returnShipmentId: z.string(),
  returnParcelId: z.string(),
  redirectShipmentId: z.string(),
  redirectParcelId: z.string(),
  initialShipmentId: z.string(),
  initialParcelId: z.string(),
  error: Error,
});

export const PrintRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  format: z.enum(["pdf", "zpl"]),
  paperSize: z.enum(["A4", "A6", "A4_4xA6"]),
  parcels: z.array(z.number().int()),
  printerName: z.string(),
  dpi: z.enum(["dpi203", "dpi300"]),
  additionalWaybillSenderCopy: z.enum(["NONE", "ON_SAME_PAGE", "ON_SINGLE_PAGE"]),
});

export const ExtendedPrintResponse = z.object({
  data: z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(byte))))))))))))),
  printLabelsInfo: z.array(LabelInfo),
  error: Error,
});

export const LabelInfoRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  parcels: z.array(ShipmentParcelRef),
});

export const LabelInfoResponse = z.object({
  printLabelsInfo: z.array(LabelInfo),
  error: Error,
});

export const PrintVoucherRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  shipmentIds: z.array(z.string()),
  printerName: z.string(),
  format: z.enum(["pdf", "zpl"]),
  dpi: z.enum(["dpi203", "dpi300"]),
});

export const TrackRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  parcels: z.array(TrackShipmentParcelRef),
  lastOperationOnly: z.boolean(),
});

export const TrackResponse = z.object({
  parcels: z.array(TrackedParcel),
  error: Error,
});

export const BulkTrackingDataFilesRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  lastProcessedFileId: z.number().int(),
});

export const BulkTrackingDataFilesResponse = z.object({
  files: z.array(BulkTrackingDataFile),
  error: Error,
});

export const PickupRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  pickupDateTime: z.string(),
  autoAdjustPickupDate: z.boolean(),
  pickupScope: z.enum(["EXPLICIT_SHIPMENT_ID_LIST", "ALL_CREATED_BY_LOGGED_USER", "ALL_CREATED_BY_SAME_CLIENT"]),
  explicitShipmentIdList: z.array(z.string()),
  visitEndTime: z.string(),
  contactName: z.string(),
  phoneNumber: ShipmentPhoneNumber,
});

export const PickupResponse = z.object({
  orders: z.array(PickupOrder),
  error: Error,
});

export const PickupTermsRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  serviceId: z.number().int(),
  startingDate: z.string(),
  sender: CalculationSender,
  senderHasPayment: z.boolean(),
});

export const PickupTermsResponse = z.object({
  cutoffs: z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.array(z.string().datetime()))))))))))))))))),
  error: Error,
});

export const GetCountryRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetCountryResponse = z.object({
  country: Country,
  error: Error,
});

export const FindCountryRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  name: z.string(),
  isoAlpha2: z.string(),
  isoAlpha3: z.string(),
});

export const FindCountryResponse = z.object({
  countries: z.array(Country),
  error: Error,
});

export const GetAllCountriesRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetStateRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetStateResponse = z.object({
  state: State,
  error: Error,
});

export const FindStateRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  countryId: z.number().int(),
  name: z.string(),
});

export const FindStateResponse = z.object({
  states: z.array(State),
  error: Error,
});

export const GetAllStatesRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetSiteRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetSiteResponse = z.object({
  site: Site,
  error: Error,
});

export const FindSiteRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  countryId: z.number().int(),
  name: z.string(),
  postCode: z.string(),
  type: z.string(),
  municipality: z.string(),
  region: z.string(),
});

export const FindSiteResponse = z.object({
  sites: z.array(Site),
  error: Error,
});

export const GetAllSitesRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetStreetRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetStreetResponse = z.object({
  street: Street,
  error: Error,
});

export const FindStreetRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  siteId: z.number().int(),
  name: z.string(),
  type: z.string(),
});

export const FindStreetResponse = z.object({
  streets: z.array(Street),
  error: Error,
});

export const GetAllStreetsRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetComplexRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetComplexResponse = z.object({
  complex: Complex,
  error: Error,
});

export const FindComplexRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  siteId: z.number().int(),
  name: z.string(),
  type: z.string(),
});

export const FindComplexResponse = z.object({
  complexes: z.array(Complex),
  error: Error,
});

export const GetAllComplexesRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const FindBlockRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  siteId: z.number().int(),
  name: z.string(),
});

export const FindBlockResponse = z.object({
  blocks: z.array(Block),
  error: Error,
});

export const GetAllBlockRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetPOIRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetPOIResponse = z.object({
  poi: z.number().int(),
  error: Error,
});

export const FindPOIRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  siteId: z.number().int(),
  name: z.string(),
});

export const FindPOIResponse = z.object({
  pois: z.array(z.number().int()),
  error: Error,
});

export const GetAllPOIRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetAllPostcodesRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetOfficeRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetOfficeResponse = z.object({
  office: Office,
  error: Error,
});

export const FindOfficeRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  countryId: z.number().int(),
  siteId: z.number().int(),
  siteName: z.string(),
  name: z.string(),
  limit: z.number().int(),
});

export const FindOfficeResponse = z.object({
  offices: z.array(Office),
  error: Error,
});

export const FindNearestOfficesRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  address: ShipmentAddress,
  distance: z.number().int(),
  limit: z.number().int(),
  officeType: z.enum(["OFFICE", "APT"]),
  officeFeatures: z.enum(["CARD_PAYMENT", "CASH_PAYMENT", "DROP_OFF", "PICK_UP", "CARGO_TYPE_PARCEL", "CARGO_TYPE_PALLET", "CARGO_TYPE_TYRE"]),
});

export const FindNearestOfficesResponse = z.object({
  offices: z.array(OfficeResult),
  x: z.number(),
  y: z.number(),
  error: Error,
});

export const CalculationRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  sender: CalculationSender,
  recipient: CalculationRecipient,
  service: CalculationService,
  content: CalculationContent,
  payment: ShipmentPayment,
});

export const CalculationResponse = z.object({
  calculations: z.array(z.array(CalculationResult)),
  error: Error,
});

export const GetClientRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetClientResponse = z.object({
  client: Client,
  error: Error,
});

export const GetContractClientsRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetContractClientsResponse = z.object({
  clients: z.array(Client),
  error: Error,
});

export const CreateContactRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  externalContactId: z.string(),
  secretKey: z.string(),
  phone1: ShipmentPhoneNumber,
  phone2: ShipmentPhoneNumber,
  clientName: z.string(),
  objectName: z.string(),
  contactName: z.string(),
  email: z.string(),
  privatePerson: z.boolean(),
  address: ShipmentAddress,
});

export const CreateContactResponse = z.object({
  clientId: z.number().int(),
  error: Error,
});

export const GetContactByExternalIdRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  secretKey: z.string(),
});

export const GetContactByExternalIdResponse = z.object({
  client: Client,
  error: Error,
});

export const GetOwnClientIdRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const GetOwnClientIdResponse = z.object({
  clientId: z.number().int(),
  error: Error,
});

export const ContractInfoRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
});

export const ContractInfoResponse = z.object({
  id: z.number().int(),
  specialDeliveryRequirements: SpecialDeliveryRequirements,
  cod: CODAdditionalServiceContractInfo,
  administrativeFeeAllowed: z.boolean(),
  error: Error,
});

export const ValidateAddressRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  address: ShipmentAddress,
});

export const ValidationResponse = z.object({
  valid: z.boolean(),
  error: Error,
});

export const ValidatePostCodeRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  countryId: z.number().int(),
  siteId: z.number().int(),
  postCode: z.string(),
});

export const ValidatePhoneRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  number: z.string(),
  ext: z.string(),
});

export const ValidateShipmentRequest = z.object({
  ...CreateShipmentRequest.shape,
});

export const ServicesRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  date: z.string().datetime(),
});

export const ServicesResponse = z.object({
  services: z.array(CourierService),
  error: Error,
});

export const DestinationServicesRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  date: z.string().datetime(),
  sender: CalculationSender,
  recipient: CalculationRecipient,
});

export const DestinationServicesResponse = z.object({
  services: z.array(ExtendedCourierService),
  error: Error,
});

export const PayoutRequest = z.object({
  userName: z.string(),
  password: z.string(),
  language: z.string(),
  clientSystemId: z.number().int(),
  fromDate: z.string().datetime(),
  toDate: z.string().datetime(),
  includeDetails: z.boolean(),
});

export const PayoutResponse = z.object({
  payouts: z.array(Payout),
  error: Error,
});

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