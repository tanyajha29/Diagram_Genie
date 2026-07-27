import { IAIRequest } from './ai-request.interface';
import { IAIResponse } from './ai-response.interface';

export interface IAIService {
  generate(request: IAIRequest, providerName?: string): Promise<IAIResponse>;
  stream(request: IAIRequest, providerName?: string): Promise<AsyncGenerator<IAIResponse>>;
  healthCheck(providerName?: string): Promise<boolean>;
}
