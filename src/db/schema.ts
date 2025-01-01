import {
    pgTable,
    unique,
    uuid,
    boolean,
    varchar,
    timestamp,
    foreignKey,
    text,
    integer,
    pgEnum
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

export const provider = pgEnum('provider', [
    'google',
    'apple',
    'facebook',
    'twitter',
    'email'
]);

export const users = pgTable(
    'users',
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        gender: text().notNull(),
        isLinked: boolean('is_linked').default(false).notNull(),
        username: varchar({ length: 255 }).notNull(),
        email: varchar({ length: 255 }).notNull(),
        kikaoType: varchar('kikao_type', { length: 50 }).notNull(),
        profileImage: varchar('profile_image', { length: 255 }),
        phoneNumber: varchar('phone_number', { length: 15 }),
        provider: provider(),
        providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
        providerPictureUrl: varchar('provider_picture_url', { length: 255 }),
        businessName: varchar('business_name', { length: 255 }),
        businessLocation: varchar('business_location', { length: 255 }),
        businessType: varchar('business_type', { length: 255 }),
        businessCity: varchar('business_city', { length: 255 }),
        businessLogo: varchar('business_logo', { length: 255 }),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull()
    },
    (table) => [
        unique('users_username_unique').on(table.username),
        unique('users_email_unique').on(table.email)
    ]
);

export const bookmarks = pgTable(
    'bookmarks',
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        listingId: uuid('listing_id').notNull(),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull()
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'bookmarks_user_id_users_id_fk'
        }),
        foreignKey({
            columns: [table.listingId],
            foreignColumns: [listings.id],
            name: 'bookmarks_listing_id_listings_id_fk'
        })
    ]
);

export const listings = pgTable(
    'listings',
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        name: varchar({ length: 255 }).notNull(),
        location: varchar({ length: 255 }).notNull(),
        county: varchar({ length: 255 }).notNull(),
        status: varchar({ length: 50 }).notNull(),
        yearBuilt: varchar('year_built').notNull(),
        description: text().notNull(),
        images: text().array().default(['']).notNull(),
        size: varchar({ length: 255 }).notNull(),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull(),
        userId: uuid('user_id').notNull()
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'listings_user_id_users_id_fk'
        })
    ]
);

export const reviews = pgTable(
    'reviews',
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        reviewText: text('review_text').notNull(),
        rating: integer().notNull(),
        listingId: uuid('listing_id').notNull(),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull()
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'reviews_user_id_users_id_fk'
        }),
        foreignKey({
            columns: [table.listingId],
            foreignColumns: [listings.id],
            name: 'reviews_listing_id_listings_id_fk'
        })
    ]
);

export const compartments = pgTable(
    'compartments',
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        listingId: uuid('listing_id').notNull(),
        bedrooms: integer().notNull(),
        totalRooms: text('total_rooms').notNull(),
        washRooms: integer('wash_rooms').notNull(),
        parking: boolean().notNull(),
        roomNumber: boolean('room_number').notNull(),
        security: boolean().notNull(),
        garbageCollection: boolean('garbage_collection').notNull(),
        wifi: boolean().notNull(),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull()
    },
    (table) => [
        foreignKey({
            columns: [table.listingId],
            foreignColumns: [listings.id],
            name: 'compartments_listing_id_listings_id_fk'
        })
    ]
);

export const rates = pgTable(
    'rates',
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        listingId: uuid('listing_id').notNull(),
        price: integer().notNull(),
        duration: text().notNull(),
        countryCode: text('country_code').notNull(),
        createdAt: timestamp('created_at', { mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .defaultNow()
            .notNull()
    },
    (table) => [
        foreignKey({
            columns: [table.listingId],
            foreignColumns: [listings.id],
            name: 'rates_listing_id_listings_id_fk'
        })
    ]
);

// Types
export type NewUser = typeof users.$inferInsert;
export type NewBookmark = typeof bookmarks.$inferInsert;
export type NewListing = typeof listings.$inferInsert;
export type NewCompartment = typeof compartments.$inferInsert;
export type NewRate = typeof rates.$inferInsert;
export type NewReview = typeof reviews.$inferInsert;

export const UserSelect = createSelectSchema(users);
export const BookmarkSelect = createSelectSchema(bookmarks);
export const ListingSelect = createSelectSchema(listings);
export const CompartmentSelect = createSelectSchema(compartments);
export const RateSelect = createSelectSchema(rates);
export const ReviewSelect = createSelectSchema(reviews);

export type User = typeof users.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Compartment = typeof compartments.$inferSelect;
export type Rate = typeof rates.$inferSelect;
export type Review = typeof reviews.$inferSelect;
