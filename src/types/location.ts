export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: Date;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface AttendanceLocation {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
}
