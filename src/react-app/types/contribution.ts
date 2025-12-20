/**
 * Generic contribution type for contribution calendar visualization
 * Can be used for any type of trackable activity (gym sessions, training, study sessions, etc.)
 */
export interface Contribution {
  date: string | Date;
  id?: string; // Optional unique identifier for the contribution
  category?: string; // Optional category for different types of contributions
}
