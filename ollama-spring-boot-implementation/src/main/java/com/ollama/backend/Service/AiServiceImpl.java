package com.ollama.backend.Service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AiServiceImpl implements AiService{

    private final ChatClient client;

    public AiServiceImpl(ChatClient.Builder builder){
        this.client = builder.build();
    }

    @Override
    public String askAi(String question) {
        System.out.println("Asking AI: " + question); // Debug log
        return client.prompt(question).call().content();
    }

    @Override
    public Flux<String> streamResponse(String question){
        System.out.println("Streaming response for: " + question); // Debug log
        return this.client.prompt().user(question).stream().content();
    }
}


























//package com.ollama.backend.Service;
//
//import org.springframework.ai.chat.client.ChatClient;
//import org.springframework.cache.annotation.Cacheable;
//import org.springframework.stereotype.Service;
//import reactor.core.publisher.Flux;
//import reactor.core.publisher.Mono;
//
//@Service
//public class AiServiceImpl implements AiService {
//
//    private final ChatClient client;
//
//    // Constructor injection for ChatClient Builder
//    public AiServiceImpl(ChatClient.Builder builder) {
//        this.client = builder.build();
//    }
//
//    // Method to get AI response (Single response)
//    @Override
//    @Cacheable(value = "aiResponses", key = "#question")  // Caching AI responses for faster retrieval
//    public Mono<String> askAi(String question) {
//        // Call the AI model and get the response
//        String response = client.prompt(question).call().content();
//        return Mono.just(response);
//    }
//
//    // Method to stream AI responses (Multiple responses)
//    @Override
//    public Flux<String> streamResponse(String question) {
//        // Stream the response from the AI model
//        return this.client.prompt().user(question).stream().content();
//    }
//}
