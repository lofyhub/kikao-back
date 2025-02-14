import { NextFunction, Request, Response, Router } from 'express';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import env from '../env';
import OpenAI from 'openai';
import { verifyJWTToken } from '../middlewares/verifyToken';
import { ErrorCodes, ValidationError, validationMessage } from '../errors';
import { z } from 'zod';

const router = Router();

const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY
});

const promptTextSchema = z.string();
async function generateDescription(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    try {
        const { promptText } = req.body;

        const promptValidation = promptTextSchema.safeParse(promptText);
        if (!promptValidation.success) {
            return next(
                new ValidationError(
                    validationMessage,
                    promptValidation.error.format()
                )
            );
        }

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
            .catch((err: unknown) => {
                const res_body = createErrorResponse(
                    'Failed to generate description',
                    ErrorCodes.APIError,
                    err as string
                );
                return res.status(400).json(res_body);
            });
    } catch (error: unknown) {
        return next(error);
    }
}

// Routes

router.post('/description', verifyJWTToken, generateDescription);

export default router;
