import { Rate, Compartments } from '.';
import { NewCompartment, NewRate } from '../db/schema';
import { z } from 'zod';

export interface ListingAttributes {
    name: string;
    location: string;
    county: string;
    status: string;
    year_built: string;
    description: string;
    images: string[];
    size: string;
}

export type ListingUpdateAttributes = {
    name?: string | undefined;
    location?: string | undefined;
    county?: string | undefined;
    status?: string | undefined;
    size?: string | undefined;
    year_built?: string | undefined;
    description?: string | undefined;
};

export interface ListingDbAttributes extends ListingAttributes {
    id: string;
    created_at: Date;
    updated_at: Date;
    rates?: Rate;
    compartment?: Compartments;
}

export interface ListingDbAttributesNull extends ListingAttributes {
    id: string;
    created_at: Date;
    updated_at: Date;
    rates: Rate | null;
    compartments: Compartments | null;
}

export type NewCompartmentWithoutListingId = Omit<NewCompartment, 'listingId'>;
export type NewRateWithoutListingId = Omit<NewRate, 'listingId'>;

export interface ListingRatesCompartments {
    id: string;
    userId: string;
    name: string;
    location: string;
    county: string;
    status: string;
    yearBuilt: string;
    description: string;
    size: string;
    images: string[];
    rates: {
        price: number;
        duration: string;
    } | null;

    compartments: {
        bedrooms: number;
        totalRooms: string;
        washRooms: number;
        parking: boolean;
        roomNumber: boolean;
        security: boolean;
        garbageCollection: boolean;
        wifi: boolean;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface ResponseGetUser {
    userListings: ListingRatesCompartments[];
    count: number;
}

export interface UpdateListing {
    name?: string;
    location?: string;
    county?: string;
    status?: string;
    yearBuilt?: string;
    description?: string;
    size?: string;
    ratesId: string; // mandatory
    price?: number;
    duration?: string;
    compartmentsId: string; // mandatory
    bedrooms?: number;
    totalRooms?: string;
    washRooms?: number;
    parking?: boolean;
    roomNumber?: boolean;
    security?: boolean;
    garbageCollection?: boolean;
    wifi?: boolean;
}

export const NewListingSchema = z.object({
    name: z.string().min(4).nonempty().max(50),
    location: z.string().min(4).nonempty().max(50),
    county: z.string().min(4).nonempty(),
    status: z.string().nonempty(),
    yearBuilt: z.string().min(4).max(4).regex(/^\S*$/),
    description: z.string().min(20).nonempty(),
    size: z.string().nonempty(),
    userId: z.string().uuid().nonempty(),
    images: z.string().nonempty().array()
});

export const NewRateSchema = z.object({
    price: z.number().min(3000),
    duration: z.string().nonempty(),
    countryCode: z.string().nonempty()
});

export const NewCompartmentSchema = z.object({
    bedrooms: z.number(),
    totalRooms: z.string().nonempty(),
    washRooms: z.number(),
    parking: z.boolean(),
    roomNumber: z.boolean(),
    security: z.boolean(),
    garbageCollection: z.boolean(),
    wifi: z.boolean()
});

export const updateListingSchema = z.object({
    name: z.string().optional(),
    location: z.string().optional(),
    county: z.string().optional(),
    status: z.string().optional(),
    yearBuilt: z.string().optional(),
    description: z.string().optional(),
    size: z.string().optional(),
    ratesId: z.string().uuid(), // mandatory
    price: z.number().optional(),
    duration: z.string().optional(),
    compartmentsId: z.string().uuid(), // mandatory
    bedrooms: z.number().optional(),
    totalRooms: z.string().optional(),
    washRooms: z.number().optional(),
    parking: z.boolean().optional(),
    roomNumber: z.boolean().optional(),
    security: z.boolean().optional(),
    garbageCollection: z.boolean().optional(),
    wifi: z.boolean().optional()
});

export const listingIdSchema = z.string().uuid();
export const userIdSchema = z.string().uuid();
export const ratesIdSchema = z.string().uuid();
