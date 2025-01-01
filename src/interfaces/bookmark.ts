export interface IBookmark {
    user_id: string;
    listing_id: string;
}

export interface IDBBookmark {
    id: string;
    user_id: string;
    listing_id: string;
    created_at: Date;
    updated_at: Date;
}
