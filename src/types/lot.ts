export interface ProductLot {
  id: string;
  code: string;
  name: string;
  category: string | null;
  variety: string | null;
  harvest_year: string | null;
  quantity: number | null;
  unit: string | null;
  seals_quantity?: number | null;
  image_url: string | null;
  producer_id: string | null; // Pode ser null para blends
  fragrance_score: number | null;
  flavor_score: number | null;
  finish_score: number | null;
  acidity_score: number | null;
  body_score: number | null;
  sensory_notes: string | null;
  created_at: string;
  producers: {
    id: string;
    name: string;
    property_name: string;
    city: string;
    state: string;
  } | null; // Pode ser null para blends
  components?: Array<{
    id: string;
    component_name: string;
    component_percentage: number;
    producers: {
      id: string;
      name: string;
      property_name: string;
      city: string;
      state: string;
    } | null;
    associations: {
      id: string;
      name: string;
      type: string;
    } | null;
  }>;
  lot_components?: Array<{
    id: string;
    component_name: string;
    component_percentage: number;
    producers: {
      id: string;
      name: string;
      property_name: string;
      city: string;
      state: string;
    } | null;
    associations: {
      id: string;
      name: string;
      type: string;
    } | null;
  }>;
  lot_observations?: string | null;
  youtube_video_url?: string | null;
  video_delay_seconds?: number | null;
  characteristics?: Array<{
    id: string;
    characteristic_id: string;
    value: string;
    characteristics: {
      id: string;
      name: string;
    };
  }>;
}
