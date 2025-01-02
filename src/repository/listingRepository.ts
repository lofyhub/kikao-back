import { db } from '../db';
import { listings, Listing, NewListing, NewRate } from '../db/schema';
import { compartments, NewCompartment } from '../db/schema';
import { rates } from '../db/schema';
import { eq, and, SQL, TableConfig } from 'drizzle-orm';
import {
    NotFoundError,
    UpdateFailedError,
    DeleteFailedError,
    GenericError
} from '../errors';
import {
    ListingWithRatesAndCompartments,
    NewCompartmentWithoutListingId,
    NewRateWithoutListingId,
    UpdateListing
} from '../interfaces/listing';
import { PgTable } from 'drizzle-orm/pg-core';

export interface Filters {
    price?: number;
    county?: string;
    size?: string;
}

class ListingRepository {
    async filteredListing(filters: Filters): Promise<any> {
        const conditions: SQL[] = [];

        if (filters.price) conditions.push(eq(rates.price, filters.price));
        if (filters.county)
            conditions.push(eq(listings.county, filters.county));
        if (filters.size) conditions.push(eq(listings.size, filters.size));

        return db
            .select()
            .from(listings)
            .innerJoin(rates, eq(rates.listingId, listings.id))
            .innerJoin(compartments, eq(compartments.listingId, listings.id))
            .where(and(...conditions));
    }
    async createListing(
        data: NewListing,
        rate: NewRateWithoutListingId,
        comp: NewCompartmentWithoutListingId
    ): Promise<Listing> {
        const result = await db.transaction(async (trx) => {
            const listingResult = await trx
                .insert(listings)
                .values(data)
                .returning();

            if (listingResult.length === 0) {
                throw new GenericError(`Listing creation was not successful!`);
            }

            const listingId = listingResult[0].id;
            const rateWithId: NewRate = { ...rate, listingId };
            const compWithId: NewCompartment = { ...comp, listingId };

            const rateResult = await trx
                .insert(rates)
                .values(rateWithId)
                .returning();
            if (rateResult.length === 0) {
                throw new GenericError(`Rate creation was not successful!`);
            }

            const compartmentsResult = await trx
                .insert(compartments)
                .values(compWithId)
                .returning();
            if (compartmentsResult.length === 0) {
                throw new GenericError(
                    `Compartment creation was not successful!`
                );
            }

            return {
                ...listingResult[0],
                rates: rateResult[0],
                compartments: compartmentsResult[0]
            };
        });

        return result;
    }

    async findListingById(listing_id: string): Promise<Listing | null> {
        const result = await db
            .select()
            .from(listings)
            .where(eq(listings.id, listing_id));

        if (result.length === 0) {
            return null;
        }

        return result[0];
    }

    // Update a listing by its ID
    async updateListing(
        listing_id: string,
        data: UpdateListing
    ): Promise<Listing | null> {
        const {
            ratesId,
            price,
            duration,
            compartmentsId,
            name,
            location,
            county,
            status,
            yearBuilt,
            description,
            size,
            bedrooms,
            totalRooms,
            washRooms,
            parking,
            roomNumber,
            security,
            garbageCollection,
            wifi
        } = data;

        const updateTable = async (
            table: any,
            data: any,
            id: string,
            field: string
        ) => {
            const result = await db
                .update(table)
                .set(data)
                .where(eq(table.id, id));

            if (!result) {
                throw new UpdateFailedError(
                    `No changes were made to ${field} with ID ${id}.`
                );
            }
        };

        const res = await db
            .select()
            .from(listings)
            .where(eq(listings.id, listing_id));

        if (res.length === 0) {
            throw new NotFoundError(`Listing with ID ${listing_id} not found.`);
        }

        const filteredListingData = {
            name,
            location,
            county,
            status,
            yearBuilt,
            description,
            size
        };

        const filteredRateData = {
            price,
            duration
        };

        const filteredCompartmentData = {
            bedrooms,
            totalRooms,
            washRooms,
            parking,
            roomNumber,
            security,
            garbageCollection,
            wifi
        };

        // Start the transaction
        const result = await db.transaction(async (_trx) => {
            await updateTable(
                listings,
                filteredListingData,
                listing_id,
                'listing'
            );

            await updateTable(rates, filteredRateData, ratesId, 'rates');

            await updateTable(
                compartments,
                filteredCompartmentData,
                compartmentsId,
                'compartments'
            );

            const updatedListing = await db
                .select({
                    id: listings.id,
                    userId: listings.userId,
                    name: listings.name,
                    location: listings.location,
                    county: listings.county,
                    status: listings.status,
                    yearBuilt: listings.yearBuilt,
                    description: listings.description,
                    size: listings.size,
                    images: listings.images,
                    rates: {
                        id: rates.id,
                        price: rates.price,
                        duration: rates.duration
                    },
                    compartments: {
                        bedrooms: compartments.bedrooms,
                        totalRooms: compartments.totalRooms,
                        washRooms: compartments.washRooms,
                        parking: compartments.parking,
                        roomNumber: compartments.roomNumber,
                        security: compartments.security,
                        garbageCollection: compartments.garbageCollection,
                        wifi: compartments.wifi
                    },
                    createdAt: listings.createdAt,
                    updatedAt: listings.updatedAt
                })
                .from(listings)
                .leftJoin(rates, eq(listings.id, rates.listingId))
                .leftJoin(
                    compartments,
                    eq(listings.id, compartments.listingId)
                );

            return updatedListing[0];
        });

        return result;
    }
    // Delete a listing by its ID
    async deleteListing(listing_id: string): Promise<Listing | null> {
        const listing = await db
            .select()
            .from(listings)
            .where(eq(listings.id, listing_id));

        if (listing.length === 0 || !listing) {
            throw new NotFoundError(`Listing with ID ${listing_id} not found.`);
        }

        const is_deleted = await db
            .delete(listings)
            .where(eq(listings.id, listing_id));

        if (!is_deleted) {
            throw new DeleteFailedError(`Listing deletion was not successful.`);
        }

        return listing[0];
    }

    // Get all listings for a user based on their ID
    async getUserListings(user_id: string): Promise<Listing[]> {
        const result = await db.query.listings.findMany({
            where: eq(listings.id, user_id),
            with: {
                rates: true,
                compartments: true
            }
        });

        return result;
    }

    // Fetch all listings
    async getAllListings(): Promise<ListingWithRatesAndCompartments[]> {
        const result = await db
            .select({
                id: listings.id,
                userId: listings.userId,
                name: listings.name,
                location: listings.location,
                county: listings.county,
                status: listings.status,
                yearBuilt: listings.yearBuilt,
                description: listings.description,
                size: listings.size,
                images: listings.images,
                rates: {
                    id: rates.id,
                    price: rates.price,
                    duration: rates.duration
                },
                compartments: {
                    bedrooms: compartments.bedrooms,
                    totalRooms: compartments.totalRooms,
                    washRooms: compartments.washRooms,
                    parking: compartments.parking,
                    roomNumber: compartments.roomNumber,
                    security: compartments.security,
                    garbageCollection: compartments.garbageCollection,
                    wifi: compartments.wifi
                },
                createdAt: listings.createdAt,
                updatedAt: listings.updatedAt
            })
            .from(listings)
            .leftJoin(rates, eq(listings.id, rates.listingId))
            .leftJoin(compartments, eq(listings.id, compartments.listingId));

        return result;
    }
}

export default new ListingRepository();
