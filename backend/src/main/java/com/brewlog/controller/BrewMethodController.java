package com.brewlog.controller;

import com.brewlog.dto.MethodResponse;
import com.brewlog.service.BrewMethodService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/methods")
public class BrewMethodController {

    private final BrewMethodService brewMethodService;

    public BrewMethodController(BrewMethodService brewMethodService) {
        this.brewMethodService = brewMethodService;
    }

    @GetMapping
    public List<MethodResponse> list() {
        return brewMethodService.list();
    }
}
