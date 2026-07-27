import { IAIRequest } from './ai-request.interface';
import { IAIResponse } from './ai-response.interface';

export interface IAIProvider {
  readonly name: string;
  generate(request: IAIRequest): Promise<IAIResponse>;
  stream(request: IAIRequest): Promise<AsyncGenerator<IAIResponse>>;
  healthCheck(): Promise<boolean>;
}
