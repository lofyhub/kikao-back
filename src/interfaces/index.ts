import * as z from 'zod';
import { ObjectID } from 'bson';
import { number, string, object, size } from 'superstruct';

export const schema = z.object({
    title: z.string().min(4).nonempty().max(50),
    Id: z.string().min(10).nonempty(),
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

export interface IUser {
    userId: string;
    username: string;
    email: string;
    kikaoType: string;
    password: string;
    profileImage: string;
    date: Date;
    phone: string;
    business: {
        name: string;
        location: string;
        businessType: string;
        city: string;
    };
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
    _id: ObjectID;
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

export interface IDB extends IUser, IRole {
    user: IUser;
    mongoose: any;
    role: IRole;
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

export interface houseSchema {
    id: string;
    userId: string;
    name: string;
    location: string;
    county: string;
    images: string[];
    rate: {
        price: number;
        duration: string;
        countryCode: string;
    };
    compartments: {
        bedrooms: number;
        totalRooms: string;
        washRooms: number;
        parking: boolean;
        roomNumber: boolean;
        security: boolean;
        garbageCollection: boolean;
        WIFI: boolean;
    };
    size: string;
    createdAt: Date;
    status: string;
    yearBuild: string;
    description: string;
}

export interface Ipayload {
    userId: string;
    email: string;
}

export interface ExtendedHouseSchema extends houseSchema {
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

type ObjectId = ObjectID;

export type userPublisher = {
    _id: ObjectId;
    userId: string;
    username: string;
    email: string;
    kikaoType: string;
    date: Date;
    password: string;
    profileImage: string;
    phone: string;
    business: {
        name: string;
        location: string;
        businessType: string;
        city: string;
    };
};

export type UserPublisherWithoutPassword = Omit<userPublisher, 'password'>;

export const reviewSchema = object({
    house_id: size(string(), 10, 30),
    name: size(string(), 4, 30),
    user_id: size(string(), 10, 30),
    rating: size(number(), 1, 5),
    comment: size(string(), 10, 200),
    listing_author_id: size(string(), 10, 30)
});
