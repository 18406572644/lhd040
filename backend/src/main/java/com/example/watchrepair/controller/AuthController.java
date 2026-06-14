package com.example.watchrepair.controller;

import com.example.watchrepair.common.Result;
import com.example.watchrepair.dto.LoginRequest;
import com.example.watchrepair.dto.LoginResponse;
import com.example.watchrepair.dto.RegisterRequest;
import com.example.watchrepair.entity.SysUser;
import com.example.watchrepair.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success(response);
    }

    @PostMapping("/register")
    public Result<SysUser> register(@Valid @RequestBody RegisterRequest request) {
        SysUser user = authService.register(request);
        user.setPassword(null);
        return Result.success(user);
    }

    @GetMapping("/me")
    public Result<SysUser> getCurrentUser(Authentication authentication) {
        SysUser user = authService.getCurrentUser(authentication.getName());
        user.setPassword(null);
        return Result.success(user);
    }
}
