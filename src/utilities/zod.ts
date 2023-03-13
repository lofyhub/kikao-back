import * as z from 'zod';

interface FormFields {
    username: string;
    kikaotype: string;
    phone: string;
    email: string;
    password: string;
}

const formSchema = z.object({
    username: z.string().min(4).trim(),
    kikaotype: z.string().min(4).trim(),
    phone: z.string().min(10).regex(/^\d+$/).trim(),
    email: z.string().email(),
    password: z.string().min(4).trim()
});

export function validateFormFields(fields: FormFields) {
    formSchema.parse(fields);
}
