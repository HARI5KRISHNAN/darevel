package com.darevel.mail.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;

@Converter
public class StringArrayConverter implements AttributeConverter<String[], String> {

    @Override
    public String convertToDatabaseColumn(String[] attribute) {
        if (attribute == null || attribute.length == 0) {
            return "{}";
        }
        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < attribute.length; i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escapeString(attribute[i])).append("\"");
        }
        sb.append("}");
        return sb.toString();
    }

    @Override
    public String[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty() || dbData.equals("{}")) {
            return new String[0];
        }
        // Remove curly braces
        String content = dbData.substring(1, dbData.length() - 1);
        if (content.isEmpty()) {
            return new String[0];
        }

        // Handle quoted strings with commas inside
        java.util.List<String> result = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < content.length(); i++) {
            char c = content.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(unescapeString(current.toString().trim()));
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        if (current.length() > 0) {
            result.add(unescapeString(current.toString().trim()));
        }

        return result.toArray(new String[0]);
    }

    private String escapeString(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String unescapeString(String s) {
        if (s == null) return "";
        // Remove surrounding quotes if present
        if (s.startsWith("\"") && s.endsWith("\"")) {
            s = s.substring(1, s.length() - 1);
        }
        return s.replace("\\\"", "\"").replace("\\\\", "\\");
    }
}
