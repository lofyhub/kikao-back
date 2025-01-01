import { relations } from 'drizzle-orm/relations';
import {
    users,
    bookmarks,
    listings,
    reviews,
    compartments,
    rates
} from './schema';

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
    user: one(users, {
        fields: [bookmarks.userId],
        references: [users.id]
    }),
    listing: one(listings, {
        fields: [bookmarks.listingId],
        references: [listings.id]
    })
}));

export const usersRelations = relations(users, ({ many }) => ({
    bookmarks: many(bookmarks),
    listings: many(listings),
    reviews: many(reviews)
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
    bookmarks: many(bookmarks),
    user: one(users, {
        fields: [listings.userId],
        references: [users.id]
    }),
    reviews: many(reviews),
    compartments: many(compartments),
    rates: many(rates)
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
    user: one(users, {
        fields: [reviews.userId],
        references: [users.id]
    }),
    listing: one(listings, {
        fields: [reviews.listingId],
        references: [listings.id]
    })
}));

export const compartmentsRelations = relations(compartments, ({ one }) => ({
    listing: one(listings, {
        fields: [compartments.listingId],
        references: [listings.id]
    })
}));

export const ratesRelations = relations(rates, ({ one }) => ({
    listing: one(listings, {
        fields: [rates.listingId],
        references: [listings.id]
    })
}));
