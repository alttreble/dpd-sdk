import type { Context } from "../context";

export class Pickup {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    pickup(input: any): any {
        // endpoint: /
        console.log("Calling pickup with", input);
        return {} as any;
    }

    pickupTerms(input: any): any {
        // endpoint: /
        console.log("Calling pickupTerms with", input);
        return {} as any;
    }
}
