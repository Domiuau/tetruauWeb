package com.academy.tretruau.controller;

import com.academy.tretruau.domain.chat.RoomChatDTO;
import com.academy.tretruau.domain.waitingroom.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
public class WaitingRoomController {

    private WaitingRoomsService waitingRoomsService;

    @Autowired
    public WaitingRoomController(WaitingRoomsService waitingRoomsService) {
        this.waitingRoomsService = waitingRoomsService;
    }

    @PostMapping("/room/create")
    @ResponseBody
    @CrossOrigin
    public ResponseEntity<CreatedRoomDTO> createRoom(@RequestBody CreateRoomDTO createRoomDTO) {
        return waitingRoomsService.createWaitingRoom(createRoomDTO);
    }



    @MessageMapping("/room")
    public void connectRoom(@Payload EnterRoomDTO enterRoomDTO) {

        waitingRoomsService.addPlayer(enterRoomDTO);

    }

    @MessageMapping("/room/chat")
    public void chatRoom(@Payload RoomChatDTO roomChatDTO) {

        waitingRoomsService.sendMessageRoomChat(roomChatDTO);

    }

    @GetMapping("/room/availables")
    @ResponseBody
    @CrossOrigin
    public ResponseEntity<AvailablesWaitingRoomsDTO> getAvailableRooms() {
        return waitingRoomsService.getAvailableRooms();
    }



}
