package com.academy.tretruau.domain.waitingroom;

import com.academy.tretruau.domain.player.State;
import com.academy.tretruau.domain.player.TempPlayer;
import com.academy.tretruau.utils.TinyIdGenerator;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WaitingRoom {

    private String id;
    private String name;
    private int playersLimit;
    private List<TempPlayer> players = new ArrayList<>();
    private Long playerId = 0L;
    private int playeds = 0;
    private State state = State.WAITING;
    private List<TempPlayer> alivePlayers = new ArrayList<>();

    private static Random random = new Random();



    public WaitingRoom(int playersLimit, String name) {
        this.id = TinyIdGenerator.generateTinyId(4);
        this.playersLimit = playersLimit;
        this.name = name;
    }

    public void addPlayer(TempPlayer tempPlayer) {
        tempPlayer.setId(playerId++);
        players.add(tempPlayer);
    }

    public void removePlayer(String name) {

        for (int i = 0; i < players.size(); i++) {
            if (players.get(i).getName().equals(name)) {
                players.remove(i);
                return;
            }
        }

    }

    public Optional<TempPlayer> getPlayerByUsername(String username) {
        for (int i = 0; i < players.size(); i++) {
            if (players.get(i).getName().equals(username)) {
                return Optional.ofNullable(players.get(i));
            }
        }

        return Optional.empty();
    }

    public TempPlayer getRandomPlayerExcludesFrom(String username) {

        List<TempPlayer> playersCopy = new ArrayList<>(alivePlayers);
        playersCopy.removeIf(tempPlayer -> { return tempPlayer.getName().equals(username); });
        return playersCopy.get(random.nextInt(playersCopy.size()));
    }

    public void increaseMatchesPlayeds() {
        this.playeds++;
    }

}
