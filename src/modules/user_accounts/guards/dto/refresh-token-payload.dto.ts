export class RefreshTokenPayloadDto {
  id: string;
  login: string;
  deviceId: string;
  iat: number;
  exp: number;
}
