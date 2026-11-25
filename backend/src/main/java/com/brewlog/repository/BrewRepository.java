package com.brewlog.repository;

import com.brewlog.entity.Brew;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrewRepository extends JpaRepository<Brew, Long> {

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<Brew> findByMethodId(long methodId);

    long countByMethodId(long methodId);
}
