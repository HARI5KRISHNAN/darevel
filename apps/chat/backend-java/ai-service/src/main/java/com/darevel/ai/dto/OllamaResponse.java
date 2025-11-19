package com.darevel.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OllamaResponse {
    private String model;
    private String created_at;
    private String response;
    private Boolean done;
    private List<Integer> context;
    private Long total_duration;
    private Long load_duration;
    private Long prompt_eval_count;
    private Long prompt_eval_duration;
    private Long eval_count;
    private Long eval_duration;
}
