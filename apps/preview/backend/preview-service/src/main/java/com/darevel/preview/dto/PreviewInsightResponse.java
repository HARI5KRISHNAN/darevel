package com.darevel.preview.dto;

public class PreviewInsightResponse {

    private String summary;
    private String[] highlights;

    public PreviewInsightResponse() {
    }

    public PreviewInsightResponse(String summary, String[] highlights) {
        this.summary = summary;
        this.highlights = highlights;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String[] getHighlights() {
        return highlights;
    }

    public void setHighlights(String[] highlights) {
        this.highlights = highlights;
    }
}
