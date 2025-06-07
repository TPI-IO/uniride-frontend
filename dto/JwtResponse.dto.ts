export interface JwtResponseDto {
    token: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
}