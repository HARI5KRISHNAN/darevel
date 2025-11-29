package com.darevel.search.dto;

import java.util.List;

public record SuggestionResponse(
        String query,
        List<String> suggestions) {
}
