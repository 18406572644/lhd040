package com.example.watchrepair.dto;

public class LoginResponse {

    private String token;
    private String username;
    private String role;
    private String realName;

    public LoginResponse() {
    }

    public LoginResponse(String token, String username, String role, String realName) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.realName = realName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }
}
