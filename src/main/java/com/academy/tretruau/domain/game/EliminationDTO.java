package com.academy.tretruau.domain.game;

import java.util.List;

public record EliminationDTO(String player, String roomId, List<String> alivePlayers) {
}
