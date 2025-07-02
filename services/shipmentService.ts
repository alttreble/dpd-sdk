import type { Context } from "../context";

export class ShipmentService {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    createShipment(input: any): any {
        // endpoint: /
        console.log("Calling createShipment with", input);
        return {} as any;
    }

    cancelShipment(input: any): any {
        // endpoint: /
        console.log("Calling cancelShipment with", input);
        return {} as any;
    }

    addparcel(input: any): any {
        // endpoint: /
        console.log("Calling addparcel with", input);
        return {} as any;
    }

    finalizePendingShipment(input: any): any {
        // endpoint: /
        console.log("Calling finalizePendingShipment with", input);
        return {} as any;
    }

    shipmentInformation(input: any): any {
        // endpoint: /
        console.log("Calling shipmentInformation with", input);
        return {} as any;
    }

    secondaryShipments(input: any): any {
        // endpoint: /
        console.log("Calling secondaryShipments with", input);
        return {} as any;
    }

    updateShipment(input: any): any {
        // endpoint: /
        console.log("Calling updateShipment with", input);
        return {} as any;
    }

    updateShipmentProperties(input: any): any {
        // endpoint: /
        console.log("Calling updateShipmentProperties with", input);
        return {} as any;
    }

    findParcelsByReference(input: any): any {
        // endpoint: /
        console.log("Calling findParcelsByReference with", input);
        return {} as any;
    }

    handoverToCourier(input: any): any {
        // endpoint: /
        console.log("Calling handoverToCourier with", input);
        return {} as any;
    }

    handoverToMidwayCarrier(input: any): any {
        // endpoint: /
        console.log("Calling handoverToMidwayCarrier with", input);
        return {} as any;
    }

    barcodeInformation(input: any): any {
        // endpoint: /
        console.log("Calling barcodeInformation with", input);
        return {} as any;
    }
}
