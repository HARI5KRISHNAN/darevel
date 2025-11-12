package com.darevel.spreadsheet.dto;

import jakarta.validation.constraints.NotBlank;

public class SheetRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String data;

    private String merges;

    // Constructors
    public SheetRequest() {
    }

    public SheetRequest(String name, String data, String merges) {
        this.name = name;
        this.data = data;
        this.merges = merges;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getMerges() {
        return merges;
    }

    public void setMerges(String merges) {
        this.merges = merges;
    }
}
