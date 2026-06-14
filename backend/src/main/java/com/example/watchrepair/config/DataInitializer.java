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
        if (!sysUserRepository.existsByUsername("admin")) {
            SysUser admin = new SysUser();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setRealName("系统管理员");
            admin.setPhone("13800000001");
            admin.setEmail("admin@clockrepair.com");
            sysUserRepository.save(admin);
            log.info("已初始化管理员账号: admin / admin123");
        }

        if (!sysUserRepository.existsByUsername("tech_zhang")) {
            SysUser tech = new SysUser();
            tech.setUsername("tech_zhang");
            tech.setPassword(passwordEncoder.encode("123456"));
            tech.setRole(Role.TECHNICIAN);
            tech.setRealName("张师傅");
            tech.setPhone("13800000003");
            sysUserRepository.save(tech);
            log.info("已初始化技师账号: tech_zhang / 123456");
        }

        if (!sysUserRepository.existsByUsername("receptionist")) {
            SysUser receptionist = new SysUser();
            receptionist.setUsername("receptionist");
            receptionist.setPassword(passwordEncoder.encode("123456"));
            receptionist.setRole(Role.RECEPTIONIST);
            receptionist.setRealName("前台小刘");
            receptionist.setPhone("13800000005");
            sysUserRepository.save(receptionist);
            log.info("已初始化前台账号: receptionist / 123456");
        }

        if (!sysUserRepository.existsByUsername("manager")) {
            SysUser manager = new SysUser();
            manager.setUsername("manager");
            manager.setPassword(passwordEncoder.encode("123456"));
            manager.setRole(Role.MANAGER);
            manager.setRealName("王经理");
            manager.setPhone("13800000002");
            sysUserRepository.save(manager);
            log.info("已初始化经理账号: manager / 123456");
        }
    }
}
