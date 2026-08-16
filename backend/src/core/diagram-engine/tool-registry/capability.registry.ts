import { Injectable, Logger } from '@nestjs/common';
import { CapabilityDefinition } from './capability.definition';

@Injectable()
export class CapabilityRegistry {
  private readonly capabilities = new Map<string, CapabilityDefinition>();
  private readonly logger = new Logger(CapabilityRegistry.name);

  /**
   * Registers a capability definition.
   * Throws an error on duplicate registration.
   */
  register(cap: CapabilityDefinition): void {
    const key = cap.id.toLowerCase();
    if (this.capabilities.has(key)) {
      throw new Error(`Duplicate capability registration detected: '${cap.id}'`);
    }
    this.capabilities.set(key, cap);
    this.logger.log(`Registered capability: ${cap.displayName} (${cap.id})`);
  }

  /**
   * Retrieves a capability definition by ID.
   */
  get(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id.toLowerCase());
  }

  /**
   * Returns all registered capability definitions.
   */
  getAll(): CapabilityDefinition[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Checks if a capability with the specified ID exists in the registry.
   */
  exists(id: string): boolean {
    return this.capabilities.has(id.toLowerCase());
  }

  /**
   * Unregisters a capability definition by ID.
   */
  unregister(id: string): boolean {
    const key = id.toLowerCase();
    const existed = this.capabilities.has(key);
    this.capabilities.delete(key);
    return existed;
  }
}
