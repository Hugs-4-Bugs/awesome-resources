package com.library.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.library.entity.Book;
import com.library.service.BookService;

@RestController
@RequestMapping("/api/books")
public class BookController {
	@Autowired
    private BookService bookService;
	
	@PostMapping
	public Book createBook(@RequestBody Book book) {
	    return bookService.createBook(book);
	}
	
	@GetMapping
	public List<Book> getAllBooks() {
	    return bookService.getAllBooks();
	}
	
	@GetMapping("/{id}")
	public Optional<Book> getBookById(@PathVariable Long id) {
	    return bookService.getBookById(id);
	}
	
	@PutMapping("/{id}")
	public Book updateBook(@PathVariable Long id, @RequestBody Book updatedBook) {
	    return bookService.updateBook(id, updatedBook);
	}
	
	@DeleteMapping("/{id}")
	public void deleteBook(@PathVariable Long id) {
	    bookService.deleteBook(id);
	}

}
