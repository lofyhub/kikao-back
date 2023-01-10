import mongoose, { ConnectOptions } from 'mongoose';

const uri =
    'mongodb+srv://kikao:9zmZyT0ZMcTActQV@kikao.vsuckcx.mongodb.net/?retryWrites=true&w=majority';

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
} as ConnectOptions;

mongoose.set('strictQuery', true);

export const connection = mongoose.connect(uri, options);

export async function connectToServer() {
    mongoose.connect(uri, options, (error: any) => {
        if (error) {
            console.log('Error connecting to MongoDB:', error);
        }
        console.log('Successfully connected to MongoDB.');
    });
}
