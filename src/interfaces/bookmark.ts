export interface IBookmark {
    user_id: string;
    listing_id: string;
}

export interface IDBBookmark {
    id: string;
    userId: string;
    listingId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ResponseGetBookmarks {
    bookmarks: IDBBookmark[];
    count: number;
}
