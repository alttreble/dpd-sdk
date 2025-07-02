import type z from "zod";
import type { Context } from "../context";
import type { ValidateAddressRequest, ValidationResponse } from "../schema";

export class ValidationService {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    async validateAddress(input: z.infer<typeof ValidateAddressRequest>): Promise<z.infer<typeof ValidationResponse>> {
      const endpoint = "/validation/address"

      const res = await this.context.fetcher.request(endpoint, input)
      return res.json()
    }

    validatePostCode(input: any): any {
        // endpoint: /
        console.log("Calling validatePostCode with", input);
        return {} as any;
    }

    validatePhone(input: any): any {
        // endpoint: /
        console.log("Calling validatePhone with", input);
        return {} as any;
    }

    validateShipment(input: any): any {
        // endpoint: /
        console.log("Calling validateShipment with", input);
        return {} as any;
    }
}
