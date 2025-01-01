export interface IUser {
    id: string;
    last_login?: string | null;
    is_linked: boolean;
    username: string;
    email: string;
    kikao_type: string;
    gender: Gender;
    profile_image?: string | null;
    phone_number?: string | null;
    provider: string;
    provider_user_id: string;
    provider_picture_url?: string | null;
    business_name?: string | null;
    business_location?: string | null;
    business_type?: string | null;
    business_city?: string | null;
    business_logo?: string | null;
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
