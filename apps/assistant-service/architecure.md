                           Frontend
                              │
                              ▼
                   FastAPI (assistant-service)
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
 Authentication         Conversation           Assistant
                         Management            Orchestration
                                                   │
                                                   ▼
                                             Prompt Builder
                                                   │
                                                   ▼
                                             LLM Provider
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                                Tool Layer                Direct Response
                                     │
                   ┌─────────────────┼──────────────────┐
                   ▼                 ▼                  ▼
            Product Client     Order Client      Payment Client
                   │                 │                  │
                   ▼                 ▼                  ▼
          Product Service    Order Service     Payment Service