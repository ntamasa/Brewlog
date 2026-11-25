package com.brewlog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "brew_method")
public class BrewMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "icon_key", nullable = false, length = 20)
    private String iconKey;

    @Column(name = "predefined", nullable = false)
    private boolean predefined;

    @Column(name = "is_protected", nullable = false)
    private boolean isProtected;

    @Column(name = "position")
    private Integer position;

    protected BrewMethod() {}

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getIconKey() {
        return iconKey;
    }

    public boolean isPredefined() {
        return predefined;
    }

    public boolean isProtected() {
        return isProtected;
    }

    public Integer getPosition() {
        return position;
    }
}
