package com.academy.tretruau.domain.waitingroom;

import com.academy.tretruau.domain.player.TempPlayer;

import java.util.List;

public record RoomActionDTO(RoomAction action, String username, Long playerId, int matchesPlayed, List<TempPlayer> players) {
}
