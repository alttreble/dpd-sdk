import type { Context } from "../context";

export class CalculationService {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    calculation(input: any): any {
        // endpoint: /
        console.log("Calling calculation with", input);
        return {} as any;
    }
}
