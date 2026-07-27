import { HttpException, HttpStatus } from '@nestjs/common';

export class AIValidationException extends HttpException {
  constructor(category: string, errors: any, rawResponse: string) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'AI Validation Failure',
        message: `Structured validation check failed for category '${category}' schema.`,
        errors,
        rawResponse,
      },
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }
}
