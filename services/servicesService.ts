import type { Context } from "../context";

export class ServicesService {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    services(input: any): any {
        // endpoint: /
        console.log("Calling services with", input);
        return {} as any;
    }

    destinationServices(input: any): any {
        // endpoint: /
        console.log("Calling destinationServices with", input);
        return {} as any;
    }
}
