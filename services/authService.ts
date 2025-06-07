import axios from 'axios';
import {LoginRequestDto} from "@/dto/LoginRequest.dto";
import {JwtResponseDto} from "@/dto/JwtResponse.dto";

const API_URL = 'http://localhost:8080/api/auth/';

class AuthService {
    login(loginRequest: LoginRequestDto): Promise<JwtResponseDto> {
        return axios
            .post<JwtResponseDto>(API_URL + 'login', loginRequest)
            .then((response) => {
                if (response.data.token) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                }
                return response.data;
            });
    }

    logout(): void {
        localStorage.removeItem('user');
    }

    getCurrentUser(): JwtResponseDto | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    getToken(): string | null {
        const user = this.getCurrentUser();
        return user?.token || null;
    }
}

export default new AuthService();
