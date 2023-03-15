import * as z from 'zod';
import { Review } from '../interfaces/index';

interface FormFields {
    username: string;
    kikaotype: string;
    phone: string;
    email: string;
    password: string;
}
interface signInField {
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

const signInSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .regex(/^[^\s]+$/, 'No spaces are allowed in the email'),
    password: z
        .string()
        .min(4, 'Password must be at least 4 characters long')
        .transform((value) => value.trim())
});

export function validateSignInFields(fields: signInField) {
    signInSchema.parse(fields);
}
const reviewSchema = z.object({
    house_id: z.string().min(10).max(30),
    name: z.string().min(4).max(30),
    user_id: z.string().min(10).max(30),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10).max(1000),
    listing_author_id: z.string().min(10).max(30)
});

export function validateReviews(review: Review) {
    reviewSchema.parse(review);
}
