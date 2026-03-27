package com.academy.tretruau.domain.game;

import com.academy.tretruau.domain.player.State;
import com.academy.tretruau.domain.player.TempPlayer;
import com.academy.tretruau.domain.waitingroom.EnterRoomDTO;
import com.academy.tretruau.domain.waitingroom.WaitingRoom;
import com.academy.tretruau.domain.waitingroom.WaitingRoomsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.Optional;

@Service
public class GameService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private WaitingRoomsService waitingRoomsService;

    @Autowired
    private TaskScheduler taskScheduler;

    public void anyPlay(UpdateGameDTO updateGameDTO) {
        messagingTemplate.convertAndSend("/game/play/" + updateGameDTO.room(), updateGameDTO);

    }

    public void startGame(StartGameDTO startGameDTO) {

        Optional<WaitingRoom> room = waitingRoomsService.getRoomById(startGameDTO.room());
        room.ifPresent(waitingRoom -> {
            waitingRoom.setState(State.IN_GAME);
            room.get().setAlivePlayers(new ArrayList<>(room.get().getPlayers()));
            room.get().getPlayers().forEach(tempPlayer -> tempPlayer.setLinesSend(0));
        });

        messagingTemplate.convertAndSend("/game/start/" + startGameDTO.room(), new StartedGameDTO(startGameDTO.room(), startGameDTO.from(), waitingRoomsService.getRoomById(startGameDTO.room()).get().getPlayers()));
    }

    public void sendAttack(SendAttackDTO sendAttackDTO) {

        Optional<WaitingRoom> room = waitingRoomsService.getRoomById(sendAttackDTO.roomId());

        room.ifPresent(waitingRoom -> {
            for (TempPlayer tempPlayer : room.get().getPlayers()) {
                if (tempPlayer.getName().equals(sendAttackDTO.from())) {
                    tempPlayer.increaseLinesSend(sendAttackDTO.lines());
                    break;
                }
            }

            String randomPlayerUsername = room.get().getRandomPlayerExcludesFrom(sendAttackDTO.from()).getName();

            messagingTemplate.convertAndSend(
                    "/game/receive-attack/" + sendAttackDTO.roomId(),
                    new ReceiveAttackDTO(sendAttackDTO.from(), randomPlayerUsername, sendAttackDTO.lines())
            );
        });
    }

    public void eliminatePlayer(EliminatedDTO eliminatedDTO) {

        var waitingRoom = waitingRoomsService.getRoomById(eliminatedDTO.roomId());

        waitingRoom.ifPresent(room -> {
            room.getAlivePlayers().removeIf(tempPlayer -> {
                return tempPlayer.getName().equals(eliminatedDTO.player()) && room.getAlivePlayers().size() > 1;
            });

            messagingTemplate.convertAndSend(
                    "/game/eliminate/" + eliminatedDTO.roomId(),
                    new EliminationDTO(
                            eliminatedDTO.player(),
                            eliminatedDTO.roomId(),
                            waitingRoom.get().getAlivePlayers().stream().map(
                                    tempPlayer -> tempPlayer.getName()).toList()
                    )


            );

            waitingRoom.get().getPlayerByUsername(eliminatedDTO.player()).ifPresent(tempPlayer -> {
                tempPlayer.setLinesSend(eliminatedDTO.linesSend());
            });


            if (waitingRoom.get().getAlivePlayers().size() <= 1) {

                var winner = room.getPlayerByUsername(waitingRoom.get().getAlivePlayers().get(0).getName());

                winner.ifPresent(tempPlayer -> {

                    tempPlayer.increaseWins();
                    room.increaseMatchesPlayeds();

                    messagingTemplate.convertAndSend(
                            "/game/end/" + eliminatedDTO.roomId(),
                            new EndGameDTO(tempPlayer.getName(), room.getPlayers())
                    );
                });

                scheduleWaitingState(room, 12000);

            }

        });

    }

    public void scheduleWaitingState(WaitingRoom room, long delayMillis) {
        Date startTime = new Date(System.currentTimeMillis() + delayMillis);
        taskScheduler.schedule(() -> {
            room.setState(State.WAITING);
        }, startTime);
    }
}
