import * as z from 'zod';

export const listingSchema = z.object({
    title: z.string().min(4).nonempty().max(50),
    location: z.string().min(4).nonempty().max(50),
    price: z.number().min(0),
    bedrooms: z.string().nonempty(),
    duration: z.string().nonempty(),
    size: z.string().nonempty(),
    washrooms: z.number().min(0),
    totalrooms: z.number().min(0),
    county: z.string().min(4).nonempty(),
    parking: z.boolean(),
    wifi: z.boolean(),
    garbagecollection: z.boolean(),
    roomnumber: z.boolean(),
    description: z.string().min(20).nonempty(),
    security: z.boolean(),
    year: z.string().min(4).max(4).regex(/^\S*$/)
});

export interface IResponse {
    isSuccess: boolean;
    message: string;
    statusCode: number;
}
export interface ICloudinaryResponse extends IResponse {
    imageURL?: string;
}

export interface ICloudinary {
    uploadImage: (imageToUpload: string) => Promise<ICloudinaryResponse>;
}

export interface IRole {
    name: string;
}

export interface JwtPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}
export interface IUserSignIn {
    _id: string;
    userId: string;
    username: string;
    email: string;
    regDate: Date;
    kikaotype: string;
    telNumber: string;
}

export interface IAuthResponse {
    auth: boolean;
    token: string;
    user: IUserSignIn;
}

export interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

export type HouseSchema = {
    id: string;
    user_id: string;
    name: string;
    location: string;
    county: string;
    images: string[];
    rates: Rate;
    compartments: Compartments;
    size: string;
    status: string;
    year_built: string;
    description: string;
    created_at: Date;
    updated_at: Date;
};

export interface Rate {
    price: number;
    duration: string;
    countryCode: string;
    listing_id: string;
}

export interface Compartments {
    listing_id: string;
    bedrooms: number;
    totalRooms: string;
    washRooms: number;
    parking: boolean;
    roomNumber: boolean;
    security: boolean;
    garbageCollection: boolean;
    wifi: boolean;
}

export interface Ipayload {
    user_id: string;
    email: string;
}

export interface ExtendedHouseSchema extends HouseSchema {
    _id: string;
}
export interface booking {
    bookedBy: string;
    bookedListing: string;
    bookingFor: string;
    telephoneNumber: number;
    selectedDate: string;
    selectTime: string;
    bookedById: string;
}

export type userPublisher = {
    _id: string;
    userId: string;
    username: string;
    email: string;
    kikaoType: string;
    date: Date;
    password: string;
    profileImage: string;
    phone: string;
    gender: 'male' | 'female' | 'other' | 'unknown';
    business_name: string;
    business_location: string;
    business_type: string;
    business_city: string;
};

export type UserPublisherWithoutPassword = Omit<userPublisher, 'password'>;

export interface IReview {
    house_id: string;
    name: string;
    user_id: string;
    rating: number;
    comment: string;
    listing_author_id: string;
}

export interface JWTUserPayload {
    id: string;
    username: string;
    email: string;
    providerID: string;
    profileImage: string | null;
    provider: string;
    iat: number; // Issued at time
    exp?: number; // Optional expiration time
}
