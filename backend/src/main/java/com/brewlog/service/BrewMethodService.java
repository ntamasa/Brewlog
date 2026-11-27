package com.brewlog.service;

import com.brewlog.dto.MethodResponse;
import com.brewlog.repository.BrewMethodRepository;
import com.brewlog.repository.MethodWithCount;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BrewMethodService {

    private static final Comparator<MethodResponse> ORDER = Comparator.comparing((MethodResponse m) -> m.isProtected())
            .thenComparing(MethodResponse::name, String.CASE_INSENSITIVE_ORDER);

    private final BrewMethodRepository brewMethodRepository;

    public BrewMethodService(BrewMethodRepository brewMethodRepository) {
        this.brewMethodRepository = brewMethodRepository;
    }

    public List<MethodResponse> list() {
        return brewMethodRepository.findAllWithBrewCount().stream()
                .map(BrewMethodService::toResponse)
                .sorted(ORDER)
                .toList();
    }

    private static MethodResponse toResponse(MethodWithCount row) {
        return new MethodResponse(
                row.getMethod().getId(),
                row.getMethod().getName(),
                row.getMethod().getIconKey(),
                row.getMethod().isPredefined(),
                row.getMethod().isProtected(),
                row.getMethod().getPosition(),
                row.getBrewCount());
    }
}
