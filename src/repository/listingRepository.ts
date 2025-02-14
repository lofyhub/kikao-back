import { db } from '../db';
import { listings, Listing, NewListing, NewRate } from '../db/schema';
import { compartments, NewCompartment } from '../db/schema';
import { rates } from '../db/schema';
import { eq, and, SQL } from 'drizzle-orm';
import {
    NotFoundError,
    UpdateFailedError,
    DeleteFailedError,
    GenericError,
    UnauthorizedError
} from '../errors';
import {
    ListingRatesCompartments,
    NewCompartmentWithoutListingId,
    NewRateWithoutListingId,
    UpdateListing
} from '../interfaces/listing';

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
            const ratesNew = rateResult[0];
            const compartmentsNew = compartmentsResult[0];

            return {
                ...listingResult[0],
                rates: {
                    price: ratesNew.price,
                    duration: ratesNew.duration,
                    countryCode: ratesNew.countryCode
                },
                compartments: {
                    bedrooms: compartmentsNew.bedrooms,
                    totalRooms: compartmentsNew.totalRooms,
                    washRooms: compartmentsNew.washRooms,
                    parking: compartmentsNew.parking,
                    roomNumber: compartmentsNew.roomNumber,
                    security: compartmentsNew.security,
                    garbageCollection: compartmentsNew.garbageCollection,
                    wifi: compartmentsNew.wifi
                }
            };
        });

        return result;
    }

    async findListingById(
        listing_id: string
    ): Promise<ListingRatesCompartments> {
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
            .where(eq(listings.id, listing_id))
            .innerJoin(rates, eq(rates.listingId, listings.id))
            .innerJoin(compartments, eq(compartments.listingId, listings.id));

        if (!result || result.length === 0) {
            throw new NotFoundError('Listing Not found!');
        }

        return result[0];
    }

    // Update a listing by its ID
    async updateListing(
        listing_id: string,
        user_id: string,
        data: UpdateListing
    ): Promise<ListingRatesCompartments> {
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
            // TODO: Refactor or some better way to handle this scenario
            // prevent a user from randomy updating another users rates or compartmens
            if (field === 'rates') {
                const res = await db
                    .select()
                    .from(rates)
                    .where(eq(rates.id, ratesId));

                if (res[0].listingId !== listing_id) {
                    throw new UnauthorizedError(
                        'You can only update a rate that you created!'
                    );
                }
            } else if (field === 'compartments') {
                const res = await db
                    .select()
                    .from(compartments)
                    .where(eq(rates.id, compartmentsId));

                if (res[0].listingId !== listing_id) {
                    throw new UnauthorizedError(
                        'You can only update a compartment that you created!'
                    );
                }
            }
            const result = await db
                .update(table)
                .set(data)
                .where(eq(table.id, id));

            if (!result || result.length === 0) {
                throw new UpdateFailedError(
                    `No changes were made to ${field} with ID ${id}.`
                );
            }
        };

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
    async deleteListing(listing_id: string, user_id: string): Promise<Listing> {
        const listing = await this.findListingById(listing_id);

        if (listing.userId !== user_id) {
            throw new GenericError('You can only delete your listing!');
        }

        const is_deleted = await db
            .delete(listings)
            .where(eq(listings.id, listing_id))
            .returning();

        if (!is_deleted || is_deleted.length === 0) {
            throw new DeleteFailedError(`Listing deletion was not successful.`);
        }

        return listing;
    }

    // Get all listings for a user based on their ID
    async getUserListings(
        user_id: string
    ): Promise<ListingRatesCompartments[]> {
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
    async getAllListings(): Promise<ListingRatesCompartments[]> {
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
