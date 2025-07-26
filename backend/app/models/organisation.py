from sqlalchemy import Column, Integer, String, Text, DateTime
from .base import BaseModel

class Organization(BaseModel):
    __tablename__ = "organizations"
    
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100), nullable=False)  # logistics, supplier, customer
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<Organization(name='{self.name}', type='{self.type}')>"