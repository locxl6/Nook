class Settings:
    def __init__(self):
        self.ollama_default_model = "qwen2.5:1.5b"
        self.sensitive_words_file = "app/data/sensitive.txt"

setting = Settings()