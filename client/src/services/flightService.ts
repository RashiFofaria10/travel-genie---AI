import API from "./api";

export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  price: number;
  currency: string;
  aircraft?: string;
  cabin?: string;
  bookingUrl?: string;
}

export interface FlightSearchResponse {
  success: boolean;
  from: string;
  to: string;
  departureDate?: string;
  returnDate?: string | null;
  count: number;
  flights: FlightOption[];
  bookingUrl?: string;
  message?: string;
}

export async function searchFlights(params: {
  from: string;
  to: string;
  departureDate?: string;
  returnDate?: string;
  adults?: number;
  travelClass?: string;
}): Promise<FlightSearchResponse> {
  const response = await API.post("/flights/search", params);
  return response.data;
}
