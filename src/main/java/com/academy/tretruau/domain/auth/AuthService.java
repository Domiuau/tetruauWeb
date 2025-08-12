package com.academy.tretruau.domain.auth;

import com.academy.tretruau.config.TokenService;
import com.academy.tretruau.domain.ErrorDTO;
import com.academy.tretruau.domain.player.Player;
import com.academy.tretruau.domain.player.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private TokenService tokenService;

    public ResponseEntity<?> login(LoginDTO loginDTO) {

        try {
            var userNamePassword = new UsernamePasswordAuthenticationToken(loginDTO.username(), loginDTO.password());
            var auth = authenticationManager.authenticate(userNamePassword);
            var token = tokenService.generateToken((Player) auth.getPrincipal());

            return ((Player) auth.getPrincipal()).isEnabled() ?
                    ResponseEntity.ok(new LoggedPlayerDTO(((Player) auth.getPrincipal()).getUsername(), token))
                    :
                    ResponseEntity.badRequest().body(new ErrorDTO("Sua conta está desativada", "Entre em contato com o suporte para reativar sua conta"));
        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest().body(new ErrorDTO("Credenciais invalidas", "Verifique suas credenciais e tente novamente"));

        }

    }

    public ResponseEntity<?> register(RegisterDTO registerDTO) {

        String encryptedPassword = new BCryptPasswordEncoder().encode(registerDTO.password());
        Player player = new Player(registerDTO.username(), encryptedPassword);
        playerRepository.save(player);

        var token = tokenService.generateToken(player);

        return ResponseEntity.ok(new LoggedPlayerDTO(player.getUsername(), token));


    }
}
