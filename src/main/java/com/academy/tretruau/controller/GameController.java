package com.academy.tretruau.controller;

import com.academy.tretruau.domain.game.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
public class GameController {

    @Autowired
    private GameService gameService;

    @MessageMapping("/game")
    public void anyPlay(@Payload UpdateGameDTO updateGameDTO) {
        gameService.anyPlay(updateGameDTO);

    }

    @MessageMapping("/game/start")
    public void startGame(@Payload StartGameDTO startGameDTO) {
        gameService.startGame(startGameDTO);

    }

    @MessageMapping("/game/eliminated")
    public void endGame(@Payload EliminatedDTO eliminatedDTO) {
        System.out.println(eliminatedDTO);
        gameService.eliminatePlayer(eliminatedDTO);
    }

    @MessageMapping("/game/send-attack")
    public void sendAttack(@Payload SendAttackDTO sendAttackDTO) {
        gameService.sendAttack(sendAttackDTO);

    }





}
