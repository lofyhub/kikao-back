export interface IUser {
    id: string;
    username: string;
    kikaoType: string;
    // TODO: make use of enums!
    gender: string;
    profileImage?: string | null;
    providerPictureUrl?: string | null;
    businessName?: string | null;
    businessLocation?: string | null;
    businessType?: string | null;
    businessCity?: string | null;
    businessLogo?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UserAttributes {
    last_login?: Date | null;
    is_linked: boolean;
    username: string;
    email: string;
    kikao_type: string;
    profile_image?: string | null;
    phone_number?: string | null;
    provider_user_id: string;
    provider_picture_url?: string | null;
    business_name?: string | null;
    business_location?: string | null;
    business_type?: string | null;
    business_city?: string | null;
    business_logo?: string | null;
}

export interface UserDbAttributes {
    id: string;
    created_at: Date;
    updated_at: Date;
    is_linked: boolean;
    username: string;
    email: string;
    kikao_type: string;
    profile_image?: string | null;
    phone_number?: string | null;
    provider_user_id: string;
    provider_picture_url?: string | null;
    business_name?: string | null;
    business_location?: string | null;
    business_type?: string | null;
    business_city?: string | null;
    business_logo?: string | null;
}

export enum AuthStrategy {
    Google = 'google',
    Twitter = 'twitter',
    Email = 'email',
    Apple = 'apple',
    Facebook = 'facebook'
}

export enum Gender {
    Male = 'male',
    Female = 'female',
    NonBinary = 'non-binary',
    PreferNotToSay = 'prefer not to say',
    Other = 'other'
}
