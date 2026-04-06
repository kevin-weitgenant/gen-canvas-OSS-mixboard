from pydantic_settings import BaseSettings, SettingsConfigDict


GROQ_MODEL = "llama-3.3-70b-versatile"


class Settings(BaseSettings):
    kie_ai_api_key: str
    groq_api_key: str
    server_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()  # type: ignore[call-arg]
