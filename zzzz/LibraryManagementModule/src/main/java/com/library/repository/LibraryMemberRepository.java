package com.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.library.entity.LibraryMember;

public interface LibraryMemberRepository extends JpaRepository<LibraryMember, Long>{

}
