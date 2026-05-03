package com.Cafeboookingsystem.Entity;



import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.ArrayList;


@NamedQuery(name = "User.findByEmail",query="Select U from User U where U.email=:email")
@Entity

@Data

@Table(name= "User")
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name="name")

    private String name;

    @Column(name="email", nullable=false)

    private String email;

    @Column(name="status", nullable = false)

    private String status;

    @Column(name="password", nullable = false)
    private String password;

    @Column(name="role")
    private String role;

    @Column(name="createdAt")

    private String createdAt;

    @Column(name="modifiedAt")

    private String modifiedAt;

    @Column(name="ContactNumber")

    private String contactNumber;



}
