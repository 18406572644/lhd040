package com.example.watchrepair.service;

import com.example.watchrepair.common.BusinessException;
import com.example.watchrepair.dto.LoginRequest;
import com.example.watchrepair.dto.LoginResponse;
import com.example.watchrepair.dto.RegisterRequest;
import com.example.watchrepair.entity.Role;
import com.example.watchrepair.entity.SysUser;
import com.example.watchrepair.repository.SysUserRepository;
import com.example.watchrepair.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final SysUserRepository sysUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(SysUserRepository sysUserRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider) {
        this.sysUserRepository = sysUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SysUser user = sysUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("用户不存在"));

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name());

        return new LoginResponse(token, user.getUsername(), user.getRole().name(), user.getRealName());
    }

    public SysUser register(RegisterRequest request) {
        if (sysUserRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        SysUser user = new SysUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.TECHNICIAN);
        user.setRealName(request.getRealName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());

        return sysUserRepository.save(user);
    }

    public SysUser getCurrentUser(String username) {
        return sysUserRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("用户不存在"));
    }
}
