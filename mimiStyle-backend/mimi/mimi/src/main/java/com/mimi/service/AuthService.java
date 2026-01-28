package com.mimi.service;

import com.mimi.dto.request.LoginRequest;
import com.mimi.dto.request.RegisterRequest;
import com.mimi.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    UserResponse login(LoginRequest request);
}

