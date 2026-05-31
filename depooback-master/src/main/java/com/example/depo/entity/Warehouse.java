package com.example.depo.entity;

import jakarta.persistence.*;

@Entity
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (nullable = false, length = 100)
    private String name;
    
    @Column(length = 200)
    private String location;
}
