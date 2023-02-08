import { NextFunction, Request, Response, Router } from 'express';

import { rateLimit } from 'express-rate-limit';
import { verifyToken } from '../middlewares/verifyToken';
import env from '../env';
import { Configuration, OpenAIApi } from 'openai';

const router = Router();

async function generateDescription(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { promptText } = req.body;

        const configuration = new Configuration({
            organization: 'org-Csb4DGqxXebW9eOD4Wpba6Os',
            apiKey: env.OPENAI_API_KEY
        });
        const openai = new OpenAIApi(configuration);

        await openai
            .createCompletion({
                model: 'text-davinci-003',
                prompt: promptText,
                temperature: 0.9,
                max_tokens: 800,
                stop: null
            })
            .then((response) => {
                console.log(response.data.choices[0].text);
                return res
                    .status(200)
                    .json({ generatedText: response.data.choices[0].text });
            })
            .catch((err) => {
                return res
                    .status(400)
                    .json({ message: err.message, error: err });
            });
    } catch (error) {
        return next(error);
    }
}

// Routes

router.post(
    '/description',
    rateLimit({
        windowMs: 1000,
        max: 1
    }),
    verifyToken,
    generateDescription
);

export default router;
