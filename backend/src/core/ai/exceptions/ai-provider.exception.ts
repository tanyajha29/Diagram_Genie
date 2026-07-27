import { HttpException, HttpStatus } from '@nestjs/common';

export class AiProviderException extends HttpException {
  constructor(provider: string, message: string, rawError?: any) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        error: 'AI Provider Failure',
        message: `AI provider '${provider}' request execution failed: ${message}`,
        rawError,
      },
      HttpStatus.BAD_GATEWAY
    );
  }
}
