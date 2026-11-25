package com.brewlog.repository;

import com.brewlog.entity.BrewMethod;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrewMethodRepository extends JpaRepository<BrewMethod, Long> {

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<BrewMethod> findByIsProtectedTrue();
}
