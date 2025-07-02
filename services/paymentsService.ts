import type { Context } from "../context";

export class PaymentsService {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    payout(input: any): any {
        // endpoint: /
        console.log("Calling payout with", input);
        return {} as any;
    }
}
