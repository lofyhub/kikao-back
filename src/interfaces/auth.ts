import { z } from 'zod';

export const registerBusinessSchema = z.object({
    businessName: z.string(),
    location: z.string(),
    // TODO: find a way to validate as phone number
    phoneNumber: z.string(),
    businessType: z.string(),
    businessCity: z.string(),
    userId: z.string().uuid()
});

export type BusinessInfo = {
    phoneNumber: string;
    businessName: string;
    businessLocation: string;
    businessType: string;
    businessCity: string;
    businessLogo: string;
};
