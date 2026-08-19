from pydantic import BaseModel
from pydantic import BaseModel


class UserUpdate(BaseModel):
    name: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str    