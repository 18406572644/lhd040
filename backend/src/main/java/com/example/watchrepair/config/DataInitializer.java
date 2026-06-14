package com.example.watchrepair.config;

import com.example.watchrepair.entity.Role;
import com.example.watchrepair.entity.SysUser;
import com.example.watchrepair.repository.SysUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final SysUserRepository sysUserRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(SysUserRepository sysUserRepository, PasswordEncoder passwordEncoder) {
        this.sysUserRepository = sysUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createUserIfNotExists("admin", "admin123", Role.ADMIN, "系统管理员", "13800000001", "admin@clockrepair.com");
        createUserIfNotExists("tech_zhang", "123456", Role.TECHNICIAN, "张师傅", "13800000003", null);
        createUserIfNotExists("receptionist", "123456", Role.RECEPTIONIST, "前台小刘", "13800000005", null);
        createUserIfNotExists("manager", "123456", Role.MANAGER, "王经理", "13800000002", null);
    }

    private void createUserIfNotExists(String username, String password, Role role, String realName, String phone, String email) {
        try {
            if (!sysUserRepository.existsByUsername(username)) {
                SysUser user = new SysUser();
                user.setUsername(username);
                user.setPassword(passwordEncoder.encode(password));
                user.setRole(role);
                user.setRealName(realName);
                user.setPhone(phone);
                if (email != null) {
                    user.setEmail(email);
                }
                sysUserRepository.save(user);
                log.info("已初始化用户账号: {} / {}", username, password);
            }
        } catch (Exception e) {
            log.warn("初始化用户 {} 失败: {}", username, e.getMessage());
        }
    }
}
