package com.brewlog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Generated;

@Entity
@Table(name = "brew")
public class Brew {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "bean_name", nullable = false, length = 100)
    private String beanName;

    @Column(name = "origin", nullable = false, length = 100)
    private String origin;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "method_id", nullable = false)
    private BrewMethod method;

    @Enumerated(EnumType.STRING)
    @Column(name = "roast", nullable = false, length = 6)
    private Roast roast;

    @Column(name = "rating", nullable = false)
    private short rating;

    @Column(name = "brew_date", nullable = false)
    private LocalDate brewDate;

    @Column(name = "notes", length = 2000)
    private String notes;

    @Generated
    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    protected Brew() {}

    public Brew(
            String name,
            String beanName,
            String origin,
            BrewMethod method,
            Roast roast,
            int rating,
            LocalDate brewDate,
            String notes) {
        this.name = name;
        this.beanName = beanName;
        this.origin = origin;
        this.method = method;
        this.roast = roast;
        this.rating = (short) rating;
        this.brewDate = brewDate;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getBeanName() {
        return beanName;
    }

    public String getOrigin() {
        return origin;
    }

    public BrewMethod getMethod() {
        return method;
    }

    public Roast getRoast() {
        return roast;
    }

    public int getRating() {
        return rating;
    }

    public LocalDate getBrewDate() {
        return brewDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setBeanName(String beanName) {
        this.beanName = beanName;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public void setMethod(BrewMethod method) {
        this.method = method;
    }

    public void setRoast(Roast roast) {
        this.roast = roast;
    }

    public void setRating(int rating) {
        this.rating = (short) rating;
    }

    public void setBrewDate(LocalDate brewDate) {
        this.brewDate = brewDate;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
