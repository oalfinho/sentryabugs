from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")
    
    app_name: str = "Sentrya API"
    debug: bool = True
    
    telegram_token: str = ""
    telegram_chat_id: str = ""
   
settings = Settings()