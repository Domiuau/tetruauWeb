package com.academy.tretruau.domain.player;


import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class TempPlayer {

    private Long id;
    private String name;
    private int wins;
    private int linesSend;

    public TempPlayer(Long id, String name) {
        this.name = name;
        this.id = id;

    }

    public TempPlayer(String nome) {
        this.name = nome;

    }

    public void increaseWins() {
        this.wins++;
    }

    public void increaseLinesSend(int linesSend) {
        this.linesSend += linesSend;
    }

    public void resetLinesSend() {
        this.linesSend = 0;
    }
}
