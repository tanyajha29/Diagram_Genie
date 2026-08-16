/**
 * Metadata definition for a visual or structural diagram capability.
 */
export interface CapabilityDefinition {
  /** Unique capability identifier (e.g. 'architecture', 'database') */
  id: string;
  
  /** Short display name for visual presentation */
  displayName: string;
  
  /** Explanation of what the capability represents */
  description: string;
  
  /** Broad classification category (e.g. 'UML', 'Design') */
  category: string;
}
