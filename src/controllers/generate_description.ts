import { NextFunction, Request, Response, Router } from 'express';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import env from '../env';
import OpenAI from 'openai';

const router = Router();

const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY
});

async function generateDescription(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    try {
        const { promptText } = req.body;

        await client.chat.completions
            .create({
                messages: [{ role: 'user', content: promptText }],
                model: 'gpt-4o'
            })
            .then((response: any) => {
                const res_body = createSuccessResponse(
                    'Generated description successfully ',
                    response.choices[0].message
                );
                return res.status(200).json(res_body);
            })
            .catch((err: any) => {
                const res_body = createErrorResponse(
                    'Failed to generate description',
                    err as string
                );
                return res.status(400).json(res_body);
            });
    } catch (error: any) {
        return next(error);
    }
}

// Routes

router.post('/description', generateDescription);

export default router;
