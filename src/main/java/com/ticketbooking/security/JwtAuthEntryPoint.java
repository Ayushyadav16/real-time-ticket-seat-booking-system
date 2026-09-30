package com.ticketbooking.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketbooking.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpServletResponse.SC_UNAUTHORIZED,
                "UNAUTHORIZED",
                authException.getMessage() != null ? authException.getMessage() : "Full authentication is required to access this resource",
                request.getRequestURI()
        );

        String json = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                errorResponse.getTimestamp(),
                errorResponse.getStatus(),
                errorResponse.getError(),
                errorResponse.getMessage().replace("\"", "\\\""),
                errorResponse.getPath()
        );

        response.getWriter().write(json);
    }
}
