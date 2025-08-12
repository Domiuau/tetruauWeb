package com.academy.tretruau.domain.waitingroom;

public enum RoomAction {

    JOIN("Join"),
    EXIT("Exit")
    ;

    String action;

    RoomAction(String action) {
        this.action = action;
    }
}
