export interface IUser {
    userId: string;
    username: string;
    email: string;
    kikaoType: string;
    password: string;
    date: Date;
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

export interface houseSchema {
    id: string;
    userId: string;
    name: string;
    location: string;
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
