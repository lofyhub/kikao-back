import { Rate, Compartments } from '.';
import { NewCompartment, NewRate } from '../db/schema';

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

export interface ListingWithRatesAndCompartments {
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
