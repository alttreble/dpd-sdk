import Fetcher from "./fetcher"
import { ShipmentService } from "./services/shipmentService";
import { PrintService } from "./services/printService";
import { TrackAndTraceService } from "./services/trackAndTraceService";
import { Pickup } from "./services/pickup";
import { LocationService } from "./services/locationService";
import { CalculationService } from "./services/calculationService";
import { ClientService } from "./services/clientService";
import { ValidationService } from "./services/validationService";
import { ServicesService } from "./services/servicesService";
import { PaymentsService } from "./services/paymentsService";
import type { Context } from "./context";

export type ClientOptions = {
  username: string
  password: string
  baseUrl: string
}

function buildContext({ username, password, baseUrl }: ClientOptions): Context {
  return {
    fetcher: new Fetcher({
      username,
      password,
      baseUrl
    })
  }
}

export default class DPDClient {
  private context: Context

  constructor(options: ClientOptions) {
    this.context = buildContext(options)
    this.paymentsService = new PaymentsService(this.context);
    this.servicesService = new ServicesService(this.context);
    this.validationService = new ValidationService(this.context);
    this.clientService = new ClientService(this.context);
    this.calculationService = new CalculationService(this.context);
    this.locationService = new LocationService(this.context);
    this.pickup = new Pickup(this.context);
    this.trackAndTraceService = new TrackAndTraceService(this.context);
    this.printService = new PrintService(this.context);
    this.shipmentService = new ShipmentService(this.context);
  }

  public shipmentService: ShipmentService;
  public printService: PrintService;
  public trackAndTraceService: TrackAndTraceService;
  public pickup: Pickup;
  public locationService: LocationService;
  public calculationService: CalculationService;
  public clientService: ClientService;
  public validationService: ValidationService;
  public servicesService: ServicesService;
  public paymentsService: PaymentsService;
}
