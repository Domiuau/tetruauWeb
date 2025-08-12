package com.academy.tretruau.domain.game;

import com.academy.tretruau.domain.player.TempPlayer;

import java.util.List;

public record EndGameDTO(String winner, List<TempPlayer> players) {
}
