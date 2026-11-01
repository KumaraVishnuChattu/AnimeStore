package com.animestore.dto;

import java.time.LocalDateTime;

public class AuthResponse {

    private boolean success;
    private String message;
    private String token;
    private Long id;
    private String email;
    private String mobileNumber;
    private LocalDateTime createdAt;

    public AuthResponse() {
    }

    public AuthResponse(boolean success, String message, String token, Long id, String email, String mobileNumber, LocalDateTime createdAt) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.id = id;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.createdAt = createdAt;
    }

    public static AuthResponse error(String message) {
        AuthResponse res = new AuthResponse();
        res.setSuccess(false);
        res.setMessage(message);
        return res;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
