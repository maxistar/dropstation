package me.maxistar.dropstation.controller;

import me.maxistar.dropstation.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @PostMapping("/token")
    public Map<String, String> getToken(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String token = jwtService.generateToken(username);
        return Map.of("token", token);
    }
}
