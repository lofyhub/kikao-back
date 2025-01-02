import passport from 'passport';
import userRepository from '../repository/userRepository';
import { AuthStrategy, Gender } from '../interfaces/user';
import { NewUser } from '../db/schema';
import env from '../env';

const GoogleStrategy = require('passport-google-oauth20').Strategy;

export interface GoogleProfile {
    id: string;
    displayName: string;
    name: {
        familyName: string | undefined;
        givenName: string;
    };
    emails: Array<{
        value: string;
        verified: boolean;
    }>;
    photos: Array<{
        value: string;
    }>;
    provider: string;
    _raw: string;
    _json: {
        sub: string;
        name: string;
        given_name: string;
        picture: string;
        email: string;
        email_verified: boolean;
    };
}

// google strategy for Passport
passport.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:9000/api/v1/oauth/google/callback',
            scope: ['profile', 'email']
        },
        verify
    )
);

async function verify(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: Function
) {
    if (
        !profile ||
        !profile.id ||
        !profile.displayName ||
        !profile.emails ||
        !profile.photos
    ) {
        console.error('Profile data is incomplete or missing.');
        return done(new Error('Profile data is incomplete.'));
    }

    const userProfile = {
        id: profile.id,
        username: profile.displayName,
        email: profile.emails[0]?.value,
        profileImage: profile.photos[0]?.value || '',
        provider: 'google',
        providerUserId: profile.id
    };

    try {
        const user_db = await userRepository.getUserByStrategyAndAccountId(
            AuthStrategy.Google,
            userProfile.id
        );

        if (user_db) {
            return done(null, user_db);
        } else {
            const newUser: NewUser = {
                email: profile.emails[0].value,
                username: profile.displayName,
                profileImage: profile.photos[0]?.value || '',
                provider: 'google',
                providerUserId: profile.id,
                kikaoType: 'tenant',
                phoneNumber: '',
                businessName: '',
                businessLocation: '',
                businessType: '',
                businessCity: '',
                providerPictureUrl: '',
                isLinked: true,
                gender: 'prefer not to say',
                businessLogo: ''
            };

            const created_user = await userRepository.createUser(newUser);

            if (created_user) {
                console.log('Created new user:', created_user);
                return done(null, created_user);
            } else {
                return done(new Error('Error creating new user'), false);
            }
        }
    } catch (error) {
        return done(error, false);
    }
}

export default passport;
