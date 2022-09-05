export interface Admin {
  iso_3166_1: string;
}

export interface MapboxStreetsV8 {
  class: string;
}

export interface Lane {
  indications: string[];
  valid: boolean;
  active: boolean;
  valid_indication: string;
}

export interface TollCollection {
  type: string;
}

export interface Intersection {
  entry: boolean[];
  bearings: number[];
  duration: number;
  mapbox_streets_v8: MapboxStreetsV8;
  is_urban: boolean;
  admin_index: number;
  out: number;
  weight: number;
  geometry_index: number;
  location: number[];
  in?: number;
  turn_weight?: number;
  turn_duration?: number;
  traffic_signal?: boolean;
  lanes: Lane[];
  classes: string[];
  toll_collection: TollCollection;
}

export interface Maneuver {
  type: string;
  instruction: string;
  bearing_after: number;
  bearing_before: number;
  location: number[];
  exit?: number;
  modifier: string;
}

export interface Step {
  intersections: Intersection[];
  maneuver: Maneuver;
  name: string;
  duration: number;
  distance: number;
  driving_side: string;
  weight: number;
  mode: string;
  geometry: string;
  destinations: string;
  ref: string;
}

export interface Leg {
  via_waypoints: any[];
  admins: Admin[];
  weight: number;
  duration: number;
  steps: Step[];
  distance: number;
  summary: string;
}

export interface Route {
  country_crossed: boolean;
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
  legs: Leg[];
  geometry: string;
}

export interface Path {
  route: Route[];
}
