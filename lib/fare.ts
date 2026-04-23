export const BASE_FARE_CENTS = 5000;
export const PASSENGER_FARE_CENTS = 1000;
export const LUGGAGE_FARE_CENTS = 500;

export function calculateFareCents(passengers: number, luggage: number) {
  return (
    BASE_FARE_CENTS +
    passengers * PASSENGER_FARE_CENTS +
    luggage * LUGGAGE_FARE_CENTS
  );
}
