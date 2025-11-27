package com.darevel.mail.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolderCountsDTO {
    private int inbox;
    private int sent;
    private int important;
    private int spam;
    private int trash;
    private int draft;
}
