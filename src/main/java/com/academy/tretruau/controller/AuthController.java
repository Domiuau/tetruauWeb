package com.academy.tretruau.controller;
import com.academy.tretruau.config.TokenService;
import com.academy.tretruau.domain.ErrorDTO;
import com.academy.tretruau.domain.auth.AuthService;
import com.academy.tretruau.domain.auth.LoggedPlayerDTO;
import com.academy.tretruau.domain.auth.LoginDTO;
import com.academy.tretruau.domain.auth.RegisterDTO;
import com.academy.tretruau.domain.player.Player;
import com.academy.tretruau.domain.player.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login") @CrossOrigin
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        return authService.login(loginDTO);
    }

    @PostMapping("/register") @CrossOrigin
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) {
        return authService.register(registerDTO);


    }


}
