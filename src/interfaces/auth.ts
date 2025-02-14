import { z } from 'zod';

export const registerBusinessSchema = z.object({
    businessName: z.string().nonempty(),
    location: z.string().nonempty(),
    // TODO: find a way to validate as phone number
    phoneNumber: z.string().nonempty(),
    businessType: z.string().nonempty(),
    businessCity: z.string().nonempty()
});

export type BusinessInfo = {
    phoneNumber: string;
    businessName: string;
    businessLocation: string;
    businessType: string;
    businessCity: string;
    businessLogo: string;
};
