package com.academy.tretruau.domain.game;

import java.util.List;

public record UpdateGameDTO(List<List<Integer>> grid, List<List<Integer>> gridHold, List<List<Integer>> gridNext, String room, String from, Boolean increaseSpeed) {
}
