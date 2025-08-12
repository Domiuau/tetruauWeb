package com.academy.tretruau.config;

import com.academy.tretruau.domain.player.Player;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Component
public class TokenService {

    public String generateToken(Player user) {

        try {

            Algorithm algorithm = Algorithm.HMAC256("carro");
            String token = JWT.create()
                    .withIssuer("niceGraphs")
                    .withSubject(user.getUsername())
                    .withExpiresAt(generateExpirationDate())
                    .sign(algorithm);

            return token;

        } catch (JWTCreationException e) {
            throw new RuntimeException("Erro ao criar tokenh " + e.getMessage());
        }

    }

    public String validateToken(String token) {

        try {
            Algorithm algorithm = Algorithm.HMAC256("carro");
            return JWT.require(algorithm)
                    .withIssuer("niceGraphs")
                    .build()
                    .verify(token)
                    .getSubject();


        } catch (JWTVerificationException e) {
            return "";
        }
    }

    public Instant generateExpirationDate() {
        return LocalDateTime.now().plusHours(720).toInstant(ZoneOffset.of("-03:00"));
    }
}
