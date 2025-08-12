package com.academy.tretruau.domain.waitingroom;

import com.academy.tretruau.domain.chat.RoomChatDTO;
import com.academy.tretruau.domain.player.State;
import com.academy.tretruau.domain.player.TempPlayer;
import com.academy.tretruau.domain.player.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class WaitingRoomsService {

    @Autowired
    private PlayerRepository playerRepository;

    private List<WaitingRoom> waitingRooms = new ArrayList<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;



    public ResponseEntity<CreatedRoomDTO> createWaitingRoom(CreateRoomDTO createRoomDTO) {
        WaitingRoom waitingRoom = new WaitingRoom(createRoomDTO.playerLimit(), createRoomDTO.name());
        waitingRooms.add(waitingRoom);
        return ResponseEntity.ok(new CreatedRoomDTO(waitingRoom.getId()));
    }

    public void sendMessageRoomChat(RoomChatDTO roomChatDTO) {

        System.out.println(roomChatDTO);

        Optional<WaitingRoom> waitingRoom = getRoomById(roomChatDTO.room());
        waitingRoom.ifPresent(room -> {
            messagingTemplate.convertAndSend("/room/chat/" + room.getId(), roomChatDTO);
        });


    }

    public void addPlayer(EnterRoomDTO enterRoomDTO) {

        Optional<WaitingRoom> waitingRoom = getRoomById(enterRoomDTO.roomId());

        waitingRoom.ifPresent(room -> {

            boolean addPlayer = true;

            System.out.println("tamanho lista player " + waitingRoom.get().getPlayers());

            for (TempPlayer tempPlayer : waitingRoom.get().getPlayers()) {

                System.out.println(tempPlayer.getName() + " igual a " + enterRoomDTO.playerName());

                if (tempPlayer.getName().equals(enterRoomDTO.playerName())) {
                    addPlayer = false;
                    break;
                }
            }

            TempPlayer tempPlayer = new TempPlayer(enterRoomDTO.playerName());

            if (addPlayer) {
                System.out.println("adicionando " + tempPlayer);
                waitingRoom.get().addPlayer(tempPlayer);
            }

            messagingTemplate.convertAndSend("/room/" + enterRoomDTO.roomId(),
                    new RoomActionDTO(RoomAction.JOIN, tempPlayer.getName(), 0L, waitingRoom.get().getPlayeds(), waitingRoom.get().getPlayers()));
        });

    }

    public void removePlayer(String username) {

        Optional<WaitingRoom> waitingRoom = getRoomByUsername(username);

        waitingRoom.ifPresent(room -> {

            if (waitingRoom.get().getState() != State.IN_GAME) {
                System.out.println("removendo player " + username + " " + waitingRoom.get().getState());
                room.removePlayer(username);
                messagingTemplate.convertAndSend("/room/" + waitingRoom.get().getId(),
                        new RoomActionDTO(RoomAction.EXIT, username, 0L, waitingRoom.get().getPlayeds(), waitingRoom.get().getPlayers()));

                if (waitingRoom.get().getPlayers().isEmpty()) {
                    // excluir sala se esla estiver vazia
                    //    waitingRooms.remove(waitingRoom.get());
                }
            }

        });

    }

    public Optional<WaitingRoom> getRoomById(String id) {

        System.out.println("ids das rooms");

        waitingRooms.forEach(waitingRoom -> System.out.println(waitingRoom.getId()));

        for (WaitingRoom waitingRoom : waitingRooms) {
            if (waitingRoom.getId().equals(id)) {
                return Optional.of(waitingRoom);
            }
        }

        return Optional.empty();

    }

    public Optional<WaitingRoom> getRoomByUsername(String username) {

        for (WaitingRoom waitingRoom : waitingRooms) {
            for (TempPlayer tempPlayer : waitingRoom.getPlayers()) {
                if (tempPlayer.getName().equals(username)) {
                    return Optional.of(waitingRoom);
                }
            }
        }

        return Optional.empty();

    }

    public ResponseEntity<AvailablesWaitingRoomsDTO> getAvailableRooms() {

        return ResponseEntity.ok(
                new AvailablesWaitingRoomsDTO(waitingRooms.stream().map(waitingRoom ->
                        new AvailableWaitingRoomDTO(waitingRoom.getId(), waitingRoom.getName(), waitingRoom.getPlayers().size(), waitingRoom.getPlayersLimit())).toList()));


    }


}
