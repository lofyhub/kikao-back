import { ObjectID } from 'bson';

export interface IUser {
    userId: string;
    username: string;
    email: string;
    kikaoType: string;
    password: string;
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

export interface IDB extends IUser, IRole {
    user: IUser;
    mongoose: any;
    role: IRole;
}
interface imageObject {
    file: {
        data: Buffer;
        contentType: string;
    };
    fileName: string;
}

export interface houseSchema {
    id: string;
    userId: string;
    name: string;
    location: string;
    county: string;
    images: string[] | imageObject[];
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
    };
    size: string;
    createdAt: Date;
    status: string;
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
    username: string;
    userId: string;
    teleNumber: string;
    email: string;
    regDate: Date;
    kikaoType: string;
};
